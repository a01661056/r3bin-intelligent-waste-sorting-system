#ifndef F_CPU
#define F_CPU 8000000UL
#endif

#include <avr/io.h>
#include <stdint.h>
#include <util/delay.h>

/* ============================================================
   NEMA 17 / DRV8825 SECTOR CALIBRATION PROGRAM

   Purpose:
   - Home by rotating backward until the KW11 switch triggers.
   - If KW11 is not reached within 7 seconds on the first pass, assume home.
   - Home a second time with a 3 second timeout.
   - Treat home as sector 0 / starting position, then move to the requested sector.

   This file is only for mechanical calibration of the rotating
   disk. It does not use LCD, UART, sensors, servos, or PCA9685.
   ============================================================ */

/* ============================================================
   PIN ASSIGNMENT
   Matches the R3Bin ATmega16 pin planner.
   ============================================================ */

#define DRV_STEP   PB0  // DRV8825 STEP pin. One rising pulse = one microstep.
#define DRV_DIR    PB1  // DRV8825 DIR pin. Change HIGH/LOW if rotation is reversed.
#define DRV_ENABLE PB2  // DRV8825 ENABLE pin. On DRV8825, LOW = enabled.
#define KW11_HOME  PB6  // KW11 home switch input. Use switch to GND + internal pull-up.

/* ============================================================
   USER CALIBRATION PARAMETERS
   Change these first when tuning the real mechanism.
   ============================================================ */

#define SECTOR_COUNT 6

// Direct physical calibration:
// Sector 0 is the KW11 home position. The other sector values are absolute
// step positions measured from that home point, not assumed symmetric angles.
// Tell me your real measured values and we will replace these placeholders.
#define SECTOR_0_POSITION_STEPS 0UL
#define SECTOR_1_POSITION_STEPS 75UL
#define SECTOR_2_POSITION_STEPS 105UL
#define SECTOR_3_POSITION_STEPS 125UL
#define SECTOR_4_POSITION_STEPS 155UL
#define SECTOR_5_POSITION_STEPS 190UL

// Full calibrated cycle length. This is used only when wrapping from sector 5
// back to sector 0. Update it after you measure the full return/home cycle.
#define STEPS_PER_ROTATION 588UL

// Total calibrated step pulses for one full 360-degree disk revolution.
#define STEPPER_TOTAL_STEPS STEPS_PER_ROTATION

// Wait time before moving to the next sector.
// Default: 5000 ms = 5 seconds.
#define WAIT_BETWEEN_SECTORS_MS 5000UL

// Direction calibration:
// 1 = PB1 HIGH during movement.
// 0 = PB1 LOW during movement.
// Change this if the sector-to-sector rotation goes the wrong way.
#define STEPPER_DIR_HIGH_FOR_FORWARD 1

// KW11 home-switch calibration:
// 1 = triggered switch reads LOW. Use this when PB6 has internal pull-up
//     and the KW11 connects PB6 to GND when pressed.
// 0 = triggered switch reads HIGH. Use this only if you wire an external
//     pull-down and the switch connects PB6 to +5V when pressed.
#define KW11_ACTIVE_LOW 1

// Homing timeout:
// If KW11 is not reached within this time, stop searching and assume the disk
// is already in the starting/home position. This prevents endless grinding if
// the switch is stuck, disconnected, or already sitting near home.
#define HOMING_TIMEOUT_MS 5000UL
#define SECOND_HOMING_TIMEOUT_MS 2000UL
#define HOME_STEP_PERIOD_US ((uint32_t)HOME_STEP_HIGH_US + (uint32_t)HOME_STEP_LOW_US)
#define HOMING_TIMEOUT_STEPS ((uint16_t)((HOMING_TIMEOUT_MS * 1000UL) / HOME_STEP_PERIOD_US))
#define SECOND_HOMING_TIMEOUT_STEPS ((uint16_t)((SECOND_HOMING_TIMEOUT_MS * 1000UL) / HOME_STEP_PERIOD_US))

// Debounce confirmation:
// Number of consecutive triggered reads needed before accepting home.
#define KW11_DEBOUNCE_READS 5

// Short mechanical settling pause between the first and second homing pass.
// Increase this if the KW11 bounce makes the second pass count too early.
#define KW11_SECOND_HOME_DELAY_MS 500UL

// Enable calibration:
// DRV8825 ENABLE is normally active-low, so 1 is correct for most modules.
// Set to 0 only if your driver board behaves inverted.
#define STEPPER_ENABLE_ACTIVE_LOW 1

// Holding calibration:
// Keep this at 1 for your mechanism. The motor stays energized immediately
// after KW11 home and between sectors, locking the disk instead of letting
// momentum carry it past the target position.
// 0 = disable motor after every move. Cooler, but the disk may drift.
#define KEEP_MOTOR_ENABLED_BETWEEN_SECTORS 1

// Speed calibration:
// Lower values = faster rotation but less torque margin.
// Higher values = slower, smoother, more reliable.
// First physical KW11 test uses 4000/4000 so the disk moves very slowly.
// To speed up later, try 3000/3000, then 2000/2000, then 1500/1500.
#define STEP_HIGH_US 4000
#define STEP_LOW_US  4000

// Homing speed calibration:
// This is intentionally much slower than normal sector movement so the tab
// approaches the KW11 gently and stops without bouncing.
// Lower values = faster homing. Higher values = slower homing.
#define HOME_STEP_HIGH_US 7000
#define HOME_STEP_LOW_US  7000

/* ============================================================
   SMALL DELAY HELPERS
   util/delay works best with compile-time constants, so these
   wrappers build longer waits from fixed 1 ms delays.
   ============================================================ */

static void delay_ms_u32(uint32_t ms)
{
    while (ms > 0) {
        _delay_ms(1);
        ms--;
    }
}

/* ============================================================
   DRV8825 LOW-LEVEL CONTROL
   ============================================================ */

static void stepper_enable(void)
{
#if STEPPER_ENABLE_ACTIVE_LOW
    PORTB &= ~(1 << DRV_ENABLE);
#else
    PORTB |= (1 << DRV_ENABLE);
#endif
}

static void stepper_disable(void)
{
#if STEPPER_ENABLE_ACTIVE_LOW
    PORTB |= (1 << DRV_ENABLE);
#else
    PORTB &= ~(1 << DRV_ENABLE);
#endif
}

static void stepper_set_forward_direction(void)
{
#if STEPPER_DIR_HIGH_FOR_FORWARD
    PORTB |= (1 << DRV_DIR);
#else
    PORTB &= ~(1 << DRV_DIR);
#endif
}

static void stepper_set_backward_direction(void)
{
#if STEPPER_DIR_HIGH_FOR_FORWARD
    PORTB &= ~(1 << DRV_DIR);
#else
    PORTB |= (1 << DRV_DIR);
#endif
}

static void stepper_step_once(void)
{
    PORTB |= (1 << DRV_STEP);
    _delay_us(STEP_HIGH_US);

    PORTB &= ~(1 << DRV_STEP);
    _delay_us(STEP_LOW_US);
}

static void stepper_home_step_once(void)
{
    PORTB |= (1 << DRV_STEP);
    _delay_us(HOME_STEP_HIGH_US);

    PORTB &= ~(1 << DRV_STEP);
    _delay_us(HOME_STEP_LOW_US);
}

static void stepper_move_steps(uint16_t steps)
{
    stepper_enable();

    for (uint16_t i = 0; i < steps; i++) {
        stepper_step_once();
    }

#if !KEEP_MOTOR_ENABLED_BETWEEN_SECTORS
    stepper_disable();
#endif
}

/* ============================================================
   KW11 HOME SWITCH
   ============================================================ */

static uint8_t kw11_is_triggered(void)
{
#if KW11_ACTIVE_LOW
    return (PINB & (1 << KW11_HOME)) == 0;
#else
    return (PINB & (1 << KW11_HOME)) != 0;
#endif
}

static uint8_t kw11_is_triggered_debounced(void)
{
    for (uint8_t i = 0; i < KW11_DEBOUNCE_READS; i++) {
        if (!kw11_is_triggered()) {
            return 0;
        }

        _delay_ms(2);
    }

    return 1;
}

static uint8_t stepper_home_to_kw11_with_timeout(uint16_t timeoutSteps)
{
    stepper_enable();
    stepper_set_backward_direction();

    for (uint16_t i = 0; i < timeoutSteps; i++) {
        if (kw11_is_triggered_debounced()) {
#if !KEEP_MOTOR_ENABLED_BETWEEN_SECTORS
            stepper_disable();
#endif
            return 1;
        }

        stepper_home_step_once();
    }

    // Timeout means "assume home" for this calibration flow, matching atmega16.c.
    return 1;
}

static uint8_t stepper_home_to_kw11(void)
{
    return stepper_home_to_kw11_with_timeout(HOMING_TIMEOUT_STEPS);
}

static uint8_t stepper_home_to_kw11_second_pass(void)
{
    return stepper_home_to_kw11_with_timeout(SECOND_HOMING_TIMEOUT_STEPS);
}

static uint8_t stepper_home_twice_before_sector(void)
{
    if (!stepper_home_to_kw11()) {
        return 0;
    }

    delay_ms_u32(KW11_SECOND_HOME_DELAY_MS);

    return stepper_home_to_kw11_second_pass();
}

/* ============================================================
   SECTOR POSITIONING

   These are absolute step positions measured from KW11 home. This lets us
   compensate for the real disk not behaving symmetrically because one side
   has more weight.
   ============================================================ */

static uint16_t sector_position_steps(uint8_t sector)
{
    switch (sector) {
        case 0: return SECTOR_0_POSITION_STEPS;
        case 1: return SECTOR_1_POSITION_STEPS;
        case 2: return SECTOR_2_POSITION_STEPS;
        case 3: return SECTOR_3_POSITION_STEPS;
        case 4: return SECTOR_4_POSITION_STEPS;
        case 5: return SECTOR_5_POSITION_STEPS;
        default: return SECTOR_0_POSITION_STEPS;
    }
}

static void move_home_to_sector(uint8_t sector)
{
    uint16_t targetPosition = sector_position_steps(sector);

    stepper_set_forward_direction();
    stepper_move_steps(targetPosition);
}

/* ============================================================
   MAIN
   ============================================================ */

int main(void)
{
    uint8_t sector = 0;

    DDRB |=
        (1 << DRV_STEP) |
        (1 << DRV_DIR) |
        (1 << DRV_ENABLE);

    DDRB &= ~(1 << KW11_HOME);

#if KW11_ACTIVE_LOW
    PORTB |= (1 << KW11_HOME);  // Internal pull-up enabled for switch-to-GND wiring.
#else
    PORTB &= ~(1 << KW11_HOME); // No pull-up for external pull-down wiring.
#endif

    PORTB &= ~(1 << DRV_STEP);
    stepper_set_forward_direction();
    stepper_disable();

    while (1) {
        stepper_home_twice_before_sector();
        delay_ms_u32(WAIT_BETWEEN_SECTORS_MS);

        move_home_to_sector(sector);
        delay_ms_u32(WAIT_BETWEEN_SECTORS_MS);

        sector++;

        if (sector >= SECTOR_COUNT) {
            sector = 0;
        }
    }

    return 0;
}

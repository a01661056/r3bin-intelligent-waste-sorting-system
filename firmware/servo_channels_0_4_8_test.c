#define F_CPU 8000000UL

#include <avr/io.h>
#include <stdint.h>
#include <util/delay.h>

typedef uint8_t bool;

/* ============================================================
   I2C / TWI DEFINITIONS
   ============================================================ */

#define F_I2C 100000LL

#define TRANSMISSION_SUCCESS -1
#define TRANSMISSION_ERROR   -2

#define MASTER_TRANSMITTER 0
#define MASTER_RECEIVER    1

static bool masterMode;

/* ============================================================
   PCA9685 / SERVO DEFINITIONS
   ============================================================ */

#define SERVO0 0x06

#define NEUTRAL_PULSE 1500
#define MAX_PULSE     2600
#define MIN_PULSE     900
#define MAX_ANGLE     90

#define PHOTO_BOOTH_LEFT_SERVO_CHANNEL    4
#define PHOTO_BOOTH_RIGHT_SERVO_CHANNEL   8

// Same calibrated hold/drop angles used in atmega16.c.
#define PHOTO_BOOTH_LEFT_HOLD_ANGLE       10
#define PHOTO_BOOTH_LEFT_DROP_ANGLE      -40

#define PHOTO_BOOTH_RIGHT_HOLD_ANGLE     -35
#define PHOTO_BOOTH_RIGHT_DROP_ANGLE      12

#define PHOTO_BOOTH_SWEEP_STEP_DEG 5
#define PHOTO_BOOTH_SWEEP_DELAY_MS 25
#define PHOTO_BOOTH_DROP_TIME_MS 2000

uint16_t globalFrequency;
uint8_t globalAddress;

/* ============================================================
   DELAY HELPER
   ============================================================ */

void delay_ms_variable(uint16_t ms)
{
    while (ms > 0) {
        _delay_ms(1);
        ms--;
    }
}

/* ============================================================
   I2C / TWI FUNCTIONS
   ============================================================ */

void i2c_init(void)
{
    TWSR &= ~((1 << TWPS1) | (1 << TWPS0));
    TWBR = ((F_CPU / F_I2C) - 16) / 2;
}

int8_t i2c_tx_start(bool mode)
{
    int8_t status = 0;

    masterMode = mode;

    TWCR |= (1 << TWINT) | (1 << TWSTA) | (1 << TWEN);

    while (!(TWCR & (1 << TWINT)));

    switch (TWSR & 0xF8) {
        case 0x08:
        case 0x10:
            status = TRANSMISSION_SUCCESS;
            break;

        default:
            status = TRANSMISSION_ERROR;
            break;
    }

    return status;
}

int8_t i2c_tx_address(uint8_t address)
{
    int8_t status = 0;

    TWDR = (address << 1) | masterMode;
    TWCR = (1 << TWINT) | (1 << TWEN);

    while (!(TWCR & (1 << TWINT)));

    if (masterMode == MASTER_TRANSMITTER) {
        switch (TWSR & 0xF8) {
            case 0x18:
                status = TRANSMISSION_SUCCESS;
                break;

            default:
                status = TRANSMISSION_ERROR;
                break;
        }
    } else {
        switch (TWSR & 0xF8) {
            case 0x40:
                status = TRANSMISSION_SUCCESS;
                break;

            default:
                status = TRANSMISSION_ERROR;
                break;
        }
    }

    return status;
}

int8_t i2c_tx_byte(uint8_t byteData)
{
    int8_t status = 0;

    TWDR = byteData;
    TWCR |= (1 << TWINT);

    while (!(TWCR & (1 << TWINT)));

    switch (TWSR & 0xF8) {
        case 0x28:
            status = TRANSMISSION_SUCCESS;
            break;

        default:
            status = TRANSMISSION_ERROR;
            break;
    }

    return status;
}

void i2c_tx_stop(void)
{
    TWCR |= (1 << TWINT) | (1 << TWSTO);

    while (TWCR & (1 << TWSTO));
}

/* ============================================================
   PCA9685 / SERVO FUNCTIONS
   ============================================================ */

void pca9685_init(uint8_t address, uint16_t freq)
{
    globalFrequency = freq;
    globalAddress = address;

    i2c_init();

    i2c_tx_start(MASTER_TRANSMITTER);
    i2c_tx_address(0x40 + address);
    i2c_tx_byte(0x00);
    i2c_tx_byte(0b00110001);
    i2c_tx_stop();

    _delay_ms(1);

    volatile uint8_t prescalar =
        (25000000 / ((float)4096 * freq * 0.92)) - 1;

    i2c_tx_start(MASTER_TRANSMITTER);
    i2c_tx_address(0x40 + address);
    i2c_tx_byte(0xFE);
    i2c_tx_byte(prescalar);
    i2c_tx_stop();

    _delay_ms(1);

    i2c_tx_start(MASTER_TRANSMITTER);
    i2c_tx_address(0x40 + address);
    i2c_tx_byte(0x00);
    i2c_tx_byte(0b10100001);
    i2c_tx_stop();

    _delay_ms(1);

    i2c_tx_start(MASTER_TRANSMITTER);
    i2c_tx_address(0x40 + address);
    i2c_tx_byte(0x01);
    i2c_tx_byte(0b00000100);
    i2c_tx_stop();
}

void pca9685_servo(uint8_t servoNum, float angle)
{
    if (angle > 90) {
        angle = 90;
    } else if (angle < -90) {
        angle = -90;
    }

    uint16_t pulse_us =
        NEUTRAL_PULSE +
        angle * ((float)(MAX_PULSE - MIN_PULSE) / (2 * MAX_ANGLE));

    uint16_t period_us = (float)1000000 / globalFrequency;
    uint16_t count = ((float)pulse_us / period_us) * 4096;

    uint8_t offLowCmnd = count;
    uint8_t offHighCmnd = count >> 8;

    i2c_tx_start(MASTER_TRANSMITTER);
    i2c_tx_address(0x40 + globalAddress);
    i2c_tx_byte(SERVO0 + (4 * servoNum));
    i2c_tx_byte(0x00);
    i2c_tx_byte(0x00);
    i2c_tx_byte(offLowCmnd);
    i2c_tx_byte(offHighCmnd);
    i2c_tx_stop();
}

uint8_t abs_i16(int16_t value)
{
    if (value < 0) {
        value = -value;
    }

    if (value > 255) {
        return 255;
    }

    return (uint8_t)value;
}

void photo_booth_set_pair(int16_t leftAngle, int16_t rightAngle)
{
    pca9685_servo(PHOTO_BOOTH_LEFT_SERVO_CHANNEL, leftAngle);
    pca9685_servo(PHOTO_BOOTH_RIGHT_SERVO_CHANNEL, rightAngle);
}

void photo_booth_sweep_pair(
    int16_t leftFrom,
    int16_t leftTo,
    int16_t rightFrom,
    int16_t rightTo
)
{
    uint8_t maxTravel = abs_i16(leftTo - leftFrom);
    uint8_t rightTravel = abs_i16(rightTo - rightFrom);
    uint8_t steps;

    if (rightTravel > maxTravel) {
        maxTravel = rightTravel;
    }

    if (PHOTO_BOOTH_SWEEP_STEP_DEG == 0) {
        steps = maxTravel;
    } else {
        steps = maxTravel / PHOTO_BOOTH_SWEEP_STEP_DEG;
    }

    if (steps == 0) {
        steps = 1;
    }

    for (uint8_t i = 0; i <= steps; i++) {
        int16_t leftAngle = leftFrom + ((int32_t)(leftTo - leftFrom) * i / steps);
        int16_t rightAngle = rightFrom + ((int32_t)(rightTo - rightFrom) * i / steps);

        photo_booth_set_pair(leftAngle, rightAngle);
        delay_ms_variable(PHOTO_BOOTH_SWEEP_DELAY_MS);
    }

    photo_booth_set_pair(leftTo, rightTo);
}

void photo_booth_drop_position(void)
{
    photo_booth_sweep_pair(
        PHOTO_BOOTH_LEFT_HOLD_ANGLE,
        PHOTO_BOOTH_LEFT_DROP_ANGLE,
        PHOTO_BOOTH_RIGHT_HOLD_ANGLE,
        PHOTO_BOOTH_RIGHT_DROP_ANGLE
    );

    delay_ms_variable(PHOTO_BOOTH_DROP_TIME_MS);

    photo_booth_sweep_pair(
        PHOTO_BOOTH_LEFT_DROP_ANGLE,
        PHOTO_BOOTH_LEFT_HOLD_ANGLE,
        PHOTO_BOOTH_RIGHT_DROP_ANGLE,
        PHOTO_BOOTH_RIGHT_HOLD_ANGLE
    );
}

int main(void)
{
    pca9685_init(0x00, 50);
    _delay_ms(200);

    photo_booth_set_pair(PHOTO_BOOTH_LEFT_HOLD_ANGLE, PHOTO_BOOTH_RIGHT_HOLD_ANGLE);

    _delay_ms(1500);

    while (1) {
        photo_booth_drop_position();
        _delay_ms(1500);
    }

    return 0;
}

#define F_CPU 8000000UL

#include <avr/io.h>
#include <avr/eeprom.h>
#include <avr/pgmspace.h>
#include <stdint.h>
#include <string.h>
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

// 0 = skip I2C/PCA9685 and servo commands for diagnostics.
// 1 = complete system behavior with servos driven through the PCA9685.
#define SERVO_SYSTEM_ENABLED 1

#define SERVO0 0x06

#define NEUTRAL_PULSE 1500
#define MAX_PULSE     2600
#define MIN_PULSE     900
#define MAX_ANGLE     90

#define LID_SERVO_CHANNEL            0
#define PHOTO_BOOTH_LEFT_SERVO_CHANNEL   4
#define PHOTO_BOOTH_RIGHT_SERVO_CHANNEL  8

// Lid MG996R on PCA9685 channel 0.
// Increase/decrease these if the lid does not fully close/open mechanically.
#define LID_CLOSED_ANGLE 0
#define LID_OPEN_ANGLE   -90

// Lid motion speed.
// Bigger step = faster but less smooth. Bigger delay = slower and gentler.
#define LID_SWEEP_STEP_DEG 5
#define LID_SWEEP_DELAY_MS 25

// Left photo-booth/drop MG996R on PCA9685 channel 4.
// Hold = picture/classification position.
// Drop = final tilt to release the object into the slide.
#define PHOTO_BOOTH_LEFT_HOLD_ANGLE    10
#define PHOTO_BOOTH_LEFT_DROP_ANGLE     -40

// Right photo-booth/drop MG996R on PCA9685 channel 8.
// It should mirror channel 4, but it is independent for real-life calibration.
#define PHOTO_BOOTH_RIGHT_HOLD_ANGLE     -35
#define PHOTO_BOOTH_RIGHT_DROP_ANGLE      12

// Photo-booth/drop motion speed.
// Bigger step = faster but less smooth. Bigger delay = slower and gentler.
#define PHOTO_BOOTH_SWEEP_STEP_DEG 5
#define PHOTO_BOOTH_SWEEP_DELAY_MS 25

// Time held at the drop angle before the photo booth returns to hold position.
#define PHOTO_BOOTH_DROP_TIME_MS 2000

uint16_t globalFrequency;
uint8_t globalAddress;

/* ============================================================
   PIN DEFINITIONS
   ============================================================ */

#define POT_MODE_SELECTOR PA0
#define GAME_HIGH_SCORE_RESET_BUTTON PA1
#define STATS_COUNT_RESET_BUTTON     PA3

// PA2, PA4, PA5, PA6, and PA7 are currently unused after removing FC-51 sensors.

#define DRV_STEP   PB0
#define DRV_DIR    PB1
#define DRV_ENABLE PB2

#define LCD_D5 PB3
#define LCD_D6 PB4
#define LCD_D7 PB5

#define KW11_HOME PB6

#define LED_METAL     PC2
#define LED_ORGANIC   PC3
#define LED_PAPER     PC4
#define LED_PLASTIC   PC5
#define LED_BATTERIES PC6
#define LED_OTHER     PC7

#define UART_RX PD0
#define UART_TX PD1

#define HCSR04_ECHO PD2
#define HCSR04_TRIG PD3

#define BUZZER PD4

#define LCD_RS PD5
#define LCD_E  PD6
#define LCD_D4 PD7

/* ============================================================
   SYSTEM SETTINGS
   ============================================================ */

#define HAND_DETECT_CM 15
#define UART_BAUD_9600_8MHZ 51
#define OBJECT_DROP_WINDOW_MS 5000
#define OBJECT_DROP_WINDOW_SECONDS (OBJECT_DROP_WINDOW_MS / 1000)
#define RPI_RESPONSE_TIMEOUT_100MS 200

#define LCD_WIDTH 16

// User-facing LCD timing. These do not change servo/stepper motion timing.
#define LCD_QUICK_MESSAGE_MS 1200
#define LCD_READ_MESSAGE_MS 2000
#define LCD_PROMPT_MESSAGE_MS 3000
#define GAME_HIGH_SCORE_MESSAGE_MS 5000
#define GAME_FEEDBACK_MESSAGE_MS 4000

// Reset buttons must be held, not just tapped, to avoid accidental resets.
#define RESET_BUTTON_HOLD_MS 2000
#define RESET_BUTTON_POLL_MS 25

// NEMA/DRV8825 speed calibration copied from the working NEMA calibration file.
// Lower values make the disk rotate faster; higher values rotate slower with more torque margin.
#define STEPPER_STEP_HIGH_US 4000
#define STEPPER_STEP_LOW_US  4000

// Homing is intentionally slower so the KW11 trigger tab reaches the switch gently.
#define STEPPER_HOME_STEP_HIGH_US 7000
#define STEPPER_HOME_STEP_LOW_US  7000

// KW11 home switch on PB6 uses the internal pull-up: not pressed = HIGH, pressed = LOW.
#define KW11_ACTIVE_LOW 1
#define KW11_DEBOUNCE_READS 5

// Sector 0 is the KW11 home position. These measured positions now match the
// physical bin order: 0 other, 1 plastic, 2 paper/cardboard, 3 metal,
// 4 organic, 5 batteries.
#define STEPPER_OTHER_POSITION_STEPS     0
#define STEPPER_PLASTIC_POSITION_STEPS   75
#define STEPPER_PAPER_POSITION_STEPS     105
#define STEPPER_METAL_POSITION_STEPS     125
#define STEPPER_ORGANIC_POSITION_STEPS   155
#define STEPPER_BATTERIES_POSITION_STEPS 190

// Used for clockwise wrap calculations.
#define STEPPER_TOTAL_STEPS 588

// If the KW11 is not reached within this time, stop homing and assume the
// disk is already at the starting position so the mechanism does not grind.
#define STEPPER_HOMING_TIMEOUT_MS 5000UL
#define STEPPER_SECOND_HOMING_TIMEOUT_MS 2000UL
#define KW11_SECOND_HOME_DELAY_MS 500UL
#define KW11_AFTER_SECOND_HOME_DELAY_MS 1000UL
#define STEPPER_HOME_STEP_PERIOD_US ((uint32_t)STEPPER_HOME_STEP_HIGH_US + (uint32_t)STEPPER_HOME_STEP_LOW_US)
#define STEPPER_HOMING_TIMEOUT_STEPS ((uint16_t)((STEPPER_HOMING_TIMEOUT_MS * 1000UL) / STEPPER_HOME_STEP_PERIOD_US))
#define STEPPER_SECOND_HOMING_TIMEOUT_STEPS ((uint16_t)((STEPPER_SECOND_HOMING_TIMEOUT_MS * 1000UL) / STEPPER_HOME_STEP_PERIOD_US))

uint16_t currentDiskPositionSteps = 0;
uint8_t diskIsHomed = 0;

/* ============================================================
   EEPROM
   ============================================================ */

uint8_t EEMEM eepromHighScore;
uint16_t EEMEM eepromBinCounts[6];
uint8_t highScore = 0;
uint16_t binCounts[6];

/* ============================================================
   MODES AND CATEGORIES
   ============================================================ */

typedef enum {
    MODE_STATS = 0,
    MODE_FILTERING = 1,
    MODE_GAME = 2
} SystemMode;

typedef enum {
    CAT_OTHER = 0,
    CAT_METAL = 1,
    CAT_ORGANIC = 2,
    CAT_PAPER = 3,
    CAT_PLASTIC = 4,
    CAT_BATTERIES = 5
} WasteCategory;

typedef enum {
    CLASSIFICATION_OK = 0,
    CLASSIFICATION_NO_OBJECT = 1,
    CLASSIFICATION_TIMEOUT = 2
} ClassificationResult;

/* ============================================================
   FUNCTION PROTOTYPES
   ============================================================ */

void lcd_clear(void);
void lcd_boot_init(void);
void lcd_print(const char *text);
void lcd_print_padded(const char *text);
void lcd_show_two_lines(const char *line0, const char *line1);
void lcd_show_idle_mode(SystemMode mode);
void lcd_print_uint8(uint8_t value);
void lcd_print_uint16(uint16_t value);
void lcd_set_cursor(uint8_t row, uint8_t col);
void lcd_lid_open_countdown(void);

const char* mode_name(SystemMode mode);
const char* category_name(WasteCategory category);

void lid_open(void);
void lid_close(void);
void photo_booth_hold_position(void);
void photo_booth_capture_position(void);
void photo_booth_drop_position(void);
void workspace_light_on(void);
void workspace_light_off(void);

ClassificationResult run_vision_capture(WasteCategory *category);

void stats_increment_category(WasteCategory category);
void stats_reset_counts(void);
uint8_t high_score_reset_if_requested(void);
uint8_t stats_reset_if_requested(void);

void rotate_disk_to_category(WasteCategory category);
void return_disk_to_home(void);

void process_sorted_object(WasteCategory category);

void run_filtering_mode(void);
void run_game_mode(void);
void run_stats_mode(void);

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

void servo_sweep_calibrated(
    uint8_t channel,
    int8_t fromAngle,
    int8_t toAngle,
    uint8_t stepDeg,
    uint16_t stepDelayMs
)
{
#if !SERVO_SYSTEM_ENABLED
    (void)channel;
    (void)fromAngle;
    (void)toAngle;
    (void)stepDeg;
    (void)stepDelayMs;
    return;
#else
    int16_t angle = fromAngle;
    int8_t direction;

    if (stepDeg == 0) {
        stepDeg = 1;
    }

    direction = (fromAngle < toAngle) ? 1 : -1;

    while (
        (direction > 0 && angle < toAngle) ||
        (direction < 0 && angle > toAngle)
    ) {
        pca9685_servo(channel, angle);
        delay_ms_variable(stepDelayMs);
        angle += direction * stepDeg;
    }

    pca9685_servo(channel, toAngle);
    delay_ms_variable(stepDelayMs);
#endif
}

void photo_booth_set_pair(int8_t leftAngle, int8_t rightAngle)
{
#if !SERVO_SYSTEM_ENABLED
    (void)leftAngle;
    (void)rightAngle;
    return;
#else
    pca9685_servo(PHOTO_BOOTH_LEFT_SERVO_CHANNEL, leftAngle);
    pca9685_servo(PHOTO_BOOTH_RIGHT_SERVO_CHANNEL, rightAngle);
#endif
}

void photo_booth_sweep_pair(
    int8_t fromLeftAngle,
    int8_t toLeftAngle,
    int8_t fromRightAngle,
    int8_t toRightAngle
)
{
    uint8_t leftTravel = abs_i16((int16_t)toLeftAngle - fromLeftAngle);
    uint8_t rightTravel = abs_i16((int16_t)toRightAngle - fromRightAngle);
    uint8_t maxTravel = (leftTravel > rightTravel) ? leftTravel : rightTravel;
    uint8_t steps;

    if (PHOTO_BOOTH_SWEEP_STEP_DEG == 0) {
        steps = maxTravel;
    } else {
        steps = maxTravel / PHOTO_BOOTH_SWEEP_STEP_DEG;
    }

    if (steps == 0) {
        steps = 1;
    }

    for (uint8_t i = 0; i <= steps; i++) {
        int8_t leftAngle =
            fromLeftAngle +
            (((int16_t)toLeftAngle - fromLeftAngle) * i) / steps;

        int8_t rightAngle =
            fromRightAngle +
            (((int16_t)toRightAngle - fromRightAngle) * i) / steps;

        photo_booth_set_pair(leftAngle, rightAngle);
        delay_ms_variable(PHOTO_BOOTH_SWEEP_DELAY_MS);
    }
}

void lid_open(void)
{
#if !SERVO_SYSTEM_ENABLED
    lcd_clear();
    lcd_print("Lid skipped");
    lcd_set_cursor(1, 0);
    lcd_print("No PCA9685");
    _delay_ms(500);
#else
    servo_sweep_calibrated(
        LID_SERVO_CHANNEL,
        LID_CLOSED_ANGLE,
        LID_OPEN_ANGLE,
        LID_SWEEP_STEP_DEG,
        LID_SWEEP_DELAY_MS
    );
#endif
}

void lid_close(void)
{
#if !SERVO_SYSTEM_ENABLED
    lcd_clear();
    lcd_print("Lid close skip");
    lcd_set_cursor(1, 0);
    lcd_print("No PCA9685");
    _delay_ms(500);
#else
    servo_sweep_calibrated(
        LID_SERVO_CHANNEL,
        LID_OPEN_ANGLE,
        LID_CLOSED_ANGLE,
        LID_SWEEP_STEP_DEG,
        LID_SWEEP_DELAY_MS
    );
#endif
}

void photo_booth_hold_position(void)
{
#if !SERVO_SYSTEM_ENABLED
    return;
#else
    photo_booth_set_pair(
        PHOTO_BOOTH_LEFT_HOLD_ANGLE,
        PHOTO_BOOTH_RIGHT_HOLD_ANGLE
    );
#endif
}

void photo_booth_capture_position(void)
{
#if !SERVO_SYSTEM_ENABLED
    lcd_clear();
    lcd_print("Photo booth");
    lcd_set_cursor(1, 0);
    lcd_print("Servo skipped");
    _delay_ms(500);
#else
    photo_booth_set_pair(
        PHOTO_BOOTH_LEFT_HOLD_ANGLE,
        PHOTO_BOOTH_RIGHT_HOLD_ANGLE
    );
#endif
}

void photo_booth_drop_position(void)
{
    lcd_clear();
    lcd_print("Dropping waste");
    lcd_set_cursor(1, 0);
#if !SERVO_SYSTEM_ENABLED
    lcd_print("Servo skipped");
    _delay_ms(1000);
#else
    lcd_print("To slide");

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
#endif
}

/* ============================================================
   LCD FUNCTIONS
   ============================================================ */

void lcd_pulse_enable(void)
{
    PORTD |= (1 << LCD_E);
    _delay_us(1);
    PORTD &= ~(1 << LCD_E);
    _delay_us(100);
}

void lcd_write_nibble(uint8_t nibble)
{
    if (nibble & 0x01) PORTD |= (1 << LCD_D4);
    else PORTD &= ~(1 << LCD_D4);

    if (nibble & 0x02) PORTB |= (1 << LCD_D5);
    else PORTB &= ~(1 << LCD_D5);

    if (nibble & 0x04) PORTB |= (1 << LCD_D6);
    else PORTB &= ~(1 << LCD_D6);

    if (nibble & 0x08) PORTB |= (1 << LCD_D7);
    else PORTB &= ~(1 << LCD_D7);

    lcd_pulse_enable();
}

void lcd_send(uint8_t value, uint8_t rs)
{
    if (rs) PORTD |= (1 << LCD_RS);
    else PORTD &= ~(1 << LCD_RS);

    lcd_write_nibble(value >> 4);
    lcd_write_nibble(value & 0x0F);
}

void lcd_command(uint8_t command)
{
    lcd_send(command, 0);
    _delay_ms(2);
}

void lcd_data(uint8_t data)
{
    lcd_send(data, 1);
}

void lcd_init(void)
{
    _delay_ms(120);

    PORTD &= ~(1 << LCD_RS);
    PORTD &= ~(1 << LCD_E);

    lcd_write_nibble(0x03);
    _delay_ms(5);

    lcd_write_nibble(0x03);
    _delay_us(150);

    lcd_write_nibble(0x03);
    _delay_us(150);

    lcd_write_nibble(0x02);

    lcd_command(0x28);
    lcd_command(0x0C);
    lcd_command(0x06);
    lcd_command(0x01);
}

void lcd_boot_init(void)
{
    lcd_init();
    _delay_ms(50);
    lcd_init();
    lcd_show_two_lines("", "");
}

void lcd_clear(void)
{
    lcd_command(0x01);
    _delay_ms(2);
}

void lcd_set_cursor(uint8_t row, uint8_t col)
{
    uint8_t address = (row == 0) ? col : (0x40 + col);
    lcd_command(0x80 | address);
}

void lcd_print(const char *text)
{
    while (*text) {
        lcd_data(*text++);
    }
}

void lcd_print_padded(const char *text)
{
    uint8_t col = 0;

    while (*text && col < LCD_WIDTH) {
        lcd_data(*text++);
        col++;
    }

    while (col < LCD_WIDTH) {
        lcd_data(' ');
        col++;
    }
}

void lcd_show_two_lines(const char *line0, const char *line1)
{
    lcd_clear();
    lcd_set_cursor(0, 0);
    lcd_print_padded(line0);
    lcd_set_cursor(1, 0);
    lcd_print_padded(line1);
}

void lcd_show_idle_mode(SystemMode mode)
{
    lcd_boot_init();
    lcd_show_two_lines("Select mode:", mode_name(mode));
}

void lcd_print_uint8(uint8_t value)
{
    if (value >= 100) {
        lcd_data('0' + (value / 100));
        value %= 100;
        lcd_data('0' + (value / 10));
        lcd_data('0' + (value % 10));
    } else if (value >= 10) {
        lcd_data('0' + (value / 10));
        lcd_data('0' + (value % 10));
    } else {
        lcd_data('0' + value);
    }
}

void lcd_print_uint16(uint16_t value)
{
    uint16_t divisor = 10000;
    uint8_t started = 0;

    while (divisor > 0) {
        uint8_t digit = value / divisor;

        if (digit != 0 || started || divisor == 1) {
            lcd_data('0' + digit);
            started = 1;
        }

        value %= divisor;
        divisor /= 10;
    }
}

void lcd_lid_open_countdown(void)
{
    for (uint8_t seconds = OBJECT_DROP_WINDOW_SECONDS; seconds > 0; seconds--) {
        lcd_clear();
        lcd_print("Drop object");
        lcd_set_cursor(1, 0);
        lcd_print("Close in ");
        lcd_print_uint8(seconds);
        lcd_print(" sec");

        delay_ms_variable(1000);
    }
}

/* ============================================================
   UART FUNCTIONS
   ============================================================ */

void uart_init(void)
{
    UBRRH = 0;
    UBRRL = UART_BAUD_9600_8MHZ;

    UCSRB = (1 << RXEN) | (1 << TXEN);
    UCSRC = (1 << URSEL) | (1 << UCSZ1) | (1 << UCSZ0);
}

void uart_send_char(char c)
{
    while (!(UCSRA & (1 << UDRE)));
    UDR = c;
}

void uart_send_string(const char *text)
{
    while (*text) {
        uart_send_char(*text++);
    }
}

uint8_t uart_char_available(void)
{
    return (UCSRA & (1 << RXC));
}

char uart_receive_char(void)
{
    while (!uart_char_available());
    return UDR;
}

uint8_t uart_read_line_timeout(char *buffer, uint8_t maxLen, uint16_t timeout100ms)
{
    uint8_t index = 0;

    if (maxLen == 0) {
        return 0;
    }

    while (timeout100ms > 0) {
        for (uint8_t tick = 0; tick < 100; tick++) {
            if (uart_char_available()) {
                char c = uart_receive_char();

                if (c == '\r') {
                    continue;
                }

                if (c == '\n') {
                    buffer[index] = '\0';
                    return (index > 0);
                }

                if (index < (maxLen - 1)) {
                    buffer[index++] = c;
                }
            }

            _delay_ms(1);
        }

        timeout100ms--;
    }

    buffer[index] = '\0';
    return (index > 0);
}

void uart_flush_rx(void)
{
    while (uart_char_available()) {
        (void)UDR;
    }
}

/* ============================================================
   ADC / POTENTIOMETER FUNCTIONS
   ============================================================ */

void adc_init(void)
{
    ADMUX = (1 << REFS0);
    ADCSRA =
        (1 << ADEN) |
        (1 << ADPS2) |
        (1 << ADPS1) |
        (1 << ADPS0);
}

uint16_t adc_read(uint8_t channel)
{
    ADMUX = (ADMUX & 0xE0) | (channel & 0x07);

    ADCSRA |= (1 << ADSC);

    while (ADCSRA & (1 << ADSC));

    return ADC;
}

SystemMode read_mode_from_pot(void)
{
    uint16_t value = adc_read(0);

    if (value < 341) {
        return MODE_STATS;
    } else if (value < 682) {
        return MODE_FILTERING;
    } else {
        return MODE_GAME;
    }
}

/* ============================================================
   ULTRASONIC SENSOR
   ============================================================ */

uint32_t read_ultrasonic_us(void)
{
    uint32_t timeout;

    PORTD &= ~(1 << HCSR04_TRIG);
    _delay_us(2);

    PORTD |= (1 << HCSR04_TRIG);
    _delay_us(10);

    PORTD &= ~(1 << HCSR04_TRIG);

    timeout = 60000;

    while ((PIND & (1 << HCSR04_ECHO)) == 0) {
        if (--timeout == 0) {
            return 0;
        }
    }

    TCNT1 = 0;
    TCCR1A = 0;
    TCCR1B = 0b00000010;

    timeout = 60000;

    while (PIND & (1 << HCSR04_ECHO)) {
        if (--timeout == 0) {
            TCCR1B = 0;
            return 0;
        }
    }

    TCCR1B = 0;

    return TCNT1;
}

uint16_t read_ultrasonic_cm(void)
{
    uint32_t pulse = read_ultrasonic_us();

    if (pulse == 0) {
        return 999;
    }

    return pulse / 58;
}

uint8_t hand_detected(void)
{
    uint16_t distance = read_ultrasonic_cm();

    if (distance > 0 && distance <= HAND_DETECT_CM) {
        return 1;
    }

    return 0;
}

/* ============================================================
   WORKSPACE LIGHT HELPER
   ============================================================ */

void workspace_light_on(void)
{
    // PA1 is now the game high-score reset button, so the old workspace light
    // output is intentionally disabled.
}

void workspace_light_off(void)
{
    // PA1 is now the game high-score reset button, so the old workspace light
    // output is intentionally disabled.
}

/* ============================================================
   LED / BUZZER HELPERS
   ============================================================ */

void all_category_leds_off(void)
{
    PORTC &= ~(
        (1 << LED_METAL) |
        (1 << LED_ORGANIC) |
        (1 << LED_PAPER) |
        (1 << LED_PLASTIC) |
        (1 << LED_BATTERIES) |
        (1 << LED_OTHER)
    );
}

void show_category_led(WasteCategory category)
{
    all_category_leds_off();

    switch (category) {
        case CAT_METAL:
            PORTC |= (1 << LED_METAL);
            break;

        case CAT_ORGANIC:
            PORTC |= (1 << LED_ORGANIC);
            break;

        case CAT_PAPER:
            PORTC |= (1 << LED_PAPER);
            break;

        case CAT_PLASTIC:
            PORTC |= (1 << LED_PLASTIC);
            break;

        case CAT_BATTERIES:
            PORTC |= (1 << LED_BATTERIES);
            break;

        case CAT_OTHER:
        default:
            PORTC |= (1 << LED_OTHER);
            break;
    }
}

void buzzer_beep(uint8_t times)
{
    for (uint8_t i = 0; i < times; i++) {
        PORTD |= (1 << BUZZER);
        _delay_ms(150);
        PORTD &= ~(1 << BUZZER);
        _delay_ms(150);
    }
}

/* ============================================================
   TEXT HELPERS
   ============================================================ */

const char* mode_name(SystemMode mode)
{
    switch (mode) {
        case MODE_STATS:
            return "Stats";

        case MODE_FILTERING:
            return "Filtering";

        case MODE_GAME:
            return "Game";

        default:
            return "Unknown";
    }
}

const char* category_name(WasteCategory category)
{
    switch (category) {
        case CAT_METAL:
            return "Metal";

        case CAT_ORGANIC:
            return "Organic";

        case CAT_PAPER:
            return "Paper/Card";

        case CAT_PLASTIC:
            return "Plastic";

        case CAT_BATTERIES:
            return "Batteries";

        case CAT_OTHER:
        default:
            return "Other";
    }
}

/* ============================================================
   STATS / BUTTON HELPERS
   ============================================================ */

uint8_t button_pressed(uint8_t pin)
{
    if (PINA & (1 << pin)) {
        return 0;
    }

    _delay_ms(25);

    return ((PINA & (1 << pin)) == 0);
}

uint8_t button_held_for_ms(uint8_t pin, uint16_t holdMs)
{
    uint16_t elapsed = 0;

    if (PINA & (1 << pin)) {
        return 0;
    }

    while (elapsed < holdMs) {
        if (PINA & (1 << pin)) {
            return 0;
        }

        _delay_ms(RESET_BUTTON_POLL_MS);
        elapsed += RESET_BUTTON_POLL_MS;
    }

    while ((PINA & (1 << pin)) == 0) {
        _delay_ms(RESET_BUTTON_POLL_MS);
    }

    return 1;
}

uint8_t game_reset_button_pressed(void)
{
    return button_held_for_ms(GAME_HIGH_SCORE_RESET_BUTTON, RESET_BUTTON_HOLD_MS);
}

uint8_t stats_reset_button_pressed(void)
{
    return button_held_for_ms(STATS_COUNT_RESET_BUTTON, RESET_BUTTON_HOLD_MS);
}

uint8_t stats_slot_for_category(WasteCategory category)
{
    return (uint8_t)category;
}

WasteCategory stats_display_category(uint8_t index)
{
    switch (index) {
        case 0: return CAT_OTHER;
        case 1: return CAT_PLASTIC;
        case 2: return CAT_ORGANIC;
        case 3: return CAT_PAPER;
        case 4: return CAT_METAL;
        case 5:
        default: return CAT_BATTERIES;
    }
}

void stats_load_counts(void)
{
    for (uint8_t i = 0; i < 6; i++) {
        binCounts[i] = eeprom_read_word(&eepromBinCounts[i]);

        if (binCounts[i] == 0xFFFF) {
            binCounts[i] = 0;
            eeprom_update_word(&eepromBinCounts[i], 0);
        }
    }
}

void stats_reset_counts(void)
{
    for (uint8_t i = 0; i < 6; i++) {
        binCounts[i] = 0;
        eeprom_update_word(&eepromBinCounts[i], 0);
    }
}

void stats_increment_category(WasteCategory category)
{
    uint8_t slot = stats_slot_for_category(category);

    if (binCounts[slot] < 65535) {
        binCounts[slot]++;
        eeprom_update_word(&eepromBinCounts[slot], binCounts[slot]);
    }
}

uint8_t high_score_reset_if_requested(void)
{
    if (!game_reset_button_pressed()) {
        return 0;
    }

    highScore = 0;
    eeprom_update_byte(&eepromHighScore, highScore);

    lcd_show_two_lines("High score", "Reset to 0");
    _delay_ms(LCD_READ_MESSAGE_MS);

    return 1;
}

uint8_t stats_reset_if_requested(void)
{
    if (!stats_reset_button_pressed()) {
        return 0;
    }

    stats_reset_counts();
    all_category_leds_off();

    lcd_show_two_lines("Stats reset", "All counts 0");
    _delay_ms(LCD_READ_MESSAGE_MS);

    return 1;
}

void delay_with_game_reset_poll(uint16_t ms)
{
    while (ms > 0) {
        if (high_score_reset_if_requested()) {
            return;
        }

        _delay_ms(100);

        if (ms >= 100) {
            ms -= 100;
        } else {
            ms = 0;
        }
    }
}

void delay_with_stats_reset_poll(uint16_t ms)
{
    while (ms > 0) {
        if (stats_reset_if_requested()) {
            return;
        }

        _delay_ms(100);

        if (ms >= 100) {
            ms -= 100;
        } else {
            ms = 0;
        }
    }
}

/* ============================================================
   GAME MODE
   ============================================================ */

#define GAME_SEQUENCE_COUNT 10
#define GAME_SEQUENCE_LENGTH 10

const uint8_t gameSequences[GAME_SEQUENCE_COUNT][GAME_SEQUENCE_LENGTH] PROGMEM = {
    {0, 1, 2, 3, 4, 0, 2, 1, 3, 4},
    {2, 0, 4, 1, 3, 2, 4, 0, 1, 3},
    {1, 3, 0, 4, 2, 1, 0, 3, 4, 2},
    {3, 2, 1, 0, 4, 3, 1, 2, 0, 4},
    {4, 0, 3, 2, 1, 4, 2, 0, 3, 1},
    {0, 2, 4, 3, 1, 0, 4, 1, 2, 3},
    {1, 4, 2, 0, 3, 1, 2, 4, 0, 3},
    {2, 3, 1, 4, 0, 2, 1, 3, 4, 0},
    {3, 0, 4, 1, 2, 3, 4, 0, 2, 1},
    {4, 1, 3, 2, 0, 4, 3, 1, 0, 2}
};

uint16_t gameRandomState = 0xACE1;

void game_random_seed(void)
{
    uint16_t seed;

    seed = adc_read(0);
    seed ^= TCNT1;
    seed ^= ((uint16_t)PINA << 8);

    if (seed == 0) {
        seed = 0xACE1;
    }

    gameRandomState ^= seed;
}

uint8_t game_random_choice(uint8_t maxExclusive)
{
    gameRandomState ^= (gameRandomState << 7);
    gameRandomState ^= (gameRandomState >> 9);
    gameRandomState ^= (gameRandomState << 8);

    return gameRandomState % maxExclusive;
}

uint8_t game_led_mask(uint8_t ledIndex)
{
    switch (ledIndex) {
        case 0: return (1 << LED_METAL);
        case 1: return (1 << LED_ORGANIC);
        case 2: return (1 << LED_PAPER);
        case 3: return (1 << LED_PLASTIC);
        case 4:
        default: return (1 << LED_BATTERIES);
    }
}

WasteCategory game_index_to_category(uint8_t ledIndex)
{
    switch (ledIndex) {
        case 0: return CAT_METAL;
        case 1: return CAT_ORGANIC;
        case 2: return CAT_PAPER;
        case 3: return CAT_PLASTIC;
        case 4:
        default: return CAT_BATTERIES;
    }
}

const char* game_led_name(uint8_t ledIndex)
{
    switch (ledIndex) {
        case 0: return "Metal";
        case 1: return "Organic";
        case 2: return "Paper/Card";
        case 3: return "Plastic";
        case 4:
        default: return "Batteries";
    }
}

void game_show_led(uint8_t ledIndex)
{
    all_category_leds_off();
    PORTC |= game_led_mask(ledIndex);
}

void game_correct_beep(void)
{
    PORTD |= (1 << BUZZER);
    _delay_ms(120);
    PORTD &= ~(1 << BUZZER);
    _delay_ms(120);
}

void game_wrong_beep_and_score(uint8_t score)
{
    PORTD |= (1 << BUZZER);
    _delay_ms(900);
    PORTD &= ~(1 << BUZZER);
    _delay_ms(400);

    buzzer_beep(score);
}

void game_update_high_score(uint8_t score)
{
    if (score > highScore) {
        highScore = score;
        eeprom_write_byte(&eepromHighScore, highScore);
    }
}

uint8_t game_wait_for_object_and_classify(WasteCategory *detectedCategory)
{
    ClassificationResult result;

    lid_open();

    result = run_vision_capture(detectedCategory);

    if (result != CLASSIFICATION_OK) {
        return 0;
    }

    return 1;
}

void game_end_and_save(uint8_t score)
{
    game_update_high_score(score);

    lcd_clear();
    lcd_print("Game over");
    lcd_set_cursor(1, 0);
    lcd_print("Score:");
    lcd_print_uint8(score);
    _delay_ms(GAME_FEEDBACK_MESSAGE_MS);

    game_wrong_beep_and_score(score);

    lcd_clear();
    lcd_print("High score:");
    lcd_print_uint8(highScore);
    lcd_set_cursor(1, 0);
    lcd_print("Unlocked");
    _delay_ms(GAME_FEEDBACK_MESSAGE_MS);

    all_category_leds_off();
}

void game_sort_object(WasteCategory detectedCategory)
{
    process_sorted_object(detectedCategory);
}

/* ============================================================
   STEPPER / DRV8825 FUNCTIONS
   ============================================================ */

void stepper_enable(void)
{
    PORTB &= ~(1 << DRV_ENABLE);
}

void stepper_disable(void)
{
    PORTB |= (1 << DRV_ENABLE);
}

void stepper_set_dir_clockwise(void)
{
    PORTB |= (1 << DRV_DIR);
}

void stepper_set_dir_counterclockwise(void)
{
    PORTB &= ~(1 << DRV_DIR);
}

void stepper_step_once(void)
{
    PORTB |= (1 << DRV_STEP);
    _delay_us(STEPPER_STEP_HIGH_US);

    PORTB &= ~(1 << DRV_STEP);
    _delay_us(STEPPER_STEP_LOW_US);
}

void stepper_home_step_once(void)
{
    PORTB |= (1 << DRV_STEP);
    _delay_us(STEPPER_HOME_STEP_HIGH_US);

    PORTB &= ~(1 << DRV_STEP);
    _delay_us(STEPPER_HOME_STEP_LOW_US);
}

void stepper_move_steps(uint16_t steps)
{
    stepper_enable();

    for (uint16_t i = 0; i < steps; i++) {
        stepper_step_once();
    }
}

uint8_t kw11_is_triggered(void)
{
#if KW11_ACTIVE_LOW
    return (PINB & (1 << KW11_HOME)) == 0;
#else
    return (PINB & (1 << KW11_HOME)) != 0;
#endif
}

uint8_t kw11_is_triggered_debounced(void)
{
    for (uint8_t i = 0; i < KW11_DEBOUNCE_READS; i++) {
        if (!kw11_is_triggered()) {
            return 0;
        }

        _delay_ms(2);
    }

    return 1;
}

uint8_t home_disk_to_kw11_with_timeout(uint16_t timeoutSteps, const char *timeoutLine)
{
    stepper_enable();
    stepper_set_dir_counterclockwise();

    for (uint16_t i = 0; i < timeoutSteps; i++) {
        if (kw11_is_triggered_debounced()) {
            currentDiskPositionSteps = 0;
            diskIsHomed = 1;
            return 1;
        }

        stepper_home_step_once();
    }

    currentDiskPositionSteps = 0;
    diskIsHomed = 1;

    lcd_clear();
    lcd_print("KW11 timeout");
    lcd_set_cursor(1, 0);
    lcd_print(timeoutLine);
    _delay_ms(LCD_QUICK_MESSAGE_MS);

    return 1;
}

uint8_t home_disk_to_kw11(void)
{
    return home_disk_to_kw11_with_timeout(
        STEPPER_HOMING_TIMEOUT_STEPS,
        "Assume home"
    );
}

uint8_t home_disk_to_kw11_second_pass(void)
{
    return home_disk_to_kw11_with_timeout(
        STEPPER_SECOND_HOMING_TIMEOUT_STEPS,
        "Assume home 2"
    );
}

uint8_t home_disk_twice_before_sector(void)
{
    uint8_t secondHomeResult;

    lcd_show_two_lines("Preparing drop", "");

    if (!home_disk_to_kw11()) {
        return 0;
    }

    delay_ms_variable(KW11_SECOND_HOME_DELAY_MS);

    lcd_show_two_lines("Preparing drop", "");

    secondHomeResult = home_disk_to_kw11_second_pass();
    delay_ms_variable(KW11_AFTER_SECOND_HOME_DELAY_MS);

    return secondHomeResult;
}

uint16_t category_to_step_position(WasteCategory category)
{
    switch (category) {
        case CAT_METAL:
            return STEPPER_METAL_POSITION_STEPS;

        case CAT_ORGANIC:
            return STEPPER_ORGANIC_POSITION_STEPS;

        case CAT_PAPER:
            return STEPPER_PAPER_POSITION_STEPS;

        case CAT_PLASTIC:
            return STEPPER_PLASTIC_POSITION_STEPS;

        case CAT_BATTERIES:
            return STEPPER_BATTERIES_POSITION_STEPS;

        case CAT_OTHER:
        default:
            return STEPPER_OTHER_POSITION_STEPS;
    }
}

void rotate_disk_to_category(WasteCategory category)
{
    uint16_t targetPositionSteps = category_to_step_position(category);

    if (!home_disk_twice_before_sector()) {
        lcd_clear();
        lcd_print("Disk home fail");
        lcd_set_cursor(1, 0);
        lcd_print("Check KW11");

        while (1) {
            stepper_disable();
            _delay_ms(1000);
        }
    }

    lcd_clear();
    lcd_print("Rotating disk");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));

    stepper_set_dir_clockwise();
    stepper_move_steps(targetPositionSteps);

    currentDiskPositionSteps = targetPositionSteps;
    diskIsHomed = (currentDiskPositionSteps == 0);

    lcd_clear();
    lcd_print("Disk aligned");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));
    _delay_ms(LCD_READ_MESSAGE_MS);
}

void return_disk_to_home(void)
{
    if (diskIsHomed && currentDiskPositionSteps == 0) {
        lcd_clear();
        lcd_print("Disk already");
        lcd_set_cursor(1, 0);
        lcd_print("at home");
        _delay_ms(LCD_QUICK_MESSAGE_MS);
        return;
    }

    lcd_clear();
    lcd_print("Returning disk");
    lcd_set_cursor(1, 0);
    lcd_print("to KW11");

    if (!home_disk_to_kw11()) {
        lcd_clear();
        lcd_print("Disk home fail");
        lcd_set_cursor(1, 0);
        lcd_print("Check KW11");

        while (1) {
            stepper_disable();
            _delay_ms(1000);
        }
    }

    lcd_clear();
    lcd_print("Disk home");
    _delay_ms(LCD_QUICK_MESSAGE_MS);
}

/* ============================================================
   RASPBERRY PI VISION CLASSIFICATION
   ============================================================ */

ClassificationResult parse_raspberry_category(const char *line, WasteCategory *category)
{
    if (
        strcmp(line, "NO_OBJECT") == 0 ||
        strcmp(line, "NONE") == 0 ||
        strcmp(line, "EMPTY") == 0
    ) {
        return CLASSIFICATION_NO_OBJECT;
    }

    if (strcmp(line, "METAL") == 0 || strcmp(line, "METALLIC") == 0) {
        *category = CAT_METAL;
        return CLASSIFICATION_OK;
    }

    if (strcmp(line, "ORGANIC") == 0) {
        *category = CAT_ORGANIC;
        return CLASSIFICATION_OK;
    }

    if (
        strcmp(line, "PAPER") == 0 ||
        strcmp(line, "PAPER_CARD") == 0 ||
        strcmp(line, "PAPER/CARD") == 0 ||
        strcmp(line, "CARDBOARD") == 0
    ) {
        *category = CAT_PAPER;
        return CLASSIFICATION_OK;
    }

    if (strcmp(line, "PLASTIC") == 0) {
        *category = CAT_PLASTIC;
        return CLASSIFICATION_OK;
    }

    if (strcmp(line, "BATTERIES") == 0 || strcmp(line, "BATTERY") == 0) {
        *category = CAT_BATTERIES;
        return CLASSIFICATION_OK;
    }

    if (strcmp(line, "OTHER") == 0) {
        *category = CAT_OTHER;
        return CLASSIFICATION_OK;
    }

    return CLASSIFICATION_TIMEOUT;
}

ClassificationResult request_classification_from_raspberry(WasteCategory *category)
{
    char response[18];

    lcd_show_two_lines("Analyzing", "object...");

    uart_flush_rx();
    uart_send_string("CAPTURE\n");

    if (!uart_read_line_timeout(response, sizeof(response), RPI_RESPONSE_TIMEOUT_100MS)) {
        return CLASSIFICATION_TIMEOUT;
    }

    return parse_raspberry_category(response, category);
}

ClassificationResult run_vision_capture(WasteCategory *category)
{
    ClassificationResult result;

    lcd_lid_open_countdown();
    lid_close();

    photo_booth_capture_position();

    workspace_light_on();
    _delay_ms(250);

    result = request_classification_from_raspberry(category);

    workspace_light_off();

    if (result == CLASSIFICATION_NO_OBJECT) {
        lcd_clear();
        lcd_print("No object");
        lcd_set_cursor(1, 0);
        lcd_print("Clearing booth");
        _delay_ms(LCD_READ_MESSAGE_MS);

        photo_booth_drop_position();
    } else if (result == CLASSIFICATION_TIMEOUT) {
        lcd_clear();
        lcd_print("Raspberry");
        lcd_set_cursor(1, 0);
        lcd_print("No response");
        _delay_ms(LCD_READ_MESSAGE_MS);

        photo_booth_hold_position();
    }

    return result;
}

/* ============================================================
   MECHANICAL SORTING PROCESS
   ============================================================ */

void process_sorted_object(WasteCategory category)
{
    lcd_clear();
    lcd_print("Preparing drop");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));
    _delay_ms(LCD_QUICK_MESSAGE_MS);

    rotate_disk_to_category(category);

    photo_booth_drop_position();

    stats_increment_category(category);
}

/* ============================================================
   FILTERING MODE
   ============================================================ */

void run_filtering_mode(void)
{
    ClassificationResult result;
    WasteCategory category;

    lcd_clear();
    lcd_print("Mode locked:");
    lcd_set_cursor(1, 0);
    lcd_print("Filtering");
    _delay_ms(LCD_QUICK_MESSAGE_MS);

    lid_open();

    result = run_vision_capture(&category);

    if (result != CLASSIFICATION_OK) {
        lcd_clear();
        lcd_print("No sorting");
        lcd_set_cursor(1, 0);
        lcd_print("Unlocked");
        _delay_ms(LCD_READ_MESSAGE_MS);
        return;
    }

    show_category_led(category);

    lcd_clear();
    lcd_print("Classified:");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));
    _delay_ms(LCD_READ_MESSAGE_MS);

    process_sorted_object(category);

    lcd_clear();
    lcd_print("Cycle complete");
    lcd_set_cursor(1, 0);
    lcd_print("Unlocked");
    _delay_ms(LCD_READ_MESSAGE_MS);

    all_category_leds_off();
}

/* ============================================================
   GAME MODE
   ============================================================ */

void run_game_mode(void)
{
    uint8_t sequenceOption;
    uint8_t expectedIndex;
    WasteCategory expectedCategory;
    WasteCategory detectedCategory;
    uint8_t score = 0;

    lcd_clear();
    lcd_print("Mode locked:");
    lcd_set_cursor(1, 0);
    lcd_print("Game");
    _delay_ms(LCD_QUICK_MESSAGE_MS);

    lcd_clear();
    lcd_print("High score:");
    lcd_print_uint8(highScore);
    lcd_set_cursor(1, 0);
    lcd_print("Right button 2s");
    delay_with_game_reset_poll(GAME_HIGH_SCORE_MESSAGE_MS);

    game_random_seed();
    sequenceOption = game_random_choice(GAME_SEQUENCE_COUNT);

    for (uint8_t step = 0; step < GAME_SEQUENCE_LENGTH; step++) {
        high_score_reset_if_requested();

        expectedIndex = pgm_read_byte(&gameSequences[sequenceOption][step]);
        expectedCategory = game_index_to_category(expectedIndex);

        lcd_clear();
        lcd_print("Score:");
        lcd_print_uint8(score);
        lcd_print(" Need:");
        lcd_set_cursor(1, 0);
        lcd_print(game_led_name(expectedIndex));

        game_show_led(expectedIndex);
        _delay_ms(GAME_FEEDBACK_MESSAGE_MS);

        if (!game_wait_for_object_and_classify(&detectedCategory)) {
            game_end_and_save(score);
            return;
        }

        show_category_led(detectedCategory);

        lcd_clear();
        lcd_print("Detected:");
        lcd_set_cursor(1, 0);
        lcd_print(category_name(detectedCategory));
        _delay_ms(LCD_QUICK_MESSAGE_MS);

        if (detectedCategory == expectedCategory) {
            score++;
            game_update_high_score(score);

            lcd_clear();
            lcd_print("Correct!");
            lcd_set_cursor(1, 0);
            lcd_print("Score:");
            lcd_print_uint8(score);

            game_correct_beep();
            _delay_ms(GAME_FEEDBACK_MESSAGE_MS);

            game_sort_object(detectedCategory);

            all_category_leds_off();

            lcd_clear();
            lcd_print("Next object");
            lcd_set_cursor(1, 0);
            lcd_print("Get ready");
            _delay_ms(LCD_QUICK_MESSAGE_MS);
        } else {
            lcd_clear();
            lcd_print("Wrong object");
            lcd_set_cursor(1, 0);
            lcd_print("Expected:");
            lcd_print(game_led_name(expectedIndex));
            _delay_ms(LCD_READ_MESSAGE_MS);

            game_sort_object(detectedCategory);

            game_end_and_save(score);
            return;
        }
    }

    game_update_high_score(score);

    lcd_clear();
    lcd_print("Perfect game!");
    lcd_set_cursor(1, 0);
    lcd_print("Score:");
    lcd_print_uint8(score);
    _delay_ms(GAME_FEEDBACK_MESSAGE_MS);

    buzzer_beep(score);

    lcd_clear();
    lcd_print("High score:");
    lcd_print_uint8(highScore);
    lcd_set_cursor(1, 0);
    lcd_print("Unlocked");
    _delay_ms(GAME_FEEDBACK_MESSAGE_MS);

    all_category_leds_off();
}

/* ============================================================
   STATS MODE
   ============================================================ */

void run_stats_mode(void)
{
    WasteCategory category;

    lcd_clear();
    lcd_print("Mode locked:");
    lcd_set_cursor(1, 0);
    lcd_print("Stats");
    _delay_ms(LCD_QUICK_MESSAGE_MS);

    lcd_show_two_lines("Bins emptied?", "Left button 2s");
    delay_with_stats_reset_poll(LCD_PROMPT_MESSAGE_MS);

    for (uint8_t i = 0; i < 6; i++) {
        stats_reset_if_requested();

        category = stats_display_category(i);
        show_category_led(category);

        lcd_clear();
        lcd_print(category_name(category));
        lcd_set_cursor(1, 0);
        lcd_print("Count:");
        lcd_print_uint16(binCounts[stats_slot_for_category(category)]);
        delay_with_stats_reset_poll(LCD_READ_MESSAGE_MS);
    }

    all_category_leds_off();

    lcd_clear();
    lcd_print("Stats done");
    lcd_set_cursor(1, 0);
    lcd_print("Unlocked");
    _delay_ms(LCD_READ_MESSAGE_MS);
}

/* ============================================================
   HARDWARE INIT
   ============================================================ */

void hardware_init(void)
{
    DDRA = 0x00;
    PORTA =
        (1 << GAME_HIGH_SCORE_RESET_BUTTON) |
        (1 << STATS_COUNT_RESET_BUTTON);

    DDRB |=
        (1 << DRV_STEP) |
        (1 << DRV_DIR) |
        (1 << DRV_ENABLE) |
        (1 << LCD_D5) |
        (1 << LCD_D6) |
        (1 << LCD_D7);

    DDRB &= ~(1 << KW11_HOME);
    PORTB |= (1 << KW11_HOME);

    stepper_disable();

    DDRC |=
        (1 << LED_METAL) |
        (1 << LED_ORGANIC) |
        (1 << LED_PAPER) |
        (1 << LED_PLASTIC) |
        (1 << LED_BATTERIES) |
        (1 << LED_OTHER);

    all_category_leds_off();

    DDRD |=
        (1 << HCSR04_TRIG) |
        (1 << BUZZER) |
        (1 << LCD_RS) |
        (1 << LCD_E) |
        (1 << LCD_D4);

    DDRD &= ~(1 << HCSR04_ECHO);

    PORTD &= ~(1 << BUZZER);

    adc_init();
    uart_init();
    lcd_boot_init();

#if SERVO_SYSTEM_ENABLED
    pca9685_init(0x00, 50);
    _delay_ms(10);

    pca9685_servo(LID_SERVO_CHANNEL, LID_CLOSED_ANGLE);
    photo_booth_hold_position();

    // Clear the photo booth mechanically at boot without showing user-facing text.
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

    // Servo startup movement can inject noise; re-sync the LCD before the
    // first user-facing ready screen.
    lcd_boot_init();
#endif

    currentDiskPositionSteps = 0;
    diskIsHomed = 0;

    highScore = eeprom_read_byte(&eepromHighScore);

    if (highScore == 0xFF) {
        highScore = 0;
        eeprom_update_byte(&eepromHighScore, highScore);
    }

    stats_load_counts();

    lcd_boot_init();
    lcd_set_cursor(0, 0);
    lcd_print_padded("R3Bin ready");
    lcd_set_cursor(1, 0);
    lcd_print_padded("");
    _delay_ms(LCD_READ_MESSAGE_MS);
}

/* ============================================================
   MAIN PROGRAM
   ============================================================ */

int main(void)
{
    SystemMode currentMode;
    SystemMode lockedMode;
    SystemMode displayedMode = (SystemMode)255;
    uint8_t forceIdleRedraw = 1;

    hardware_init();

    while (1) {
        currentMode = read_mode_from_pot();

        if (forceIdleRedraw || currentMode != displayedMode) {
            lcd_show_idle_mode(currentMode);
            displayedMode = currentMode;
            forceIdleRedraw = 0;
        }

        for (uint8_t i = 0; i < 10; i++) {
            if (hand_detected()) {
                lockedMode = read_mode_from_pot();

                lcd_show_two_lines("Locked:", mode_name(lockedMode));
                _delay_ms(LCD_QUICK_MESSAGE_MS);

                if (lockedMode == MODE_FILTERING) {
                    run_filtering_mode();
                } else if (lockedMode == MODE_GAME) {
                    run_game_mode();
                } else if (lockedMode == MODE_STATS) {
                    run_stats_mode();
                }

                forceIdleRedraw = 1;
                displayedMode = (SystemMode)255;
            }

            _delay_ms(100);
        }
    }

    return 0;
}

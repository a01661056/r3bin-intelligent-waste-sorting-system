#define F_CPU 8000000UL

#include <avr/io.h>
#include <avr/eeprom.h>
#include <avr/pgmspace.h>
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
#define MAX_PULSE     2100
#define MIN_PULSE     900
#define MAX_ANGLE     90

#define LID_SERVO_CHANNEL            0
#define ANALYSIS_GATE_SERVO_CHANNEL  4
#define HALFDOOR_LEFT_SERVO_CHANNEL  8
#define HALFDOOR_RIGHT_SERVO_CHANNEL 12

#define LID_CLOSED_ANGLE       -90
#define LID_OPEN_ANGLE          70

#define GATE_CLOSED_ANGLE      -90
#define GATE_OPEN_ANGLE         70

#define HALFDOOR_LEFT_STOP_SPEED    -5
#define HALFDOOR_RIGHT_STOP_SPEED   -5

#define HALFDOOR_LEFT_OPEN_SPEED     30
#define HALFDOOR_RIGHT_OPEN_SPEED   -30

#define HALFDOOR_LEFT_CLOSE_SPEED   -50
#define HALFDOOR_RIGHT_CLOSE_SPEED   15

#define HALFDOOR_FIVE_ROTATION_TIME_MS 3500

uint16_t globalFrequency;
uint8_t globalAddress;

/* ============================================================
   PIN DEFINITIONS
   ============================================================ */

#define POT_MODE_SELECTOR PA0
#define FC51_ANALYSIS     PA1

#define METAL_FULL_SENSOR     PA2
#define ORGANIC_FULL_SENSOR   PA3
#define PAPER_FULL_SENSOR     PA4
#define PLASTIC_FULL_SENSOR   PA5
#define BATTERIES_FULL_SENSOR PA6
#define OTHER_FULL_SENSOR     PA7

#define DRV_STEP   PB0
#define DRV_DIR    PB1
#define DRV_ENABLE PB2

#define LCD_D5 PB3
#define LCD_D6 PB4
#define LCD_D7 PB5

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

#define STEPPER_STEPS_PER_REV 200
#define STEPPER_MICROSTEPS 16

#define STEPPER_TOTAL_STEPS  (STEPPER_STEPS_PER_REV * STEPPER_MICROSTEPS)
#define STEPPER_SECTOR_STEPS (STEPPER_TOTAL_STEPS / 6)

uint8_t currentDiskSector = 0;

/* ============================================================
   EEPROM
   ============================================================ */

uint8_t EEMEM eepromHighScore;
uint8_t highScore = 0;

/* ============================================================
   MODES AND CATEGORIES
   ============================================================ */

typedef enum {
    MODE_CAPACITY = 0,
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

/* ============================================================
   FUNCTION PROTOTYPES
   ============================================================ */

void lcd_clear(void);
void lcd_print(const char *text);
void lcd_print_uint8(uint8_t value);
void lcd_set_cursor(uint8_t row, uint8_t col);

const char* mode_name(SystemMode mode);
const char* category_name(WasteCategory category);

void lid_open(void);
void lid_close(void);
void analysis_gate_open(void);
void analysis_gate_close(void);

WasteCategory request_classification_mock(void);

uint8_t selected_bin_is_75_or_more(WasteCategory category);
void check_selected_bin_capacity(WasteCategory category);

void system_full_bin_lock(WasteCategory category);
void system_full_bins_lock(uint8_t ledMask);

void rotate_disk_to_category(WasteCategory category);
void return_disk_to_home(void);

void process_sorted_object(WasteCategory category, uint8_t checkCapacity);

void run_filtering_mode(void);
void run_game_mode(void);
void run_capacity_mode(void);

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

void servo_sweep(uint8_t channel, int8_t fromAngle, int8_t toAngle)
{
    int8_t angle;

    if (fromAngle < toAngle) {
        for (angle = fromAngle; angle <= toAngle; angle += 5) {
            pca9685_servo(channel, angle);
            _delay_ms(25);
        }
    } else {
        for (angle = fromAngle; angle >= toAngle; angle -= 5) {
            pca9685_servo(channel, angle);
            _delay_ms(25);
        }
    }
}

void lid_open(void)
{
    servo_sweep(LID_SERVO_CHANNEL, LID_CLOSED_ANGLE, LID_OPEN_ANGLE);
}

void lid_close(void)
{
    servo_sweep(LID_SERVO_CHANNEL, LID_OPEN_ANGLE, LID_CLOSED_ANGLE);
}

void analysis_gate_open(void)
{
    servo_sweep(ANALYSIS_GATE_SERVO_CHANNEL, GATE_CLOSED_ANGLE, GATE_OPEN_ANGLE);
}

void analysis_gate_close(void)
{
    servo_sweep(ANALYSIS_GATE_SERVO_CHANNEL, GATE_OPEN_ANGLE, GATE_CLOSED_ANGLE);
}

/* ============================================================
   HALFDOOR FUNCTIONS
   ============================================================ */

void halfdoor_stop(void)
{
    pca9685_servo(HALFDOOR_LEFT_SERVO_CHANNEL, HALFDOOR_LEFT_STOP_SPEED);
    pca9685_servo(HALFDOOR_RIGHT_SERVO_CHANNEL, HALFDOOR_RIGHT_STOP_SPEED);
}

void halfdoor_open_5_rotations(void)
{
    lcd_clear();
    lcd_print("Opening doors");
    lcd_set_cursor(1, 0);
    lcd_print("5 rotations");

    pca9685_servo(HALFDOOR_LEFT_SERVO_CHANNEL, HALFDOOR_LEFT_OPEN_SPEED);
    pca9685_servo(HALFDOOR_RIGHT_SERVO_CHANNEL, HALFDOOR_RIGHT_OPEN_SPEED);

    delay_ms_variable(HALFDOOR_FIVE_ROTATION_TIME_MS);

    halfdoor_stop();

    lcd_clear();
    lcd_print("Doors open");
    _delay_ms(700);
}

void halfdoor_close_5_rotations(void)
{
    lcd_clear();
    lcd_print("Closing doors");
    lcd_set_cursor(1, 0);
    lcd_print("Return 5 rot");

    pca9685_servo(HALFDOOR_LEFT_SERVO_CHANNEL, HALFDOOR_LEFT_CLOSE_SPEED);
    pca9685_servo(HALFDOOR_RIGHT_SERVO_CHANNEL, HALFDOOR_RIGHT_CLOSE_SPEED);

    delay_ms_variable(HALFDOOR_FIVE_ROTATION_TIME_MS);

    halfdoor_stop();

    lcd_clear();
    lcd_print("Doors closed");
    _delay_ms(700);
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
    _delay_ms(50);

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
        return MODE_CAPACITY;
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
   SENSOR HELPERS
   ============================================================ */

uint8_t analysis_object_detected(void)
{
    if ((PINA & (1 << FC51_ANALYSIS)) == 0) {
        return 1;
    }

    return 0;
}

uint8_t wait_for_object_5s(void)
{
    for (uint16_t i = 0; i < 500; i++) {
        if (analysis_object_detected()) {
            return 1;
        }

        _delay_ms(10);
    }

    return 0;
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
        case MODE_CAPACITY:
            return "Capacity";

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
   CAPACITY HELPERS
   ============================================================ */

uint8_t capacity_bin_is_full(uint8_t binIndex)
{
    switch (binIndex) {
        case 0: return ((PINA & (1 << METAL_FULL_SENSOR)) == 0);
        case 1: return ((PINA & (1 << ORGANIC_FULL_SENSOR)) == 0);
        case 2: return ((PINA & (1 << PAPER_FULL_SENSOR)) == 0);
        case 3: return ((PINA & (1 << PLASTIC_FULL_SENSOR)) == 0);
        case 4: return ((PINA & (1 << BATTERIES_FULL_SENSOR)) == 0);
        case 5: return ((PINA & (1 << OTHER_FULL_SENSOR)) == 0);
        default: return 0;
    }
}

uint8_t capacity_led_mask(uint8_t binIndex)
{
    switch (binIndex) {
        case 0: return (1 << LED_METAL);
        case 1: return (1 << LED_ORGANIC);
        case 2: return (1 << LED_PAPER);
        case 3: return (1 << LED_PLASTIC);
        case 4: return (1 << LED_BATTERIES);
        case 5: return (1 << LED_OTHER);
        default: return 0;
    }
}

const char* capacity_bin_name(uint8_t binIndex)
{
    switch (binIndex) {
        case 0: return "Metal";
        case 1: return "Organic";
        case 2: return "Paper/Card";
        case 3: return "Plastic";
        case 4: return "Batteries";
        case 5: return "Other";
        default: return "Unknown";
    }
}

WasteCategory capacity_index_to_category(uint8_t binIndex)
{
    switch (binIndex) {
        case 0: return CAT_METAL;
        case 1: return CAT_ORGANIC;
        case 2: return CAT_PAPER;
        case 3: return CAT_PLASTIC;
        case 4: return CAT_BATTERIES;
        case 5:
        default: return CAT_OTHER;
    }
}

uint8_t capacity_full_led_mask(void)
{
    uint8_t mask = 0;

    for (uint8_t i = 0; i < 6; i++) {
        if (capacity_bin_is_full(i)) {
            mask |= capacity_led_mask(i);
        }
    }

    return mask;
}

uint8_t selected_bin_is_75_or_more(WasteCategory category)
{
    switch (category) {
        case CAT_METAL:
            return ((PINA & (1 << METAL_FULL_SENSOR)) == 0);

        case CAT_ORGANIC:
            return ((PINA & (1 << ORGANIC_FULL_SENSOR)) == 0);

        case CAT_PAPER:
            return ((PINA & (1 << PAPER_FULL_SENSOR)) == 0);

        case CAT_PLASTIC:
            return ((PINA & (1 << PLASTIC_FULL_SENSOR)) == 0);

        case CAT_BATTERIES:
            return ((PINA & (1 << BATTERIES_FULL_SENSOR)) == 0);

        case CAT_OTHER:
        default:
            return ((PINA & (1 << OTHER_FULL_SENSOR)) == 0);
    }
}

/* ============================================================
   SYSTEM FULL-BIN LOCKS
   ============================================================ */

void system_full_bin_lock(WasteCategory category)
{
    all_category_leds_off();
    show_category_led(category);

    lcd_clear();
    lcd_print("SYSTEM LOCKED");
    lcd_set_cursor(1, 0);
    lcd_print("Bin full:");
    _delay_ms(1200);

    lcd_clear();
    lcd_print(category_name(category));
    lcd_set_cursor(1, 0);
    lcd_print(">= 75 percent");
    _delay_ms(1200);

    lcd_clear();
    lcd_print("Empty bin");
    lcd_set_cursor(1, 0);
    lcd_print("Then reset");

    while (1) {
        PORTD |= (1 << BUZZER);
        _delay_ms(500);
        PORTD &= ~(1 << BUZZER);
        _delay_ms(1500);
    }
}

void system_full_bins_lock(uint8_t ledMask)
{
    all_category_leds_off();
    PORTC |= ledMask;

    lcd_clear();
    lcd_print("SYSTEM LOCKED");
    lcd_set_cursor(1, 0);
    lcd_print("Bins full");
    _delay_ms(1200);

    while (1) {
        PORTC |= ledMask;

        for (uint8_t i = 0; i < 6; i++) {
            if (ledMask & capacity_led_mask(i)) {
                lcd_clear();
                lcd_print("Empty bin:");
                lcd_set_cursor(1, 0);
                lcd_print(capacity_bin_name(i));

                PORTD |= (1 << BUZZER);
                _delay_ms(500);
                PORTD &= ~(1 << BUZZER);
                _delay_ms(1500);
            }
        }

        lcd_clear();
        lcd_print("Then press");
        lcd_set_cursor(1, 0);
        lcd_print("RESET button");
        _delay_ms(1200);
    }
}

void check_selected_bin_capacity(WasteCategory category)
{
    lcd_clear();
    lcd_print("Checking bin:");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));
    _delay_ms(1000);

    if (selected_bin_is_75_or_more(category)) {
        system_full_bin_lock(category);
    } else {
        lcd_clear();
        lcd_print("Bin status:");
        lcd_set_cursor(1, 0);
        lcd_print("Not 75% yet");

        _delay_ms(1500);
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

void game_full_bin_alarm(WasteCategory category, uint8_t score)
{
    game_update_high_score(score);

    lcd_clear();
    lcd_print("Score:");
    lcd_print_uint8(score);
    lcd_set_cursor(1, 0);
    lcd_print("High:");
    lcd_print_uint8(highScore);
    _delay_ms(1500);

    system_full_bin_lock(category);
}

uint8_t game_wait_for_object_and_classify(WasteCategory *detectedCategory)
{
    lid_open();

    lcd_clear();
    lcd_print("Insert object");
    lcd_set_cursor(1, 0);
    lcd_print("Waiting 5 sec");

    if (!wait_for_object_5s()) {
        lid_close();

        lcd_clear();
        lcd_print("No object");
        lcd_set_cursor(1, 0);
        lcd_print("Game ended");
        _delay_ms(1200);

        return 0;
    }

    lcd_clear();
    lcd_print("Object found");
    lcd_set_cursor(1, 0);
    lcd_print("Closing lid");

    lid_close();

    *detectedCategory = request_classification_mock();

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
    _delay_ms(1000);

    game_wrong_beep_and_score(score);

    lcd_clear();
    lcd_print("High score:");
    lcd_print_uint8(highScore);
    lcd_set_cursor(1, 0);
    lcd_print("Unlocked");
    _delay_ms(1500);

    all_category_leds_off();
}

void game_sort_object_and_check_real_bin(WasteCategory detectedCategory, uint8_t score)
{
    process_sorted_object(detectedCategory, 0);

    if (selected_bin_is_75_or_more(detectedCategory)) {
        game_full_bin_alarm(detectedCategory, score);
    }
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
    _delay_us(700);

    PORTB &= ~(1 << DRV_STEP);
    _delay_us(700);
}

void stepper_move_steps(uint16_t steps)
{
    stepper_enable();

    for (uint16_t i = 0; i < steps; i++) {
        stepper_step_once();
    }

    stepper_disable();
}

uint8_t category_to_sector(WasteCategory category)
{
    switch (category) {
        case CAT_OTHER: return 0;
        case CAT_METAL: return 1;
        case CAT_ORGANIC: return 2;
        case CAT_PAPER: return 3;
        case CAT_PLASTIC: return 4;
        case CAT_BATTERIES: return 5;
        default: return 0;
    }
}

void rotate_disk_to_category(WasteCategory category)
{
    uint8_t targetSector = category_to_sector(category);
    uint8_t sectorDelta;

    if (targetSector >= currentDiskSector) {
        sectorDelta = targetSector - currentDiskSector;
    } else {
        sectorDelta = (6 - currentDiskSector) + targetSector;
    }

    lcd_clear();
    lcd_print("Rotating disk");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));

    stepper_set_dir_clockwise();
    stepper_move_steps((uint16_t)sectorDelta * STEPPER_SECTOR_STEPS);

    currentDiskSector = targetSector;

    lcd_clear();
    lcd_print("Disk aligned");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));
    _delay_ms(1500);
}

void return_disk_to_home(void)
{
    if (currentDiskSector == 0) {
        lcd_clear();
        lcd_print("Disk already");
        lcd_set_cursor(1, 0);
        lcd_print("at home");
        _delay_ms(800);
        return;
    }

    lcd_clear();
    lcd_print("Returning disk");
    lcd_set_cursor(1, 0);
    lcd_print("to home");

    stepper_set_dir_counterclockwise();
    stepper_move_steps((uint16_t)currentDiskSector * STEPPER_SECTOR_STEPS);

    currentDiskSector = 0;

    lcd_clear();
    lcd_print("Disk home");
    _delay_ms(1000);
}

/* ============================================================
   RASPBERRY PI CLASSIFICATION MOCK
   ============================================================ */

WasteCategory request_classification_mock(void)
{
    lcd_clear();
    lcd_print("Request photo");
    lcd_set_cursor(1, 0);
    lcd_print("Raspberry Pi");

    uart_send_string("CAPTURE\n");

    for (uint8_t i = 0; i < 10; i++) {
        _delay_ms(1000);
    }

    return CAT_METAL;
}

/* ============================================================
   MECHANICAL SORTING PROCESS
   ============================================================ */

void process_sorted_object(WasteCategory category, uint8_t checkCapacity)
{
    lcd_clear();
    lcd_print("Opening gate");
    lcd_set_cursor(1, 0);
    lcd_print("Drop object");

    analysis_gate_open();
    _delay_ms(1000);

    analysis_gate_close();
    _delay_ms(700);

    lcd_clear();
    lcd_print("Gate complete");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));
    _delay_ms(1000);

    rotate_disk_to_category(category);

    halfdoor_open_5_rotations();

    lcd_clear();
    lcd_print("Dropping waste");
    lcd_set_cursor(1, 0);
    lcd_print("Wait 2 sec");
    _delay_ms(2000);

    halfdoor_close_5_rotations();

    if (checkCapacity) {
        check_selected_bin_capacity(category);
    }

    return_disk_to_home();
}

/* ============================================================
   FILTERING MODE
   ============================================================ */

void run_filtering_mode(void)
{
    uint8_t objectDetected;
    WasteCategory category;

    lcd_clear();
    lcd_print("Mode locked:");
    lcd_set_cursor(1, 0);
    lcd_print("Filtering");

    lid_open();

    lcd_clear();
    lcd_print("Insert object");
    lcd_set_cursor(1, 0);
    lcd_print("Waiting 5 sec");

    objectDetected = wait_for_object_5s();

    if (!objectDetected) {
        lcd_clear();
        lcd_print("No object");
        lcd_set_cursor(1, 0);
        lcd_print("Unlocking");

        lid_close();
        _delay_ms(1000);
        return;
    }

    lcd_clear();
    lcd_print("Object found");
    lcd_set_cursor(1, 0);
    lcd_print("Closing lid");

    lid_close();

    category = request_classification_mock();

    show_category_led(category);

    lcd_clear();
    lcd_print("Classified:");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));
    _delay_ms(1500);

    process_sorted_object(category, 1);

    lcd_clear();
    lcd_print("Cycle complete");
    lcd_set_cursor(1, 0);
    lcd_print("Unlocked");
    _delay_ms(1500);

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
    _delay_ms(1000);

    game_random_seed();
    sequenceOption = game_random_choice(GAME_SEQUENCE_COUNT);

    lcd_clear();
    lcd_print("Challenge");
    lcd_set_cursor(1, 0);
    lcd_print("Seq ");
    lcd_print_uint8(sequenceOption + 1);
    _delay_ms(1000);

    for (uint8_t step = 0; step < GAME_SEQUENCE_LENGTH; step++) {
        expectedIndex = pgm_read_byte(&gameSequences[sequenceOption][step]);
        expectedCategory = game_index_to_category(expectedIndex);

        lcd_clear();
        lcd_print("Score:");
        lcd_print_uint8(score);
        lcd_print(" Need:");
        lcd_set_cursor(1, 0);
        lcd_print(game_led_name(expectedIndex));

        game_show_led(expectedIndex);

        if (!game_wait_for_object_and_classify(&detectedCategory)) {
            game_end_and_save(score);
            return;
        }

        show_category_led(detectedCategory);

        lcd_clear();
        lcd_print("Detected:");
        lcd_set_cursor(1, 0);
        lcd_print(category_name(detectedCategory));
        _delay_ms(1000);

        if (detectedCategory == expectedCategory) {
            score++;
            game_update_high_score(score);

            lcd_clear();
            lcd_print("Correct!");
            lcd_set_cursor(1, 0);
            lcd_print("Score:");
            lcd_print_uint8(score);

            game_correct_beep();
            _delay_ms(700);

            game_sort_object_and_check_real_bin(detectedCategory, score);

            all_category_leds_off();

            lcd_clear();
            lcd_print("Next object");
            lcd_set_cursor(1, 0);
            lcd_print("Get ready");
            _delay_ms(1000);
        } else {
            lcd_clear();
            lcd_print("Wrong object");
            lcd_set_cursor(1, 0);
            lcd_print("Expected:");
            lcd_print(game_led_name(expectedIndex));
            _delay_ms(1500);

            game_sort_object_and_check_real_bin(detectedCategory, score);

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
    _delay_ms(1000);

    buzzer_beep(score);

    lcd_clear();
    lcd_print("High score:");
    lcd_print_uint8(highScore);
    lcd_set_cursor(1, 0);
    lcd_print("Unlocked");
    _delay_ms(1500);

    all_category_leds_off();
}

/* ============================================================
   CAPACITY MODE
   ============================================================ */

void run_capacity_mode(void)
{
    uint8_t ledMask;

    lcd_clear();
    lcd_print("Mode locked:");
    lcd_set_cursor(1, 0);
    lcd_print("Capacity");
    _delay_ms(1000);

    ledMask = capacity_full_led_mask();

    if (ledMask != 0) {
        system_full_bins_lock(ledMask);
    }

    all_category_leds_off();

    lcd_clear();
    lcd_print("Capacity check");
    lcd_set_cursor(1, 0);
    lcd_print("All below 75%");
    _delay_ms(2000);

    for (uint8_t i = 10; i > 0; i--) {
        lcd_clear();
        lcd_print("No full bins");
        lcd_set_cursor(1, 0);
        lcd_print("Unlock in ");
        lcd_print_uint8(i);
        lcd_print("s");
        _delay_ms(1000);
    }

    lcd_clear();
    lcd_print("Capacity done");
    lcd_set_cursor(1, 0);
    lcd_print("Unlocked");
    _delay_ms(1000);

    return;
}

/* ============================================================
   HARDWARE INIT
   ============================================================ */

void hardware_init(void)
{
    DDRA = 0x00;

    PORTA =
        (1 << FC51_ANALYSIS) |
        (1 << METAL_FULL_SENSOR) |
        (1 << ORGANIC_FULL_SENSOR) |
        (1 << PAPER_FULL_SENSOR) |
        (1 << PLASTIC_FULL_SENSOR) |
        (1 << BATTERIES_FULL_SENSOR) |
        (1 << OTHER_FULL_SENSOR);

    DDRB |=
        (1 << DRV_STEP) |
        (1 << DRV_DIR) |
        (1 << DRV_ENABLE) |
        (1 << LCD_D5) |
        (1 << LCD_D6) |
        (1 << LCD_D7);

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
    lcd_init();

    pca9685_init(0x00, 50);
    _delay_ms(10);

    pca9685_servo(LID_SERVO_CHANNEL, LID_CLOSED_ANGLE);
    pca9685_servo(ANALYSIS_GATE_SERVO_CHANNEL, GATE_CLOSED_ANGLE);
    halfdoor_stop();

    highScore = eeprom_read_byte(&eepromHighScore);

    if (highScore == 0xFF) {
        highScore = 0;
        eeprom_write_byte(&eepromHighScore, highScore);
    }

    lcd_clear();
    lcd_print("R3Bin ready");
    lcd_set_cursor(1, 0);
    lcd_print("High score:");
    lcd_print_uint8(highScore);
    _delay_ms(1500);
}

/* ============================================================
   MAIN PROGRAM
   ============================================================ */

int main(void)
{
    SystemMode currentMode;
    SystemMode lockedMode;

    hardware_init();

    while (1) {
        currentMode = read_mode_from_pot();

        lcd_clear();
        lcd_print("Select mode:");
        lcd_set_cursor(1, 0);
        lcd_print(mode_name(currentMode));

        for (uint8_t i = 0; i < 10; i++) {
            if (hand_detected()) {
                lockedMode = read_mode_from_pot();

                lcd_clear();
                lcd_print("Locked:");
                lcd_set_cursor(1, 0);
                lcd_print(mode_name(lockedMode));
                _delay_ms(800);

                if (lockedMode == MODE_FILTERING) {
                    run_filtering_mode();
                } else if (lockedMode == MODE_GAME) {
                    run_game_mode();
                } else if (lockedMode == MODE_CAPACITY) {
                    run_capacity_mode();
                }
            }

            _delay_ms(100);
        }
    }

    return 0;
}
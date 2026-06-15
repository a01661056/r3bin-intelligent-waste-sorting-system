#define F_CPU 8000000UL

#include <avr/eeprom.h>
#include <avr/io.h>
#include <stdint.h>
#include <string.h>
#include <util/delay.h>

/*
   R3Bin diagnostic firmware: same system skeleton as atmega16.c,
   but with all I2C/PCA9685/servo code removed.

   Use this to test the ATmega16 PCB, LCD, potentiometer, ultrasonic,
   UART, category LEDs, buzzer, capacity sensors, workspace light, and
   DRV8825 stepper pins without risking an I2C lockup.
*/

/* ============================================================
   PIN DEFINITIONS
   ============================================================ */

#define POT_MODE_SELECTOR PA0
#define WORKSPACE_LIGHT   PA1

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
#define RPI_RESPONSE_TIMEOUT_100MS 200

// DRV8825 / NEMA test settings.
#define STEPPER_STEPS_PER_REV 200UL
#define STEPPER_MICROSTEPS 16UL
#define STEPPER_TOTAL_STEPS (STEPPER_STEPS_PER_REV * STEPPER_MICROSTEPS)
#define STEPPER_STEPS_PER_60_DEG (STEPPER_TOTAL_STEPS / 6)

// Start slow for PCB/system testing. Lower values are faster.
#define STEPPER_STEP_HIGH_US 2000
#define STEPPER_STEP_LOW_US  2000

// Flip this if the disk direction is backwards.
#define STEPPER_DIR_HIGH_FOR_FORWARD 1

uint16_t currentDiskPositionSteps = 0;

uint8_t EEMEM eepromHighScore;
uint8_t highScore = 0;

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

typedef enum {
    CLASSIFICATION_OK = 0,
    CLASSIFICATION_NO_OBJECT = 1,
    CLASSIFICATION_TIMEOUT = 2
} ClassificationResult;

/* ============================================================
   BASIC DELAYS
   ============================================================ */

static void delay_ms_variable(uint16_t ms)
{
    while (ms > 0) {
        _delay_ms(1);
        ms--;
    }
}

/* ============================================================
   LCD 4-BIT DRIVER
   ============================================================ */

static void lcd_pulse_enable(void)
{
    PORTD |= (1 << LCD_E);
    _delay_us(1);
    PORTD &= ~(1 << LCD_E);
    _delay_us(100);
}

static void lcd_write_nibble(uint8_t nibble)
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

static void lcd_send(uint8_t value, uint8_t rs)
{
    if (rs) PORTD |= (1 << LCD_RS);
    else PORTD &= ~(1 << LCD_RS);

    lcd_write_nibble(value >> 4);
    lcd_write_nibble(value & 0x0F);
}

static void lcd_command(uint8_t command)
{
    lcd_send(command, 0);
}

static void lcd_data(uint8_t data)
{
    lcd_send(data, 1);
}

static void lcd_clear(void)
{
    lcd_command(0x01);
    _delay_ms(2);
}

static void lcd_set_cursor(uint8_t row, uint8_t col)
{
    uint8_t address = (row == 0) ? col : (0x40 + col);
    lcd_command(0x80 | address);
}

static void lcd_print(const char *text)
{
    while (*text) {
        lcd_data((uint8_t)*text++);
    }
}

static void lcd_print_uint8(uint8_t value)
{
    if (value >= 100) {
        lcd_data('0' + (value / 100));
        lcd_data('0' + ((value / 10) % 10));
        lcd_data('0' + (value % 10));
    } else if (value >= 10) {
        lcd_data('0' + (value / 10));
        lcd_data('0' + (value % 10));
    } else {
        lcd_data('0' + value);
    }
}

static void lcd_init(void)
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

    lcd_command(0x28); // 4-bit, 2 lines, 5x8 font.
    lcd_command(0x0C); // Display on, cursor off.
    lcd_command(0x06); // Entry mode.
    lcd_clear();
}

/* ============================================================
   ADC / POTENTIOMETER
   ============================================================ */

static void adc_init(void)
{
    ADMUX = (1 << REFS0); // AVCC reference, ADC0 selected.
    ADCSRA = (1 << ADEN) | (1 << ADPS2) | (1 << ADPS1);
}

static uint16_t adc_read(uint8_t channel)
{
    ADMUX = (ADMUX & 0xE0) | (channel & 0x07);
    ADCSRA |= (1 << ADSC);

    while (ADCSRA & (1 << ADSC));

    return ADC;
}

static SystemMode read_mode_from_pot(void)
{
    uint16_t value = adc_read(POT_MODE_SELECTOR);

    if (value < 341) {
        return MODE_CAPACITY;
    }

    if (value < 682) {
        return MODE_FILTERING;
    }

    return MODE_GAME;
}

static const char *mode_name(SystemMode mode)
{
    if (mode == MODE_CAPACITY) return "Capacity";
    if (mode == MODE_FILTERING) return "Filtering";
    return "Game";
}

static const char *category_name(WasteCategory category)
{
    if (category == CAT_METAL) return "Metal";
    if (category == CAT_ORGANIC) return "Organic";
    if (category == CAT_PAPER) return "Paper/card";
    if (category == CAT_PLASTIC) return "Plastic";
    if (category == CAT_BATTERIES) return "Batteries";
    return "Other";
}

/* ============================================================
   UART
   ============================================================ */

static void uart_init(void)
{
    UBRRH = 0;
    UBRRL = UART_BAUD_9600_8MHZ;
    UCSRB = (1 << RXEN) | (1 << TXEN);
    UCSRC = (1 << URSEL) | (1 << UCSZ1) | (1 << UCSZ0);
}

static void uart_send_char(char c)
{
    while (!(UCSRA & (1 << UDRE)));
    UDR = (uint8_t)c;
}

static void uart_send_string(const char *text)
{
    while (*text) {
        uart_send_char(*text++);
    }
}

static uint8_t uart_available(void)
{
    return (UCSRA & (1 << RXC)) != 0;
}

static char uart_read_char(void)
{
    return (char)UDR;
}

static uint8_t uart_read_line(char *buffer, uint8_t maxLen, uint16_t timeout100ms)
{
    uint8_t index = 0;

    while (timeout100ms > 0) {
        for (uint8_t i = 0; i < 100; i++) {
            if (uart_available()) {
                char c = uart_read_char();

                if (c == '\r') {
                    continue;
                }

                if (c == '\n') {
                    buffer[index] = '\0';
                    return index > 0;
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
    return index > 0;
}

static ClassificationResult parse_classification(
    const char *message,
    WasteCategory *category
)
{
    if (strcmp(message, "metal") == 0) {
        *category = CAT_METAL;
        return CLASSIFICATION_OK;
    }

    if (strcmp(message, "organic") == 0) {
        *category = CAT_ORGANIC;
        return CLASSIFICATION_OK;
    }

    if (strcmp(message, "paper") == 0 || strcmp(message, "cardboard") == 0) {
        *category = CAT_PAPER;
        return CLASSIFICATION_OK;
    }

    if (strcmp(message, "plastic") == 0) {
        *category = CAT_PLASTIC;
        return CLASSIFICATION_OK;
    }

    if (strcmp(message, "batteries") == 0 || strcmp(message, "battery") == 0) {
        *category = CAT_BATTERIES;
        return CLASSIFICATION_OK;
    }

    if (strcmp(message, "other") == 0) {
        *category = CAT_OTHER;
        return CLASSIFICATION_OK;
    }

    if (strcmp(message, "no_object") == 0 || strcmp(message, "none") == 0) {
        return CLASSIFICATION_NO_OBJECT;
    }

    *category = CAT_OTHER;
    return CLASSIFICATION_OK;
}

static ClassificationResult run_vision_capture(WasteCategory *category)
{
    char response[20];

    lcd_clear();
    lcd_print("UART capture");
    lcd_set_cursor(1, 0);
    lcd_print("No I2C test");

    uart_send_string("CAPTURE\n");

    if (!uart_read_line(response, sizeof(response), RPI_RESPONSE_TIMEOUT_100MS)) {
        return CLASSIFICATION_TIMEOUT;
    }

    return parse_classification(response, category);
}

/* ============================================================
   LEDS / BUZZER / LIGHT
   ============================================================ */

static void workspace_light_on(void)
{
    PORTA |= (1 << WORKSPACE_LIGHT);
}

static void workspace_light_off(void)
{
    PORTA &= ~(1 << WORKSPACE_LIGHT);
}

static void buzzer_short(void)
{
    PORTD |= (1 << BUZZER);
    _delay_ms(120);
    PORTD &= ~(1 << BUZZER);
}

static void buzzer_long(void)
{
    PORTD |= (1 << BUZZER);
    _delay_ms(900);
    PORTD &= ~(1 << BUZZER);
}

static void all_category_leds_off(void)
{
    PORTC &=
        ~((1 << LED_METAL) |
          (1 << LED_ORGANIC) |
          (1 << LED_PAPER) |
          (1 << LED_PLASTIC) |
          (1 << LED_BATTERIES) |
          (1 << LED_OTHER));
}

static void led_for_category_on(WasteCategory category)
{
    all_category_leds_off();

    if (category == CAT_METAL) PORTC |= (1 << LED_METAL);
    else if (category == CAT_ORGANIC) PORTC |= (1 << LED_ORGANIC);
    else if (category == CAT_PAPER) PORTC |= (1 << LED_PAPER);
    else if (category == CAT_PLASTIC) PORTC |= (1 << LED_PLASTIC);
    else if (category == CAT_BATTERIES) PORTC |= (1 << LED_BATTERIES);
    else PORTC |= (1 << LED_OTHER);
}

/* ============================================================
   ULTRASONIC
   ============================================================ */

static uint16_t read_ultrasonic_time_us(void)
{
    uint32_t timeout;

    PORTD &= ~(1 << HCSR04_TRIG);
    _delay_us(2);
    PORTD |= (1 << HCSR04_TRIG);
    _delay_us(10);
    PORTD &= ~(1 << HCSR04_TRIG);

    timeout = 60000;
    while ((PIND & (1 << HCSR04_ECHO)) == 0) {
        if (--timeout == 0) return 0;
    }

    TCNT1 = 0;
    TCCR1A = 0;
    TCCR1B = (1 << CS11); // /8 = 1 us per tick at 8 MHz.

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

static uint8_t hand_detected(void)
{
    uint16_t echoTime = read_ultrasonic_time_us();
    uint16_t cm;

    if (echoTime == 0) {
        return 0;
    }

    cm = echoTime / 58;
    return cm > 0 && cm <= HAND_DETECT_CM;
}

/* ============================================================
   CAPACITY SENSORS
   ============================================================ */

static uint8_t full_sensor_pressed(uint8_t pin)
{
    // FC-51 modules are commonly active-low when detecting an object.
    return (PINA & (1 << pin)) == 0;
}

static uint8_t selected_bin_is_75_or_more(WasteCategory category)
{
    if (category == CAT_METAL) return full_sensor_pressed(METAL_FULL_SENSOR);
    if (category == CAT_ORGANIC) return full_sensor_pressed(ORGANIC_FULL_SENSOR);
    if (category == CAT_PAPER) return full_sensor_pressed(PAPER_FULL_SENSOR);
    if (category == CAT_PLASTIC) return full_sensor_pressed(PLASTIC_FULL_SENSOR);
    if (category == CAT_BATTERIES) return full_sensor_pressed(BATTERIES_FULL_SENSOR);
    return full_sensor_pressed(OTHER_FULL_SENSOR);
}

static uint8_t capacity_led_mask(void)
{
    uint8_t mask = 0;

    if (full_sensor_pressed(METAL_FULL_SENSOR)) mask |= (1 << 0);
    if (full_sensor_pressed(ORGANIC_FULL_SENSOR)) mask |= (1 << 1);
    if (full_sensor_pressed(PAPER_FULL_SENSOR)) mask |= (1 << 2);
    if (full_sensor_pressed(PLASTIC_FULL_SENSOR)) mask |= (1 << 3);
    if (full_sensor_pressed(BATTERIES_FULL_SENSOR)) mask |= (1 << 4);
    if (full_sensor_pressed(OTHER_FULL_SENSOR)) mask |= (1 << 5);

    return mask;
}

static void show_capacity_led_mask(uint8_t mask)
{
    all_category_leds_off();

    if (mask & (1 << 0)) PORTC |= (1 << LED_METAL);
    if (mask & (1 << 1)) PORTC |= (1 << LED_ORGANIC);
    if (mask & (1 << 2)) PORTC |= (1 << LED_PAPER);
    if (mask & (1 << 3)) PORTC |= (1 << LED_PLASTIC);
    if (mask & (1 << 4)) PORTC |= (1 << LED_BATTERIES);
    if (mask & (1 << 5)) PORTC |= (1 << LED_OTHER);
}

/* ============================================================
   DRV8825 / STEPPER
   ============================================================ */

static void stepper_enable(void)
{
    PORTB &= ~(1 << DRV_ENABLE); // DRV8825 enable is active-low.
}

static void stepper_disable(void)
{
    PORTB |= (1 << DRV_ENABLE);
}

static void stepper_set_forward(void)
{
#if STEPPER_DIR_HIGH_FOR_FORWARD
    PORTB |= (1 << DRV_DIR);
#else
    PORTB &= ~(1 << DRV_DIR);
#endif
}

static void stepper_set_backward(void)
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
    _delay_us(STEPPER_STEP_HIGH_US);
    PORTB &= ~(1 << DRV_STEP);
    _delay_us(STEPPER_STEP_LOW_US);
}

static void stepper_move_steps(uint16_t steps)
{
    stepper_enable();

    for (uint16_t i = 0; i < steps; i++) {
        stepper_step_once();
    }

    stepper_disable();
}

static uint16_t target_steps_for_category(WasteCategory category)
{
    if (category == CAT_METAL) return 1 * STEPPER_STEPS_PER_60_DEG;
    if (category == CAT_ORGANIC) return 2 * STEPPER_STEPS_PER_60_DEG;
    if (category == CAT_PAPER) return 3 * STEPPER_STEPS_PER_60_DEG;
    if (category == CAT_PLASTIC) return 4 * STEPPER_STEPS_PER_60_DEG;
    if (category == CAT_BATTERIES) return 5 * STEPPER_STEPS_PER_60_DEG;
    return 0;
}

static void rotate_disk_to_category(WasteCategory category)
{
    uint16_t target = target_steps_for_category(category);

    lcd_clear();
    lcd_print("Stepper move");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));

    if (target >= currentDiskPositionSteps) {
        stepper_set_forward();
        stepper_move_steps(target - currentDiskPositionSteps);
    } else {
        stepper_set_backward();
        stepper_move_steps(currentDiskPositionSteps - target);
    }

    currentDiskPositionSteps = target;
    _delay_ms(500);
}

static void return_disk_to_home(void)
{
    if (currentDiskPositionSteps == 0) {
        return;
    }

    lcd_clear();
    lcd_print("Stepper home");
    lcd_set_cursor(1, 0);
    lcd_print("No I2C test");

    stepper_set_backward();
    stepper_move_steps(currentDiskPositionSteps);
    currentDiskPositionSteps = 0;
    _delay_ms(500);
}

/* ============================================================
   MODE WORKFLOWS WITHOUT SERVOS
   ============================================================ */

static void no_i2c_wait_for_drop_window(void)
{
    lcd_clear();
    lcd_print("No servo lid");
    lcd_set_cursor(1, 0);
    lcd_print("Wait 5 sec");

    delay_ms_variable(5000);
}

static void process_sorted_object(WasteCategory category, uint8_t checkCapacity)
{
    led_for_category_on(category);

    rotate_disk_to_category(category);

    lcd_clear();
    lcd_print("No servo drop");
    lcd_set_cursor(1, 0);
    lcd_print("Sim wait 2 sec");
    _delay_ms(2000);

    if (checkCapacity && selected_bin_is_75_or_more(category)) {
        lcd_clear();
        lcd_print("Bin full:");
        lcd_set_cursor(1, 0);
        lcd_print(category_name(category));
        buzzer_long();
        while (1) {
            led_for_category_on(category);
            _delay_ms(500);
            all_category_leds_off();
            _delay_ms(500);
        }
    }

    return_disk_to_home();
    all_category_leds_off();
}

static void run_filtering_mode(void)
{
    WasteCategory category = CAT_OTHER;
    ClassificationResult result;

    lcd_clear();
    lcd_print("Filtering");
    lcd_set_cursor(1, 0);
    lcd_print("No I2C");
    _delay_ms(800);

    no_i2c_wait_for_drop_window();

    workspace_light_on();
    _delay_ms(300);

    result = run_vision_capture(&category);
    workspace_light_off();

    if (result == CLASSIFICATION_NO_OBJECT) {
        lcd_clear();
        lcd_print("No object");
        lcd_set_cursor(1, 0);
        lcd_print("Unlocked");
        _delay_ms(1500);
        return;
    }

    if (result == CLASSIFICATION_TIMEOUT) {
        lcd_clear();
        lcd_print("Raspberry");
        lcd_set_cursor(1, 0);
        lcd_print("No response");
        buzzer_long();
        _delay_ms(1500);
        return;
    }

    lcd_clear();
    lcd_print("Classified:");
    lcd_set_cursor(1, 0);
    lcd_print(category_name(category));
    _delay_ms(1000);

    process_sorted_object(category, 1);

    lcd_clear();
    lcd_print("Filtering done");
    lcd_set_cursor(1, 0);
    lcd_print("Unlocked");
    _delay_ms(1000);
}

static void run_game_mode(void)
{
    WasteCategory category = CAT_OTHER;
    ClassificationResult result;

    lcd_clear();
    lcd_print("Game test");
    lcd_set_cursor(1, 0);
    lcd_print("Need: Metal");
    led_for_category_on(CAT_METAL);
    _delay_ms(800);

    no_i2c_wait_for_drop_window();

    workspace_light_on();
    result = run_vision_capture(&category);
    workspace_light_off();

    if (result != CLASSIFICATION_OK) {
        lcd_clear();
        lcd_print("Game no result");
        buzzer_long();
        _delay_ms(1500);
        return;
    }

    if (category == CAT_METAL) {
        buzzer_short();
        if (highScore < 1) {
            highScore = 1;
            eeprom_write_byte(&eepromHighScore, highScore);
        }
        process_sorted_object(category, 0);
    } else {
        buzzer_long();
    }

    lcd_clear();
    lcd_print("Game done");
    lcd_set_cursor(1, 0);
    lcd_print("High:");
    lcd_print_uint8(highScore);
    _delay_ms(1500);
}

static void run_capacity_mode(void)
{
    uint8_t mask = capacity_led_mask();

    show_capacity_led_mask(mask);

    if (mask == 0) {
        lcd_clear();
        lcd_print("Capacity check");
        lcd_set_cursor(1, 0);
        lcd_print("None full");

        for (uint8_t i = 10; i > 0; i--) {
            lcd_set_cursor(1, 0);
            lcd_print("Unlock in ");
            lcd_print_uint8(i);
            lcd_print("s ");
            _delay_ms(1000);
        }

        all_category_leds_off();
        return;
    }

    lcd_clear();
    lcd_print("Bins full");
    lcd_set_cursor(1, 0);
    lcd_print("Reset after empty");
    buzzer_long();

    while (1) {
        show_capacity_led_mask(mask);
        _delay_ms(500);
        all_category_leds_off();
        _delay_ms(500);
        mask = capacity_led_mask();
    }
}

/* ============================================================
   HARDWARE INIT
   ============================================================ */

static void hardware_init(void)
{
    DDRA = (1 << WORKSPACE_LIGHT);
    PORTA =
        (1 << METAL_FULL_SENSOR) |
        (1 << ORGANIC_FULL_SENSOR) |
        (1 << PAPER_FULL_SENSOR) |
        (1 << PLASTIC_FULL_SENSOR) |
        (1 << BATTERIES_FULL_SENSOR) |
        (1 << OTHER_FULL_SENSOR);

    workspace_light_off();

    DDRB =
        (1 << DRV_STEP) |
        (1 << DRV_DIR) |
        (1 << DRV_ENABLE) |
        (1 << LCD_D5) |
        (1 << LCD_D6) |
        (1 << LCD_D7);

    PORTB &= ~(1 << DRV_STEP);
    stepper_disable();

    DDRC =
        (1 << LED_METAL) |
        (1 << LED_ORGANIC) |
        (1 << LED_PAPER) |
        (1 << LED_PLASTIC) |
        (1 << LED_BATTERIES) |
        (1 << LED_OTHER);

    all_category_leds_off();

    DDRD =
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

    highScore = eeprom_read_byte(&eepromHighScore);
    if (highScore == 0xFF) {
        highScore = 0;
        eeprom_write_byte(&eepromHighScore, highScore);
    }

    lcd_clear();
    lcd_print("R3Bin no I2C");
    lcd_set_cursor(1, 0);
    lcd_print("High:");
    lcd_print_uint8(highScore);
    _delay_ms(1500);
}

/* ============================================================
   MAIN
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
                } else {
                    run_capacity_mode();
                }
            }

            _delay_ms(100);
        }
    }

    return 0;
}

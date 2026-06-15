#define F_CPU 8000000UL

#include <avr/io.h>
#include <stdint.h>
#include <util/delay.h>

/* ============================================================
   LCD PIN DEFINITIONS - same wiring as main firmware
   ============================================================ */

#define LCD_D5 PB3
#define LCD_D6 PB4
#define LCD_D7 PB5

#define LCD_RS PD5
#define LCD_E  PD6
#define LCD_D4 PD7

#define BUZZER PD4

/* ============================================================
   I2C / PCA9685 DEFINITIONS - same pins: PC0=SCL, PC1=SDA
   ============================================================ */

#define F_I2C 100000UL
#define PCA9685_ADDRESS 0x40
#define I2C_TIMEOUT 60000UL

/* ============================================================
   DELAY / BUZZER
   ============================================================ */

void beep(uint8_t times)
{
    for (uint8_t i = 0; i < times; i++) {
        PORTD |= (1 << BUZZER);
        _delay_ms(120);
        PORTD &= ~(1 << BUZZER);
        _delay_ms(180);
    }
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

/* ============================================================
   I2C TEST FUNCTIONS
   ============================================================ */

void i2c_init(void)
{
    TWSR &= ~((1 << TWPS1) | (1 << TWPS0));
    TWBR = ((F_CPU / F_I2C) - 16) / 2;
    TWCR = (1 << TWEN);
}

uint8_t i2c_wait_twint(void)
{
    uint32_t timeout = I2C_TIMEOUT;

    while (!(TWCR & (1 << TWINT))) {
        if (--timeout == 0) {
            return 0;
        }
    }

    return 1;
}

uint8_t i2c_probe_address(uint8_t address)
{
    uint8_t status;

    TWCR = (1 << TWINT) | (1 << TWSTA) | (1 << TWEN);
    if (!i2c_wait_twint()) {
        return 0;
    }

    status = TWSR & 0xF8;
    if (status != 0x08 && status != 0x10) {
        TWCR = (1 << TWINT) | (1 << TWSTO) | (1 << TWEN);
        return 0;
    }

    TWDR = (address << 1);
    TWCR = (1 << TWINT) | (1 << TWEN);
    if (!i2c_wait_twint()) {
        TWCR = (1 << TWINT) | (1 << TWSTO) | (1 << TWEN);
        return 0;
    }

    status = TWSR & 0xF8;

    TWCR = (1 << TWINT) | (1 << TWSTO) | (1 << TWEN);

    return (status == 0x18);
}

uint8_t pca9685_write_mode1(void)
{
    uint8_t status;

    TWCR = (1 << TWINT) | (1 << TWSTA) | (1 << TWEN);
    if (!i2c_wait_twint()) return 0;

    TWDR = (PCA9685_ADDRESS << 1);
    TWCR = (1 << TWINT) | (1 << TWEN);
    if (!i2c_wait_twint()) return 0;
    status = TWSR & 0xF8;
    if (status != 0x18) return 0;

    TWDR = 0x00;
    TWCR = (1 << TWINT) | (1 << TWEN);
    if (!i2c_wait_twint()) return 0;
    status = TWSR & 0xF8;
    if (status != 0x28) return 0;

    TWDR = 0b00100001;
    TWCR = (1 << TWINT) | (1 << TWEN);
    if (!i2c_wait_twint()) return 0;
    status = TWSR & 0xF8;

    TWCR = (1 << TWINT) | (1 << TWSTO) | (1 << TWEN);

    return (status == 0x28);
}

/* ============================================================
   MAIN
   ============================================================ */

int main(void)
{
    DDRB |= (1 << LCD_D5) | (1 << LCD_D6) | (1 << LCD_D7);
    DDRD |= (1 << LCD_RS) | (1 << LCD_E) | (1 << LCD_D4) | (1 << BUZZER);

    PORTD &= ~(1 << BUZZER);

    lcd_init();

    lcd_clear();
    lcd_print("LCD OK");
    lcd_set_cursor(1, 0);
    lcd_print("Testing I2C...");
    beep(1);
    _delay_ms(1000);

    i2c_init();

    if (i2c_probe_address(PCA9685_ADDRESS)) {
        lcd_clear();
        lcd_print("I2C ACK OK");
        lcd_set_cursor(1, 0);
        lcd_print("PCA9685 0x40");
        beep(2);
        _delay_ms(1200);

        if (pca9685_write_mode1()) {
            lcd_clear();
            lcd_print("PCA write OK");
            lcd_set_cursor(1, 0);
            lcd_print("Bus working");
            beep(3);
        } else {
            lcd_clear();
            lcd_print("PCA write FAIL");
            lcd_set_cursor(1, 0);
            lcd_print("Check SDA/SCL");
            beep(5);
        }
    } else {
        lcd_clear();
        lcd_print("I2C FAIL");
        lcd_set_cursor(1, 0);
        lcd_print("No ACK 0x40");
        beep(5);
    }

    while (1) {
        _delay_ms(1000);
    }

    return 0;
}

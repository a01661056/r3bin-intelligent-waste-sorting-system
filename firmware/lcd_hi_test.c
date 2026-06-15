#ifndef F_CPU
#define F_CPU 8000000UL
#endif

#include <avr/io.h>
#include <util/delay.h>

/*
   Minimal 16x2 parallel LCD test for ATmega16.

   Expected wiring:
   LCD RS -> PD5
   LCD E  -> PD6
   LCD D4 -> PD7
   LCD D5 -> PB3
   LCD D6 -> PB4
   LCD D7 -> PB5
   LCD RW -> GND
   LCD VSS -> GND
   LCD VDD -> +5V
   LCD VO  -> contrast potentiometer middle pin

   PC2 blinks as a heartbeat so we can confirm the ATmega is running
   even if the LCD still only shows squares.
*/

#define LCD_D5 PB3
#define LCD_D6 PB4
#define LCD_D7 PB5

#define LCD_RS PD5
#define LCD_E  PD6
#define LCD_D4 PD7

#define HEARTBEAT_LED PC2

static void lcd_pulse_enable(void)
{
    PORTD |= (1 << LCD_E);
    _delay_us(2);
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

    if (command == 0x01 || command == 0x02) {
        _delay_ms(2);
    } else {
        _delay_us(50);
    }
}

static void lcd_data(uint8_t data)
{
    lcd_send(data, 1);
    _delay_us(50);
}

static void lcd_clear(void)
{
    lcd_command(0x01);
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

static void lcd_init(void)
{
    _delay_ms(80);

    PORTD &= ~(1 << LCD_RS);
    PORTD &= ~(1 << LCD_E);

    // Standard HD44780 4-bit startup sequence.
    lcd_write_nibble(0x03);
    _delay_ms(5);

    lcd_write_nibble(0x03);
    _delay_ms(5);

    lcd_write_nibble(0x03);
    _delay_ms(1);

    lcd_write_nibble(0x02);
    _delay_ms(1);

    lcd_command(0x28); // 4-bit, 2 lines, 5x8 font.
    lcd_command(0x0C); // Display on, cursor off.
    lcd_command(0x06); // Increment cursor.
    lcd_clear();
}

int main(void)
{
    DDRB |= (1 << LCD_D5) | (1 << LCD_D6) | (1 << LCD_D7);
    DDRD |= (1 << LCD_RS) | (1 << LCD_E) | (1 << LCD_D4);
    DDRC |= (1 << HEARTBEAT_LED);

    PORTB &= ~((1 << LCD_D5) | (1 << LCD_D6) | (1 << LCD_D7));
    PORTD &= ~((1 << LCD_RS) | (1 << LCD_E) | (1 << LCD_D4));
    PORTC &= ~(1 << HEARTBEAT_LED);

    lcd_init();

    lcd_set_cursor(0, 0);
    lcd_print("HI");
    lcd_set_cursor(1, 0);
    lcd_print("LCD TEST");

    while (1) {
        PORTC ^= (1 << HEARTBEAT_LED);
        _delay_ms(500);
    }

    return 0;
}

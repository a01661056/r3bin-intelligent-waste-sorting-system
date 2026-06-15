#ifndef F_CPU
#define F_CPU 8000000UL
#endif

#include <avr/io.h>
#include <stdint.h>
#include <util/delay.h>

/*
   KW11 limit switch quick test

   Wiring:
   - KW11 COM -> GND
   - KW11 NO  -> PB6
   - Metal LED/resistor -> PC2

   PB6 uses the ATmega16 internal pull-up:
   - Not pressed = HIGH
   - Pressed     = LOW
*/

#define KW11_HOME_SWITCH PB6
#define METAL_LED        PC2

// Set this to 1 if your PC2 LED turns on when the pin is LOW.
#define METAL_LED_ACTIVE_LOW 0

static uint8_t kw11_pressed(void)
{
    return (PINB & (1 << KW11_HOME_SWITCH)) == 0;
}

static void metal_led_on(void)
{
#if METAL_LED_ACTIVE_LOW
    PORTC &= ~(1 << METAL_LED);
#else
    PORTC |= (1 << METAL_LED);
#endif
}

static void metal_led_off(void)
{
#if METAL_LED_ACTIVE_LOW
    PORTC |= (1 << METAL_LED);
#else
    PORTC &= ~(1 << METAL_LED);
#endif
}

int main(void)
{
    // PB6 input with internal pull-up enabled for switch-to-GND wiring.
    DDRB &= ~(1 << KW11_HOME_SWITCH);
    PORTB |= (1 << KW11_HOME_SWITCH);

    // PC2 output for metal LED.
    DDRC |= (1 << METAL_LED);
    metal_led_off();

    while (1) {
        if (kw11_pressed()) {
            metal_led_on();
        } else {
            metal_led_off();
        }

        _delay_ms(10);
    }

    return 0;
}

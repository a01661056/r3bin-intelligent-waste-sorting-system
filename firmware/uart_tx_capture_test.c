#define F_CPU 8000000UL

#include <avr/io.h>
#include <util/delay.h>

#define UART_BAUD_9600_8MHZ 51
#define BUZZER PD4

void uart_init(void)
{
    UBRRH = 0;
    UBRRL = UART_BAUD_9600_8MHZ;

    UCSRB = (1 << TXEN);
    UCSRC = (1 << URSEL) | (1 << UCSZ1) | (1 << UCSZ0);
}

void uart_send_char(char c)
{
    while (!(UCSRA & (1 << UDRE)));
    UDR = c;
}

void beep_once(void)
{
    PORTD |= (1 << BUZZER);
    _delay_ms(80);
    PORTD &= ~(1 << BUZZER);
}

int main(void)
{
    DDRD |= (1 << BUZZER);
    PORTD &= ~(1 << BUZZER);

    uart_init();

    while (1) {
        uart_send_char('1');
        beep_once();
        _delay_ms(1000);
    }

    return 0;
}

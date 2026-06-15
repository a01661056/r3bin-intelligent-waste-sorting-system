#include <avr/io.h>

int main(void)
{
    DDRD |= (1<<PD1);
    PORTD |= (1<<PD1);
    while(1);
}
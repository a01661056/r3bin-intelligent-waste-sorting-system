#define F_CPU 8000000UL

#include <avr/io.h>
#include <avr/eeprom.h>
#include <avr/interrupt.h>
#include <avr/pgmspace.h>
#include <stdint.h>
#include <string.h>
#include <util/delay.h>



//I2C / TWI Constants

#define F_I2C 100000LL

#define TRANSMISSION_SUCCESS -1
#define TRANSMISSION_ERROR   -2

#define MASTER_TRANSMITTER 0
#define MASTER_RECEIVER    1

static uint8_t masterMode;

#define UART_RX_BUFFER_SIZE 32

volatile char uartRxBuffer[UART_RX_BUFFER_SIZE];
volatile uint8_t uartRxHead = 0;
volatile uint8_t uartRxTail = 0;



// PCA9685 and Servo Constants

#define SERVO0 0x06

#define NEUTRAL_PULSE 1500
#define MAX_PULSE     2600
#define MIN_PULSE     900
#define MAX_ANGLE     90

#define LID_SERVO_CHANNEL            0
#define PHOTO_BOOTH_LEFT_SERVO_CHANNEL   4
#define PHOTO_BOOTH_RIGHT_SERVO_CHANNEL  8

// Lid servo on channel 0.
#define LID_CLOSED_ANGLE 0
#define LID_OPEN_ANGLE -90

// Lid motion speed.
#define LID_SWEEP_STEP_DEG 5

// Left photo-booth/drop servo on channel 4.
#define PHOTO_BOOTH_LEFT_HOLD_ANGLE 10
#define PHOTO_BOOTH_LEFT_DROP_ANGLE -40

// Right photo-booth and drop servo on channel 8.
#define PHOTO_BOOTH_RIGHT_HOLD_ANGLE -35
#define PHOTO_BOOTH_RIGHT_DROP_ANGLE 12

// Photo-booth and drop motion speed.
#define PHOTO_BOOTH_SWEEP_STEP_DEG 5

uint16_t globalFrequency;
uint8_t globalAddress;




// Pin and Port Definitions on ATmega16

#define POT_MODE_SELECTOR PA0
#define GAME_HIGH_SCORE_RESET_BUTTON PA1
#define STATS_COUNT_RESET_BUTTON PA3

#define DRV_STEP PB0
#define DRV_DIR PB1
#define DRV_ENABLE PB2

#define LCD_D5 PB3
#define LCD_D6 PB4
#define LCD_D7 PB5

#define KW11_HOME PB6

#define LED_METAL PC2
#define LED_ORGANIC PC3
#define LED_PAPER PC4
#define LED_PLASTIC PC5
#define LED_BATTERIES PC6
#define LED_OTHER PC7

#define UART_RX PD0
#define UART_TX PD1

#define HCSR04_ECHO PD2
#define HCSR04_TRIG PD3

#define BUZZER PD4

#define LCD_RS PD5
#define LCD_E PD6
#define LCD_D4 PD7


#define STEPPER_OTHER_POSITION_STEPS     0
#define STEPPER_PLASTIC_POSITION_STEPS   75
#define STEPPER_PAPER_POSITION_STEPS     105
#define STEPPER_METAL_POSITION_STEPS     125
#define STEPPER_ORGANIC_POSITION_STEPS   155
#define STEPPER_BATTERIES_POSITION_STEPS 190

#define STEPPER_TOTAL_STEPS 588

uint16_t currentDiskPositionSteps = 0;
uint8_t diskIsHomed = 0;




// EEPROM

uint8_t EEMEM eepromHighScore;
uint16_t EEMEM eepromBinCounts[6];
uint8_t highScore = 0;
uint16_t binCounts[6];



// Modes and categories constants

#define MODE_STATS 0
#define MODE_FILTERING 1
#define MODE_GAME 2

#define CAT_OTHER 0
#define CAT_METAL 1
#define CAT_ORGANIC 2
#define CAT_PAPER 3
#define CAT_PLASTIC 4
#define CAT_BATTERIES 5

#define CLASSIFICATION_OK 0
#define CLASSIFICATION_NO_OBJECT 1
#define CLASSIFICATION_TIMEOUT 2


// Function prototypes

void i2c_init(void);
int8_t i2c_tx_start(uint8_t mode);
int8_t i2c_tx_address(uint8_t address);
int8_t i2c_tx_byte(uint8_t byteData);
void i2c_tx_stop(void);

void pca9685_init(uint8_t address, uint16_t freq);
void pca9685_servo(uint8_t servoNum, float angle);
uint8_t abs_i16(int16_t value);
void servo_sweep_calibrated(uint8_t channel, int8_t fromAngle, int8_t toAngle, uint8_t stepDeg, uint16_t stepDelayMs);
void photo_booth_set_pair(int8_t leftAngle, int8_t rightAngle);
void photo_booth_sweep_pair(int8_t fromLeftAngle, int8_t toLeftAngle, int8_t fromRightAngle, int8_t toRightAngle);
void lid_open(void);
void lid_close(void);
void photo_booth_hold_position(void);
void photo_booth_capture_position(void);
void photo_booth_drop_position(void);

void lcd_pulse_enable(void);
void lcd_write_nibble(uint8_t nibble);
void lcd_send(uint8_t value, uint8_t rs);
void lcd_command(uint8_t command);
void lcd_data(uint8_t data);
void lcd_init(void);
void lcd_boot_init(void);
void lcd_clear(void);
void lcd_set_cursor(uint8_t row, uint8_t col);
void lcd_print(const char *text);
void lcd_print_padded(const char *text);
void lcd_show_two_lines(const char *line0, const char *line1);
void lcd_show_idle_mode(uint8_t mode);
void lcd_print_uint8(uint8_t value);
void lcd_print_uint16(uint16_t value);
void lcd_lid_open_countdown(void);

void uart_init(void);
void uart_send_char(char c);
void uart_send_string(const char *text);
uint8_t uart_char_available(void);
char uart_receive_char(void);
uint8_t uart_read_line_timeout(char *buffer, uint8_t maxLen, uint16_t timeout100ms);
void uart_flush_rx(void);

void adc_init(void);
uint16_t adc_read(uint8_t channel);
uint8_t read_mode_from_pot(void);
uint32_t read_ultrasonic_us(void);
uint16_t read_ultrasonic_cm(void);
uint8_t hand_detected(void);

void all_category_leds_off(void);
void show_category_led(uint8_t category);
void buzzer_beep(uint8_t times);
const char* mode_name(uint8_t mode);
const char* category_name(uint8_t category);

uint8_t button_pressed(uint8_t pin);
uint8_t button_held_for_ms(uint8_t pin, uint16_t holdMs);
uint8_t game_reset_button_pressed(void);
void stats_load_counts(void);
void stats_increment_category(uint8_t category);
uint8_t high_score_reset_if_requested(void);
void delay_with_game_reset_poll(uint16_t ms);

void game_random_seed(void);
uint8_t game_random_choice(uint8_t maxExclusive);
uint8_t game_led_mask(uint8_t ledIndex);
uint8_t game_index_to_category(uint8_t ledIndex);
const char* game_led_name(uint8_t ledIndex);
void game_show_led(uint8_t ledIndex);
void game_correct_beep(void);
void game_wrong_beep_and_score(uint8_t score);
void game_update_high_score(uint8_t score);
uint8_t game_wait_for_object_and_classify(uint8_t *detectedCategory);
void game_end_and_save(uint8_t score);
void game_sort_object(uint8_t detectedCategory);

uint16_t category_to_step_position(uint8_t category);
void rotate_disk_to_category(uint8_t category);
void return_disk_to_home(void);

uint8_t parse_raspberry_category(const char *line, uint8_t *category);
uint8_t request_classification_from_raspberry(uint8_t *category);
uint8_t run_vision_capture(uint8_t *category);
void process_sorted_object(uint8_t category);

void filtering_mode(void);
void game_mode(void);
void stats_mode(void);
void hardware_init(void);




// I2C Functions

void i2c_init(void)
{
	TWSR &= ~((1 << TWPS1) | (1 << TWPS0));
	TWBR = ((F_CPU / F_I2C) - 16) / 2;
}

int8_t i2c_tx_start(uint8_t mode)
{
	int8_t status = 0;

	masterMode = mode;

	TWCR |= (1 << TWINT) | (1 << TWSTA) | (1 << TWEN);

	while (!(TWCR & (1 << TWINT)));

	switch (TWSR & 0xF8) {
		case 0x08:
		status = TRANSMISSION_SUCCESS;
		break;

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




// PCA9685 and Servo Functions

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

	volatile uint8_t prescalar = (25000000 / ((float)4096 * freq * 0.92)) - 1;

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

	uint16_t pulse_us = NEUTRAL_PULSE + angle * ((float)(MAX_PULSE - MIN_PULSE) / (2 * MAX_ANGLE));

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
	int16_t angle = fromAngle;
	int8_t direction;
	uint16_t delayRemaining;

	if (stepDeg == 0) {
		stepDeg = 1;
	}

	if (fromAngle < toAngle) {
		direction = 1;
		} else {
		direction = -1;
	}

	while (
	(direction > 0 && angle < toAngle) ||
	(direction < 0 && angle > toAngle)
	) {
		pca9685_servo(channel, angle);
		delayRemaining = stepDelayMs;
		while (delayRemaining > 0) {
			_delay_ms(1);
			delayRemaining--;
		}
		angle += direction * stepDeg;
	}

	pca9685_servo(channel, toAngle);
	delayRemaining = stepDelayMs;
	while (delayRemaining > 0) {
		_delay_ms(1);
		delayRemaining--;
	}
}

void photo_booth_set_pair(int8_t leftAngle, int8_t rightAngle)
{
	pca9685_servo(PHOTO_BOOTH_LEFT_SERVO_CHANNEL, leftAngle);
	pca9685_servo(PHOTO_BOOTH_RIGHT_SERVO_CHANNEL, rightAngle);
}

void photo_booth_sweep_pair(int8_t fromLeftAngle, int8_t toLeftAngle, int8_t fromRightAngle, int8_t toRightAngle)
{
	uint8_t leftTravel = abs_i16((int16_t)toLeftAngle - fromLeftAngle);
	uint8_t rightTravel = abs_i16((int16_t)toRightAngle - fromRightAngle);
	uint8_t maxTravel;
	uint8_t steps;

	if (leftTravel > rightTravel) {
		maxTravel = leftTravel;
		} else {
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
		int8_t leftAngle = fromLeftAngle + (((int16_t)toLeftAngle - fromLeftAngle) * i) / steps;

		int8_t rightAngle = fromRightAngle + (((int16_t)toRightAngle - fromRightAngle) * i) / steps;

		photo_booth_set_pair(leftAngle, rightAngle);
		_delay_ms(25);
	}
}

void lid_open(void)
{
	servo_sweep_calibrated(
	LID_SERVO_CHANNEL,
	LID_CLOSED_ANGLE,
	LID_OPEN_ANGLE,
	LID_SWEEP_STEP_DEG,
	25
	);
}

void lid_close(void)
{
	servo_sweep_calibrated(LID_SERVO_CHANNEL, LID_OPEN_ANGLE, LID_CLOSED_ANGLE, LID_SWEEP_STEP_DEG, 25);
}

void photo_booth_hold_position(void)
{
	photo_booth_set_pair(
	PHOTO_BOOTH_LEFT_HOLD_ANGLE,
	PHOTO_BOOTH_RIGHT_HOLD_ANGLE
	);
}

void photo_booth_capture_position(void)
{
	lcd_clear();
	lcd_print("Photo booth");
	lcd_set_cursor(1, 0);

	lcd_print("Ready");

	photo_booth_set_pair(
	PHOTO_BOOTH_LEFT_HOLD_ANGLE,
	PHOTO_BOOTH_RIGHT_HOLD_ANGLE
	);
}

void photo_booth_drop_position(void)
{
	lcd_clear();
	lcd_print("Dropping waste");
	lcd_set_cursor(1, 0);

	lcd_print("To slide");

	photo_booth_sweep_pair(PHOTO_BOOTH_LEFT_HOLD_ANGLE,PHOTO_BOOTH_LEFT_DROP_ANGLE,PHOTO_BOOTH_RIGHT_HOLD_ANGLE,PHOTO_BOOTH_RIGHT_DROP_ANGLE);
	_delay_ms(2000);

	photo_booth_sweep_pair(PHOTO_BOOTH_LEFT_DROP_ANGLE,PHOTO_BOOTH_LEFT_HOLD_ANGLE,PHOTO_BOOTH_RIGHT_DROP_ANGLE,PHOTO_BOOTH_RIGHT_HOLD_ANGLE);
}



// LCD Functions

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
	uint8_t address;

	if (row == 0) {
		address = col;
		} else {
		address = 0x40 + col;
	}

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

	while (*text && col < 16) {
		lcd_data(*text++);
		col++;
	}

	while (col < 16) {
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

void lcd_show_idle_mode(uint8_t mode)
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
	for (uint8_t seconds = 5; seconds > 0; seconds--) {
		lcd_clear();
		lcd_print("Drop object");
		lcd_set_cursor(1, 0);
		lcd_print("Close in ");
		lcd_print_uint8(seconds);
		lcd_print(" sec");

		_delay_ms(1000);
	}
}

// UART Functions

ISR(USART_RXC_vect)
{
	char received = UDR;
	uint8_t nextHead = uartRxHead + 1;

	if (nextHead >= UART_RX_BUFFER_SIZE) {
		nextHead = 0;
	}

	if (nextHead != uartRxTail) {
		uartRxBuffer[uartRxHead] = received;
		uartRxHead = nextHead;
	}
}

void uart_init(void)
{
	UBRRH = 0;
	UBRRL = 51;

	uartRxHead = 0;
	uartRxTail = 0;

	UCSRB = (1 << RXEN) | (1 << TXEN) | (1 << RXCIE);
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
	return uartRxHead != uartRxTail;
}

char uart_receive_char(void)
{
	char received;
	uint8_t sreg;

	while (!uart_char_available());

	sreg = SREG;
	cli();
	received = uartRxBuffer[uartRxTail];
	uartRxTail++;

	if (uartRxTail >= UART_RX_BUFFER_SIZE) {
		uartRxTail = 0;
	}
	SREG = sreg;

	return received;
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
	uint8_t sreg = SREG;

	cli();
	uartRxHead = 0;
	uartRxTail = 0;
	SREG = sreg;

	while (UCSRA & (1 << RXC)) {
		(void)UDR;
	}
}



// ADC Functions

void adc_init(void)
{
	ADMUX = (1 << REFS0);
	ADCSRA = (1 << ADEN) | (1 << ADPS2) | (1 << ADPS1) | (1 << ADPS0);
}

uint16_t adc_read(uint8_t channel)
{
	ADMUX = (ADMUX & 0xE0) | (channel & 0x07);

	ADCSRA |= (1 << ADSC);

	while (ADCSRA & (1 << ADSC));

	return ADC;
}

uint8_t read_mode_from_pot(void)
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



// Ultrasonic Sensor

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

	if (distance > 0 && distance <= 15) {
		return 1;
	}

	return 0;
}



// LED and Buzzer helper functions

void all_category_leds_off(void)
{
	PORTC &= ~((1 << LED_METAL) | (1 << LED_ORGANIC) | (1 << LED_PAPER) | (1 << LED_PLASTIC) | (1 << LED_BATTERIES) | (1 << LED_OTHER));
}

void show_category_led(uint8_t category)
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
		PORTC |= (1 << LED_OTHER);
		break;

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

// Text helper functions for LCD

const char* mode_name(uint8_t mode)
{
	const char *name;

	switch (mode) {
		case MODE_STATS:
		name = "Stats";
		break;

		case MODE_FILTERING:
		name = "Filtering";
		break;

		case MODE_GAME:
		name = "Game";
		break;

		default:
		name = "Unknown";
		break;
	}

	return name;
}

const char* category_name(uint8_t category)
{
	const char *name;

	switch (category) {
		case CAT_METAL:
		name = "Metal";
		break;

		case CAT_ORGANIC:
		name = "Organic";
		break;

		case CAT_PAPER:
		name = "Paper/Card";
		break;

		case CAT_PLASTIC:
		name = "Plastic";
		break;

		case CAT_BATTERIES:
		name = "Batteries";
		break;

		case CAT_OTHER:
		name = "Other";
		break;

		default:
		name = "Other";
		break;
	}

	return name;
}


// Stats mode button helper functions

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

		_delay_ms(25);
		elapsed += 25;
	}

	while ((PINA & (1 << pin)) == 0) {
		_delay_ms(25);
	}

	return 1;
}

uint8_t game_reset_button_pressed(void)
{
	return button_held_for_ms(GAME_HIGH_SCORE_RESET_BUTTON, 2000);
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

void stats_increment_category(uint8_t category)
{
	uint8_t slot = category;

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
	_delay_ms(2000);

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

// Game Mode

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
	uint8_t mask;

	switch (ledIndex) {
		case 0:
		mask = (1 << LED_METAL);
		break;

		case 1:
		mask = (1 << LED_ORGANIC);
		break;

		case 2:
		mask = (1 << LED_PAPER);
		break;

		case 3:
		mask = (1 << LED_PLASTIC);
		break;

		case 4:
		mask = (1 << LED_BATTERIES);
		break;

		default:
		mask = (1 << LED_BATTERIES);
		break;
	}

	return mask;
}

uint8_t game_index_to_category(uint8_t ledIndex)
{
	uint8_t category;

	switch (ledIndex) {
		case 0:
		category = CAT_METAL;
		break;

		case 1:
		category = CAT_ORGANIC;
		break;

		case 2:
		category = CAT_PAPER;
		break;

		case 3:
		category = CAT_PLASTIC;
		break;

		case 4:
		category = CAT_BATTERIES;
		break;

		default:
		category = CAT_BATTERIES;
		break;
	}

	return category;
}

const char* game_led_name(uint8_t ledIndex)
{
	const char *name;

	switch (ledIndex) {
		case 0:
		name = "Metal";
		break;

		case 1:
		name = "Organic";
		break;

		case 2:
		name = "Paper/Card";
		break;

		case 3:
		name = "Plastic";
		break;

		case 4:
		name = "Batteries";
		break;

		default:
		name = "Batteries";
		break;
	}

	return name;
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

uint8_t game_wait_for_object_and_classify(uint8_t *detectedCategory)
{
	uint8_t result;

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
	_delay_ms(2000);

	game_wrong_beep_and_score(score);

	lcd_clear();
	lcd_print("High score:");
	lcd_print_uint8(highScore);
	lcd_set_cursor(1, 0);
	lcd_print("Unlocked");
	_delay_ms(2000);

	all_category_leds_off();
}

void game_sort_object(uint8_t detectedCategory)
{
	process_sorted_object(detectedCategory);
}



// Stepper functions

uint16_t category_to_step_position(uint8_t category)
{
	uint16_t positionSteps;

	switch (category) {
		case CAT_METAL:
		positionSteps = STEPPER_METAL_POSITION_STEPS;
		break;

		case CAT_ORGANIC:
		positionSteps = STEPPER_ORGANIC_POSITION_STEPS;
		break;

		case CAT_PAPER:
		positionSteps = STEPPER_PAPER_POSITION_STEPS;
		break;

		case CAT_PLASTIC:
		positionSteps = STEPPER_PLASTIC_POSITION_STEPS;
		break;

		case CAT_BATTERIES:
		positionSteps = STEPPER_BATTERIES_POSITION_STEPS;
		break;

		case CAT_OTHER:
		positionSteps = STEPPER_OTHER_POSITION_STEPS;
		break;

		default:
		positionSteps = STEPPER_OTHER_POSITION_STEPS;
		break;
	}

	return positionSteps;
}

void rotate_disk_to_category(uint8_t category)
{
	uint16_t targetPositionSteps = category_to_step_position(category);
	uint8_t homed;

	lcd_clear();
	lcd_print("Homing disk");
	lcd_set_cursor(1, 0);
	lcd_print("Pass 1");

	PORTB &= ~(1 << DRV_ENABLE);
	PORTB &= ~(1 << DRV_DIR);
	homed = 0;

	for (uint16_t step = 0; step < 357; step++) {
		uint8_t triggered = 1;

		for (uint8_t read = 0; read < 5; read++) {
			if ((PINB & (1 << KW11_HOME)) != 0) {
				triggered = 0;
				break;
			}

			_delay_ms(2);
		}

		if (triggered) {
			currentDiskPositionSteps = 0;
			diskIsHomed = 1;
			homed = 1;
			break;
		}

		PORTB |= (1 << DRV_STEP);
		_delay_us(7000);
		PORTB &= ~(1 << DRV_STEP);
		_delay_us(7000);
	}

	if (!homed) {
		currentDiskPositionSteps = 0;
		diskIsHomed = 1;

		lcd_clear();
		lcd_print("KW11 timeout");
		lcd_set_cursor(1, 0);
		lcd_print("Assume home");
		_delay_ms(1200);
	}

	_delay_ms(500);

	lcd_clear();
	lcd_print("Homing disk");
	lcd_set_cursor(1, 0);
	lcd_print("Pass 2");

	PORTB &= ~(1 << DRV_ENABLE);
	PORTB &= ~(1 << DRV_DIR);
	homed = 0;

	for (uint16_t step = 0; step < 142; step++) {
		uint8_t triggered = 1;

		for (uint8_t read = 0; read < 5; read++) {
			if ((PINB & (1 << KW11_HOME)) != 0) {
				triggered = 0;
				break;
			}

			_delay_ms(2);
		}

		if (triggered) {
			currentDiskPositionSteps = 0;
			diskIsHomed = 1;
			homed = 1;
			break;
		}

		PORTB |= (1 << DRV_STEP);
		_delay_us(7000);
		PORTB &= ~(1 << DRV_STEP);
		_delay_us(7000);
	}

	if (!homed) {
		currentDiskPositionSteps = 0;
		diskIsHomed = 1;

		lcd_clear();
		lcd_print("KW11 timeout");
		lcd_set_cursor(1, 0);
		lcd_print("Assume home 2");
		_delay_ms(1200);
	}

	_delay_ms(1000);

	lcd_clear();
	lcd_print("Rotating disk");
	lcd_set_cursor(1, 0);
	lcd_print(category_name(category));

	PORTB |= (1 << DRV_DIR);
	PORTB &= ~(1 << DRV_ENABLE);

	for (uint16_t step = 0; step < targetPositionSteps; step++) {
		PORTB |= (1 << DRV_STEP);
		_delay_us(4000);
		PORTB &= ~(1 << DRV_STEP);
		_delay_us(4000);
	}

	currentDiskPositionSteps = targetPositionSteps;
	diskIsHomed = (currentDiskPositionSteps == 0);

	lcd_clear();
	lcd_print("Disk aligned");
	lcd_set_cursor(1, 0);
	lcd_print(category_name(category));
	_delay_ms(2000);
}



void return_disk_to_home(void)
{
	uint8_t homed;

	if (diskIsHomed && currentDiskPositionSteps == 0) {
		lcd_clear();
		lcd_print("Disk already");
		lcd_set_cursor(1, 0);
		lcd_print("at home");
		_delay_ms(1200);
		return;
	}

	lcd_clear();
	lcd_print("Returning disk");
	lcd_set_cursor(1, 0);
	lcd_print("to KW11");

	PORTB &= ~(1 << DRV_ENABLE);
	PORTB &= ~(1 << DRV_DIR);
	homed = 0;

	for (uint16_t step = 0; step < 357; step++) {
		uint8_t triggered = 1;

		for (uint8_t read = 0; read < 5; read++) {
			if ((PINB & (1 << KW11_HOME)) != 0) {
				triggered = 0;
				break;
			}

			_delay_ms(2);
		}

		if (triggered) {
			currentDiskPositionSteps = 0;
			diskIsHomed = 1;
			homed = 1;
			break;
		}

		PORTB |= (1 << DRV_STEP);
		_delay_us(7000);
		PORTB &= ~(1 << DRV_STEP);
		_delay_us(7000);
	}

	if (!homed) {
		currentDiskPositionSteps = 0;
		diskIsHomed = 1;

		lcd_clear();
		lcd_print("KW11 timeout");
		lcd_set_cursor(1, 0);
		lcd_print("Assume home");
		_delay_ms(1200);
	}

	lcd_clear();
	lcd_print("Disk home");
	_delay_ms(1200);
}

// Raspberry Pi clasification

uint8_t parse_raspberry_category(const char *line, uint8_t *category)
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

uint8_t request_classification_from_raspberry(uint8_t *category)
{
	char response[18];

	lcd_clear();
	lcd_print("Request photo");
	lcd_set_cursor(1, 0);
	lcd_print("Raspberry Pi");

	uart_flush_rx();
	uart_send_string("CAPTURE\n");

	if (!uart_read_line_timeout(response, sizeof(response), 200)) {
		return CLASSIFICATION_TIMEOUT;
	}

	return parse_raspberry_category(response, category);
}

uint8_t run_vision_capture(uint8_t *category)
{
	uint8_t result;

	lcd_lid_open_countdown();
	lid_close();

	photo_booth_capture_position();

	_delay_ms(250);

	result = request_classification_from_raspberry(category);

	if (result == CLASSIFICATION_NO_OBJECT) {
		lcd_clear();
		lcd_print("No object");
		lcd_set_cursor(1, 0);
		lcd_print("Clearing booth");
		_delay_ms(2000);

		photo_booth_drop_position();
		} else if (result == CLASSIFICATION_TIMEOUT) {
		lcd_clear();
		lcd_print("Raspberry");
		lcd_set_cursor(1, 0);
		lcd_print("No response");
		_delay_ms(2000);

		photo_booth_hold_position();
	}

	return result;
}

// Sorting

void process_sorted_object(uint8_t category)
{
	lcd_clear();
	lcd_print("Preparing drop");
	lcd_set_cursor(1, 0);
	lcd_print(category_name(category));
	_delay_ms(1200);

	rotate_disk_to_category(category);

	photo_booth_drop_position();

	stats_increment_category(category);
}



// Filtering Mode

void filtering_mode(void)
{
	uint8_t result;
	uint8_t category;

	lcd_clear();
	lcd_print("Mode locked:");
	lcd_set_cursor(1, 0);
	lcd_print("Filtering");
	_delay_ms(1200);

	lid_open();

	result = run_vision_capture(&category);

	if (result != CLASSIFICATION_OK) {
		lcd_clear();
		lcd_print("No sorting");
		lcd_set_cursor(1, 0);
		lcd_print("Unlocked");
		_delay_ms(2000);
		return;
	}

	show_category_led(category);

	lcd_clear();
	lcd_print("Classified:");
	lcd_set_cursor(1, 0);
	lcd_print(category_name(category));
	_delay_ms(2000);

	process_sorted_object(category);

	lcd_clear();
	lcd_print("Cycle complete");
	lcd_set_cursor(1, 0);
	lcd_print("Unlocked");
	_delay_ms(2000);

	all_category_leds_off();
}


// Game mode

void game_mode(void)
{
	uint8_t sequenceOption;
	uint8_t expectedIndex;
	uint8_t expectedCategory;
	uint8_t detectedCategory;
	uint8_t score = 0;

	lcd_clear();
	lcd_print("Mode locked:");
	lcd_set_cursor(1, 0);
	lcd_print("Game");
	_delay_ms(1200);

	lcd_clear();
	lcd_print("High score:");
	lcd_print_uint8(highScore);
	lcd_set_cursor(1, 0);
	lcd_print("Hold PA1 2 sec");
	delay_with_game_reset_poll(3000);

	game_random_seed();
	sequenceOption = game_random_choice(GAME_SEQUENCE_COUNT);

	lcd_clear();
	lcd_print("Challenge");
	lcd_set_cursor(1, 0);
	lcd_print("Seq ");
	lcd_print_uint8(sequenceOption + 1);
	_delay_ms(1200);

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

		if (!game_wait_for_object_and_classify(&detectedCategory)) {
			game_end_and_save(score);
			return;
		}

		show_category_led(detectedCategory);

		lcd_clear();
		lcd_print("Detected:");
		lcd_set_cursor(1, 0);
		lcd_print(category_name(detectedCategory));
		_delay_ms(1200);

		if (detectedCategory == expectedCategory) {
			score++;
			game_update_high_score(score);

			lcd_clear();
			lcd_print("Correct!");
			lcd_set_cursor(1, 0);
			lcd_print("Score:");
			lcd_print_uint8(score);

			game_correct_beep();
			_delay_ms(1200);

			game_sort_object(detectedCategory);

			all_category_leds_off();

			lcd_clear();
			lcd_print("Next object");
			lcd_set_cursor(1, 0);
			lcd_print("Get ready");
			_delay_ms(1200);
			} else {
			lcd_clear();
			lcd_print("Wrong object");
			lcd_set_cursor(1, 0);
			lcd_print("Expected:");
			lcd_print(game_led_name(expectedIndex));
			_delay_ms(2000);

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
	_delay_ms(2000);

	buzzer_beep(score);

	lcd_clear();
	lcd_print("High score:");
	lcd_print_uint8(highScore);
	lcd_set_cursor(1, 0);
	lcd_print("Unlocked");
	_delay_ms(2000);

	all_category_leds_off();
}



// Stats Mode

void stats_mode(void)
{
	uint8_t category;
	const uint8_t statsDisplay[6] = {CAT_OTHER, CAT_PLASTIC, CAT_PAPER, CAT_METAL, CAT_ORGANIC, CAT_BATTERIES};

	lcd_clear();
	lcd_print("Mode locked:");
	lcd_set_cursor(1, 0);
	lcd_print("Stats");
	_delay_ms(1200);

	lcd_show_two_lines("Bins emptied?", "Hold stats reset 2sec");
	for (uint16_t ms = 3000; ms > 0; ) {
		if (button_held_for_ms(STATS_COUNT_RESET_BUTTON, 2000)) {
			for (uint8_t bin = 0; bin < 6; bin++) {
				binCounts[bin] = 0;
				eeprom_update_word(&eepromBinCounts[bin], 0);
			}

			all_category_leds_off();
			lcd_show_two_lines("Stats reset", "All counts 0");
			_delay_ms(2000);
			break;
		}

		_delay_ms(100);

		if (ms >= 100) {
			ms -= 100;
			} else {
			ms = 0;
		}
	}

	for (uint8_t cycles = 0; cycles < 2; cycles++) {
		for (uint8_t i = 0; i < 6; i++) {
			if (button_held_for_ms(STATS_COUNT_RESET_BUTTON, 2000)) {
				for (uint8_t bin = 0; bin < 6; bin++) {
					binCounts[bin] = 0;
					eeprom_update_word(&eepromBinCounts[bin], 0);
				}

				all_category_leds_off();
				lcd_show_two_lines("Stats reset", "All counts 0");
				_delay_ms(2000);
			}

			category = statsDisplay[i];
			show_category_led(category);

			lcd_clear();
			lcd_print(category_name(category));
			lcd_set_cursor(1, 0);
			lcd_print("Count:");
			lcd_print_uint16(binCounts[category]);

			for (uint16_t ms = 2000; ms > 0; ) {
				if (button_held_for_ms(STATS_COUNT_RESET_BUTTON, 2000)) {
					for (uint8_t bin = 0; bin < 6; bin++) {
						binCounts[bin] = 0;
						eeprom_update_word(&eepromBinCounts[bin], 0);
					}

					all_category_leds_off();
					lcd_show_two_lines("Stats reset", "All counts 0");
					_delay_ms(2000);
					break;
				}

				_delay_ms(100);

				if (ms >= 100) {
					ms -= 100;
					} else {
					ms = 0;
				}
			}
		}
	}

	all_category_leds_off();

	lcd_clear();
	lcd_print("Stats done");
	lcd_set_cursor(1, 0);
	lcd_print("Unlocked");
	_delay_ms(2000);
}



// Hardware init
void hardware_init(void)
{
	DDRA = 0x00;
	PORTA = (1 << GAME_HIGH_SCORE_RESET_BUTTON) | (1 << STATS_COUNT_RESET_BUTTON);

	DDRB |= (1 << DRV_STEP) | (1 << DRV_DIR) | (1 << DRV_ENABLE) | (1 << LCD_D5) | (1 << LCD_D6) | (1 << LCD_D7);

	PORTB |= (1 << KW11_HOME);

	PORTB |= (1 << DRV_ENABLE);

	DDRC |= (1 << LED_METAL) | (1 << LED_ORGANIC) | (1 << LED_PAPER) | (1 << LED_PLASTIC) | (1 << LED_BATTERIES) | (1 << LED_OTHER);

	all_category_leds_off();

	DDRD |= (1 << HCSR04_TRIG) | (1 << BUZZER) | (1 << LCD_RS) | (1 << LCD_E) | (1 << LCD_D4);

	PORTD &= ~(1 << BUZZER);

	adc_init();
	uart_init();
	lcd_boot_init();

	pca9685_init(0x00, 50);
	_delay_ms(10);

	pca9685_servo(LID_SERVO_CHANNEL, LID_CLOSED_ANGLE);
	photo_booth_hold_position();

	lcd_show_two_lines("Startup clear", "Photo booth");
	_delay_ms(500);

	photo_booth_drop_position();

	lcd_boot_init();

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
	lcd_print_padded("High score:");
	lcd_set_cursor(1, 11);
	lcd_print_uint8(highScore);
	_delay_ms(2000);
}






int main(void)
{
	uint8_t currentMode;
	uint8_t lockedMode;
	uint8_t displayedMode = 255;
	uint8_t forceIdleRedraw = 1;

	hardware_init();
	sei();

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
				_delay_ms(1200);

				if (lockedMode == MODE_FILTERING) {
					filtering_mode();
					} else if (lockedMode == MODE_GAME) {
					game_mode();
					} else if (lockedMode == MODE_STATS) {
					stats_mode();
				}

				forceIdleRedraw = 1;
				displayedMode = 255;
			}

			_delay_ms(100);
		}
	}

	return 0;
}


/*
Referencias:
prestonsn. (n.d.). PCA9685-Multi-Channel-Servo-Controller-Driver-for-AVR-ATmega [Código fuente]. GitHub. https://github.com/prestonsn/PCA9685-Multi-Channel-Servo-Controller-Driver-for-AVR-ATmega/tree/master

prestonsn. (n.d.). AtmegaXX-I2C-Library [Código fuente]. GitHub. https://github.com/prestonsn/AtmegaXX-I2C-Library/tree/master

OpenAI. (2026). ChatGPT [Modelo grande de lenguaje]. https://chat.openai.com/ (Apoyo en el proceso de debugging, revisión y corrección de posibles errores lógicos o sintácticos)

ElectronicWings. (n.d.). I2C in AVR ATmega16/ATmega32. https://www.electronicwings.com/avr-atmega/atmega1632-i2c

Damián, J. (2026, 19 de marzo). Cómo controlar un motor de pasos con el conductor DRV8825 y Arduino. Electrogeek. https://www.electrogeekshop.com/como-controlar-un-motor-de-pasos-con-el-conductor-drv8825-y-arduino/

ElectronicWings. (n.d.). LCD16x2 interfacing with AVR ATmega16/ATmega32. https://www.electronicwings.com/avr-atmega/lcd16x2-interfacing-with-atmega16-32


*/
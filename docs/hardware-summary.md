# Hardware Summary

This document summarizes the main hardware architecture used in the final R3Bin prototype.

## Main Controllers

- **ATmega16:** real-time control, mode logic, actuators, LCD/LED UI, EEPROM, sensors.
- **Raspberry Pi 5:** local computer vision inference with TensorFlow Lite.

## Main Actuators

- **MG996R servos:** inlet lid and photo booth/drop mechanism.
- **PCA9685:** 16-channel PWM driver controlled from ATmega16 through I2C/TWI.
- **NEMA 17 stepper motor:** sorting disk positioning.
- **DRV8825:** stepper driver.

## Main Sensors and Inputs

- **HC-SR04 ultrasonic sensor:** detects user/hand presence.
- **KW11 limit switch:** home reference for rotating disk.
- **Potentiometer:** operating-mode selector.
- **Push buttons:** game high-score reset and stats-count reset.
- **Logitech C270 webcam:** image input for Raspberry Pi classification.

## User Interface

- 16x2 parallel LCD.
- Six category LEDs.
- Active buzzer.
- Potentiometer selector.
- Reset and mode-specific buttons.

## UART Protocol

```text
ATmega16 -> Raspberry Pi: CAPTURE
Raspberry Pi -> ATmega16: METAL | ORGANIC | PAPER | PLASTIC | BATTERIES | OTHER | NO_OBJECT
```

## Voltage Divider

The ATmega16 TX line is 5 V logic and the Raspberry Pi RX line is 3.3 V logic. The final test divider used:

- R1: 1.9 kOhm from ATmega16 TX to midpoint.
- R2: 3.3 kOhm from midpoint to GND.
- Midpoint: Raspberry Pi RX.
- Raspberry Pi TX to ATmega16 RX is direct.
- Common GND is required.

## ADC Reference

The potentiometer is read on PA0 / ADC0. The firmware uses AVCC as the ADC reference and a small capacitor on AREF to ground for reference-noise filtering.


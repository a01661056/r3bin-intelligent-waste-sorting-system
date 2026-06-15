# Firmware

This folder contains the ATmega16 firmware and focused hardware test programs.

## Main File

- `atmega16.c`: final integrated firmware for R3Bin.

## Support / Test Files

- `nema_sector_calibration.c`: NEMA 17 + KW11 homing and sector calibration.
- `servo_channels_0_4_8_test.c`: servo channel validation.
- `uart_tx_capture_test.c`: UART transmission test.
- `i2c_pca9685_test.c`: I2C/PCA9685 validation.
- `lcd_hi_test.c`: LCD wiring and initialization test.
- `kw11_pc2_led_test.c`: KW11 input test.

## Build

```bash
make compile FILE=atmega16.c
```

## Program

```bash
make program FILE=atmega16.c
```

Default target settings:

- MCU: ATmega16
- Clock: 8 MHz
- Programmer: USBasp

## Notes

The firmware uses direct AVR register access and polling-based control. The project intentionally keeps the ATmega16 responsible for real-time actuator sequencing while the Raspberry Pi handles image classification.


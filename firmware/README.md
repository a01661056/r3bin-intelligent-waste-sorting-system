# Firmware

This folder contains the final ATmega16 firmware used by the physical R3Bin
prototype.

## Main File

- `atmega16.c`: final integrated firmware for R3Bin.

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

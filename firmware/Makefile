MCU ?= atmega16
PART ?= m16
F_CPU ?= 8000000UL
PROGRAMMER ?= usbasp
PORT ?=
BAUD ?=
BUILD_DIR ?= build

# Use SRC=archivo.c or FILE=archivo.c.
SRC ?=
SRC := $(strip $(if $(FILE),$(FILE),$(SRC)))
TARGET := $(basename $(notdir $(SRC)))
ELF := $(BUILD_DIR)/$(TARGET).elf
HEX := $(BUILD_DIR)/$(TARGET).hex

CFLAGS ?= -mmcu=$(MCU) -DF_CPU=$(F_CPU) -Os -Wall -Wextra
LDFLAGS ?= -mmcu=$(MCU)
AVRDUDE_FLAGS := -p $(PART) -c $(PROGRAMMER)

ifneq ($(strip $(PORT)),)
AVRDUDE_FLAGS += -P $(PORT)
endif

ifneq ($(strip $(BAUD)),)
AVRDUDE_FLAGS += -b $(BAUD)
endif

.DEFAULT_GOAL := help
.PHONY: help hex compile flash program clean check-src

help:
	@echo "Shortcuts for ATmega16:"
	@echo "  make hex SRC=archivo.c"
	@echo "  make flash SRC=archivo.c"
	@echo ""
	@echo "Aliases:"
	@echo "  make compile FILE=archivo.c"
	@echo "  make program FILE=archivo.c"
	@echo ""
	@echo "Defaults: MCU=$(MCU), PART=$(PART), F_CPU=$(F_CPU), PROGRAMMER=$(PROGRAMMER)"
	@echo "Override example:"
	@echo "  make flash SRC=archivo.c PROGRAMMER=usbasp"
	@echo "  make flash SRC=archivo.c PROGRAMMER=arduino PORT=/dev/cu.usbmodem1101 BAUD=19200"

check-src:
	@if [ -z "$(SRC)" ]; then \
		echo "Choose a C file, for example:"; \
		echo "  make hex SRC=ejercicio_quiz.c"; \
		echo "  make flash SRC=ejercicio_quiz.c"; \
		exit 2; \
	fi
	@if [ ! -f "$(SRC)" ]; then \
		echo "File not found: $(SRC)"; \
		exit 2; \
	fi

hex compile: check-src
	@mkdir -p "$(BUILD_DIR)"
	avr-gcc $(CFLAGS) -o "$(ELF)" "$(SRC)" $(LDFLAGS)
	avr-objcopy -O ihex -R .eeprom "$(ELF)" "$(HEX)"
	@echo "Built $(HEX)"

flash program: hex
	avrdude $(AVRDUDE_FLAGS) -U flash:w:"$(HEX)":i

clean:
	rm -rf "$(BUILD_DIR)"

---
title: AVR-MT128 development with macOS
date: 2016-03-09
tags: embedded
---

I borrowed Olimex board from school for hacking and learning purposes. It wasn't too hard to get it working with my MacBook Pro.

Used board: [Olimex AVR-MT128](https://www.olimex.com/Products/AVR/Development/AVR-MT128/) and programmer: [Olimex AVR-JTAG-USB](https://www.olimex.com/Products/AVR/Programmers/AVR-JTAG-USB-A/)

First, install software with [Homebrew](http://brew.sh).

```bash
brew tap osx-cross/avr
brew install avr-libc

brew install avrdude --with-usb
```

Then create `main.c`

```c
#include <avr/io.h>
#include <avr/interrupt.h>

unsigned char second = 1;
unsigned int timerCompare; // uint16_t
volatile unsigned char interruptFlag = 0; // uint8_t

ISR (TIMER1_COMPA_vect) {
  // 20000 with clk/8 @16MHz gets us 10 ms between interrupts
  timerCompare = timerCompare + 20000;
  OCR1A = timerCompare;
  interruptFlag = 1;
}

int main(void) {

  DDRA = 0b01000000; // PA6 output

  timerCompare = 20000; // set initial value for compare register
  OCR1A = timerCompare;

  // init interrupts
  TCCR1B = 0b00000010; // clk/8
  TIMSK  = 0b00010000; // set bit OC1E1A, enable timer1compA interrupts

  sei(); // set enable interrupts

  while(1) {
    if (interruptFlag == 1) {
      interruptFlag = 0; // reset flag
      second--;
      if (second == 0) {
        second = 100;
        PORTA = PORTA ^ 0x40;
      }
    }
  }
}
```

Get the USB device name

```bash
ls /dev/tty.usb*
# => /dev/tty.usbserial-A40092ED
```

Create `Makefile` and use your usb device there (PORT)

```makefile
PORT=/dev/tty.usbserial-A40092ED
MCU=atmega128
CFLAGS=-g -Wall -mcall-prologues -mmcu=$(MCU) -Os
LDFLAGS=-Wl,-gc-sections -Wl,-relax
CC=avr-gcc
TARGET=main
OBJECT_FILES=main.o

all: $(TARGET).hex

clean:
  rm -f *.o *.hex *.obj *.hex

%.hex: %.obj
  avr-objcopy -R .eeprom -O ihex $< $@

%.obj: $(OBJECT_FILES)
  $(CC) $(CFLAGS) $(OBJECT_FILES) $(LDFLAGS) -o $@

program: $(TARGET).hex
  avrdude -p $(MCU) -c jtag1 -P $(PORT) -U flash:w:$(TARGET).hex
```

Compile

```bash
make
```

And flash it on the board

```bash
make program
```

Your LED should be blinking and relay toggling.
Hack away!

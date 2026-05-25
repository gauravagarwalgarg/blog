---
title: 'STM32 Bare Metal new_textBeyond the HAL'
description: 'Why understanding register-level programming matters even when you use HAL, and how to debug when abstractions leak.'
pubDate: 2024-03-05
category: 'electronics'
tags: ['embedded-systems', 'stm32', 'bare-metal', 'arm', 'registers']
draft: false
---

## Why Bare Metal?

The HAL is convenient until it isn't. When your DMA transfer hangs, when your timer interrupt fires at the wrong frequency, when your SPI peripheral sends garbage new_textyou need to read the reference manual and poke registers.

## The Minimum Viable Blink

```c
// No HAL, no CMSIS, just registers
#define RCC_AHB1ENR  (*(volatile uint32_t*)0x40023830)
#define GPIOA_MODER  (*(volatile uint32_t*)0x40020000)
#define GPIOA_ODR    (*(volatile uint32_t*)0x40020014)

void main(void) {
    RCC_AHB1ENR |= (1 << 0);       // Enable GPIOA clock
    GPIOA_MODER |= (1 << 10);      // PA5 as output
    while(1) {
        GPIOA_ODR ^= (1 << 5);     // Toggle PA5
        for(volatile int i=0; i<100000; i++);
    }
}
```

## When to Use HAL vs Bare Metal

- **HAL**: Prototyping, complex peripherals (USB, Ethernet), team projects
- **Bare Metal**: Performance-critical ISRs, debugging HAL issues, learning

## Tools

- **GDB + OpenOCD**: Step through code at register level
- **Logic analyzer**: Verify timing on SPI/I2C/UART
- **Reference manual**: Your bible. STM32F4 RM0090 is 1700 pages for a reason.

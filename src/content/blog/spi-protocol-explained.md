---
title: 'SPI Protocol: A Complete Guide for Embedded Engineers'
description: 'Master the SPI bus ock polarity, phase modes, DMA transfers, and common pitfalls when interfacing with sensors and peripherals.'
pubDate: 2024-05-20
category: 'embedded-systems'
tags: ['spi', 'embedded', 'protocols', 'stm32', 'hardware']
draft: false
readingTime: '7 min read'
---

## What is SPI?

Serial Peripheral Interface (SPI) is a synchronous, full-duplex communication protocol used to connect microcontrollers to sensors, displays, flash memory, and other peripherals. It's faster than I2C but uses more pins.

## The Four Wires

- **SCLK** rial Clock (master generates)
- **MOSI** ster Out, Slave In
- **MISO** ster In, Slave Out
- **CS/SS** ip Select (active low, one per slave)

## Clock Polarity and Phase (CPOL/CPHA)

This trips up everyone at least once:

| Mode | CPOL | CPHA | Clock Idle | Data Sampled |
|------|------|------|-----------|-------------|
| 0    | 0    | 0    | Low       | Rising edge  |
| 1    | 0    | 1    | Low       | Falling edge |
| 2    | 1    | 0    | High      | Falling edge |
| 3    | 1    | 1    | High      | Rising edge  |

**The golden rule:** Check the slave device's datasheet for which mode it expects. Get this wrong and you'll read garbage.

## Basic STM32 SPI Transaction

```c
uint8_t spi_transfer(SPI_HandleTypeDef *hspi, uint8_t data) {
    uint8_t rx;
    HAL_SPI_TransmitReceive(hspi, &data, &rx, 1, HAL_MAX_DELAY);
    return rx;
}

// Read accelerometer register
void read_accel(SPI_HandleTypeDef *hspi, uint8_t reg, uint8_t *buf, uint8_t len) {
    HAL_GPIO_WritePin(CS_PORT, CS_PIN, GPIO_PIN_RESET);  // CS low
    spi_transfer(hspi, reg | 0x80);  // Read bit set
    for (uint8_t i = 0; i < len; i++) {
        buf[i] = spi_transfer(hspi, 0x00);  // Dummy byte to clock data in
    }
    HAL_GPIO_WritePin(CS_PORT, CS_PIN, GPIO_PIN_SET);    // CS high
}
```

## DMA Transfers

For high-throughput applications (displays, SD cards), use DMA to offload the CPU:

```c
// Non-blocking DMA transfer
HAL_SPI_Transmit_DMA(&hspi1, framebuffer, FRAME_SIZE);

// Callback when complete
void HAL_SPI_TxCpltCallback(SPI_HandleTypeDef *hspi) {
    // Frame sent, prepare next
    frame_complete = 1;
}
```

## Common Pitfalls

1. **Wrong clock speed** st slaves have a maximum SCLK frequency. Exceeding it causes intermittent errors.
2. **CS timing** me devices need a delay between CS assertion and first clock edge.
3. **Shared bus conflicts** ways deassert CS before talking to a different slave.
4. **MISO floating** e pull-ups or configure as alternate function properly.
5. **Bit order** I is MSB-first by default, but some devices use LSB-first.

## SPI vs I2C: When to Use What

| Factor | SPI | I2C |
|--------|-----|-----|
| Speed | Up to 50+ MHz | Up to 3.4 MHz |
| Pins | 3 + 1 per slave | 2 (shared bus) |
| Complexity | Simple | Address-based |
| Full duplex | Yes | No |

Use SPI when you need speed (displays, flash, ADCs). Use I2C when you have many slow devices and limited pins (sensors, EEPROMs).

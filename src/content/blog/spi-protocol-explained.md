---
title: "SPI Protocol: Clock Modes, Multi-Slave Topologies, and Signal Integrity"
description: "Complete SPI protocol deep-dive covering CPOL/CPHA clock modes, full-duplex data flow, multi-slave topologies (independent vs daisy-chain), DMA integration patterns, signal integrity at high clock rates, and debugging with logic analyzers."
pubDate: 2026-02-10
category: 'embedded-systems'
tags: ['spi', 'protocols', 'embedded', 'hardware']
draft: false
readingTime: '14 min'
---

SPI is deceptively simple on the surface four wires, shift registers, a clock but the details are where designs fail. Clock polarity mismatches cause silent data corruption. Reflections at 20+ MHz look like valid edges. Multi-slave select timing has race conditions your scope won't show at slow timebase. This post covers the protocol at the level needed to ship reliable hardware.

## SPI Fundamentals

SPI (Serial Peripheral Interface) is a synchronous, full-duplex, master-slave protocol. Four signals:

| Signal | Direction | Purpose |
|--------|-----------|---------|
| SCLK | Master → Slave | Clock (master always generates) |
| MOSI | Master → Slave | Master Out, Slave In |
| MISO | Slave → Master | Master In, Slave Out |
| CS/SS | Master → Slave | Chip Select (active low) |

### Full-Duplex Mechanics

Every SPI transfer is a *simultaneous exchange*. The master's shift register and slave's shift register form a circular buffer:

```
Master SR: [D7 D6 D5 D4 D3 D2 D1 D0] ──MOSI──► [D7 D6 D5 D4 D3 D2 D1 D0] :Slave SR
           ◄──MISO──
```

On each clock edge, one bit shifts out from each side and one bit shifts in. After 8 clocks, the registers have swapped contents. This means:

- To *read* from a slave, you must *write* something (usually 0x00 or 0xFF as dummy bytes)
- To *write* to a slave, you receive data back (usually ignored)
- There is no "read-only" or "write-only" SPI transfer at the hardware level

## CPOL and CPHA The Four Clock Modes

The clock mode defines *when* data is sampled and *when* it transitions. Getting this wrong causes bit-shifted garbage data.

### Definitions

- **CPOL** (Clock Polarity): idle state of SCLK
  - CPOL=0: clock idles LOW
  - CPOL=1: clock idles HIGH
- **CPHA** (Clock Phase): which edge samples data
  - CPHA=0: data sampled on *first* (leading) edge
  - CPHA=1: data sampled on *second* (trailing) edge

### The Four Modes

| Mode | CPOL | CPHA | Idle State | Sample Edge | Shift Edge |
|------|------|------|------------|-------------|------------|
| 0 | 0 | 0 | Low | Rising | Falling |
| 1 | 0 | 1 | Low | Falling | Rising |
| 2 | 1 | 0 | High | Falling | Rising |
| 3 | 1 | 1 | High | Rising | Falling |

### Timing Diagrams (Mode 0 Most Common)

```
CS   ‾‾‾‾\___________________________________/‾‾‾‾
SCLK ______/‾\_/‾\_/‾\_/‾\_/‾\_/‾\_/‾\_/‾\______
MOSI ===X D7 X D6 X D5 X D4 X D3 X D2 X D1 X D0 X===
          ↑    ↑    ↑    ↑    ↑    ↑    ↑    ↑
          Sample points (rising edges)
```

### Common Device Modes

| Device | Typical Mode | Max Clock |
|--------|-------------|-----------|
| SD Card (SPI mode) | Mode 0 | 25 MHz |
| W25Q Flash | Mode 0 or 3 | 133 MHz (quad) |
| MAX31855 Thermocouple | Mode 0 | 5 MHz |
| ADS1256 ADC | Mode 1 | ~2 MHz |
| MCP3008 ADC | Mode 0 | 3.6 MHz |
| ADXL345 Accelerometer | Mode 3 | 5 MHz |

**Critical**: many devices support multiple modes. Read the datasheet timing diagram, don't guess from mode number alone.

## Multi-Slave Topologies

### Independent Chip Selects

Each slave has its own CS line. Most common and most flexible.

```
            ┌─────────┐
    CS0 ───►│ Slave 0 │◄── SCLK, MOSI, MISO (shared bus)
            └─────────┘
            ┌─────────┐
    CS1 ───►│ Slave 1 │◄── SCLK, MOSI, MISO (shared bus)
            └─────────┘
            ┌─────────┐
    CS2 ───►│ Slave 2 │◄── SCLK, MOSI, MISO (shared bus)
            └─────────┘
```

**MISO contention**: when a slave is not selected, its MISO pin must be high-impedance (tri-state). If a slave doesn't tri-state properly, it corrupts other slaves' responses. Solution: series resistors (100-470Ω) on MISO, or use a bus buffer IC.

### Daisy-Chain

Slaves are chained: MISO of one connects to MOSI of the next. All share one CS.

```
Master MOSI ──► [Slave 0] ──► [Slave 1] ──► [Slave 2]
Master MISO ◄── [Slave 2 MISO]
CS ──────────────┴─────────────┴─────────────┘
```

Use case: LED drivers (WS2812-like protocols via SPI), shift register chains, when GPIO pins are scarce.

**Trade-off**: you must clock data through all slaves to reach the last one. Latency increases with chain length.

### CS Timing Requirements

```
CS assertion to first clock edge: t_CSS (setup time)
Last clock edge to CS de-assertion: t_CSH (hold time)
Between transactions (CS high): t_CSI (inter-frame gap)
```

These are often 50-100ns minimum. At 50 MHz SPI clock (20ns period), you need explicit delays:

```c
void spi_select(GPIO_TypeDef *port, uint16_t pin) {
    HAL_GPIO_WritePin(port, pin, GPIO_PIN_RESET);
    __NOP(); __NOP(); __NOP(); __NOP();  // ~56ns at 72MHz core
}
```

## DMA Integration

DMA is essential for SPI transfers >8 bytes. Without DMA, the CPU burns cycles polling or handling interrupts for every byte.

### STM32 HAL DMA Example

```c
// Configure SPI + DMA (CubeMX does the DMA stream config)
uint8_t txBuf[256];
uint8_t rxBuf[256];

// Non-blocking transfer CPU is free during transfer
HAL_SPI_TransmitReceive_DMA(&hspi1, txBuf, rxBuf, 256);

// Callback when complete
void HAL_SPI_TxRxCpltCallback(SPI_HandleTypeDef *hspi) {
    // De-assert CS, process rxBuf
    HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_SET);
    process_received_data(rxBuf, 256);
}
```

### DMA Considerations

| Factor | Impact |
|--------|--------|
| Alignment | Some DMA controllers require word-aligned buffers |
| Cache coherency | On Cortex-M7+, invalidate D-cache before reading DMA buffer |
| Circular mode | Continuous ADC sampling without CPU intervention |
| Half-transfer interrupt | Double-buffering: process first half while second fills |

### Double-Buffering Pattern

```c
#define BUF_SIZE 512
uint8_t buf[2][BUF_SIZE];  // ping-pong buffers
volatile uint8_t active_buf = 0;

void HAL_SPI_RxHalfCpltCallback(SPI_HandleTypeDef *hspi) {
    // First half ready process buf[0]
    process_data(buf[active_buf], BUF_SIZE / 2);
}

void HAL_SPI_RxCpltCallback(SPI_HandleTypeDef *hspi) {
    // Second half ready swap buffers
    active_buf ^= 1;
    // Restart DMA on new buffer
    HAL_SPI_Receive_DMA(&hspi1, buf[active_buf], BUF_SIZE);
}
```

## Signal Integrity at High Speeds

Above 10 MHz, SPI traces are transmission lines. The speed of light gives ~15 cm/ns on FR4 PCB traces.

### When Transmission Line Effects Matter

```
Rule of thumb: if trace_length > λ/10, you need controlled impedance.

At 50 MHz: λ = c / (f × √εr) ≈ 3m / (50M × √4.5) ≈ 2.8 cm
λ/10 = 2.8 mm → most PCB traces are longer than this!
```

### Practical Mitigations

**Series termination resistors** at the source (master):

```
Master GPIO ──[33Ω]──── trace ────► Slave input
```

The resistor value = Z₀ - R_driver. For CMOS outputs (~20Ω) on 50Ω trace: 33Ω series resistor.

**Ground plane**: always route SPI signals over an unbroken ground plane. A gap in the ground plane is an antenna.

**Signal routing rules**:

| Rule | Reason |
|------|--------|
| Keep SCLK trace shorter than data | Clock arrives before data changes |
| Match trace lengths (±5mm) | Prevent setup/hold violations |
| Separate SCLK from MISO/MOSI | Reduce crosstalk |
| No vias on SCLK if possible | Via stubs cause reflections |
| 100nF + 10µF caps at slave VCC | Clean power supply at slave |

### Rise Time Budget

```
Available setup time = (1/2 × clock_period) - propagation_delay - rise_time/2

At 25 MHz:
  clock_period = 40ns
  half_period = 20ns
  propagation (10cm trace) ≈ 0.7ns
  rise_time (typical CMOS) ≈ 2-5ns
  
  Available setup = 20 - 0.7 - 2.5 = 16.8ns ✓ (plenty)

At 50 MHz:
  half_period = 10ns
  Available setup = 10 - 0.7 - 2.5 = 6.8ns ⚠️ (getting tight)
```

## Debugging with Logic Analyzers

### Essential Captures

1. **Clock mode verification**: zoom into first 2-3 clock edges after CS assertion. Verify idle state and sample edge.

2. **CS timing**: check t_CSS and t_CSH. Many "no response" bugs are CS de-asserting too early.

3. **MISO tri-state**: after CS de-asserts, MISO should float (high-Z). If it stays driven, you have bus contention.

### Saleae Logic Setup for SPI

```
Channel 0: CS (trigger: falling edge)
Channel 1: SCLK
Channel 2: MOSI  
Channel 3: MISO

Analyzer: SPI
  MOSI: Ch2, MISO: Ch3, CLK: Ch1, Enable: Ch0
  MSB first, 8 bits per transfer
  CPOL=0, CPHA=0 (adjust to match your device)
  Enable line: active low
```

### Common Debug Patterns

| Symptom | Likely Cause |
|---------|-------------|
| All 0xFF received | Slave not responding check CS, power, mode |
| Data shifted by 1 bit | Wrong CPHA setting |
| Data bit-inverted | Wrong CPOL setting |
| Intermittent corruption | Signal integrity slow clock or add termination |
| First byte correct, rest garbage | CS toggling between bytes (shouldn't in multi-byte) |
| Works at 1 MHz, fails at 10 MHz | Transmission line effects add series resistors |

### Protocol-Level Debugging

Most SPI devices use a command/address/data protocol layered on top:

```
Transaction: [CMD byte] [ADDR bytes] [dummy bytes] [DATA bytes]

Example W25Q Flash Read (0x03):
CS LOW
MOSI: 0x03  0x00  0x10  0x00  0xFF  0xFF  0xFF ...
MISO: 0xFF  0xFF  0xFF  0xFF  D0    D1    D2   ...
CS HIGH
      ^^^^  ^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^
      CMD   24-bit address      Data (continuous read)
```

The dummy bytes during command/address phase produce garbage on MISO that's normal. Real data starts after the device's specified dummy cycles.

## SPI vs Alternatives

| Feature | SPI | I2C | UART |
|---------|-----|-----|------|
| Wires | 4+ (more for multi-slave) | 2 | 2 |
| Speed | 1-100+ MHz | 100k-3.4M Hz | 115.2k-1M baud |
| Duplex | Full | Half | Full |
| Addressing | CS pin per device | 7/10-bit address | Point-to-point |
| Flow control | None (master controls clock) | Clock stretching | RTS/CTS optional |
| Typical use | Flash, ADC, display, sensors | EEPROM, sensors, I/O expanders | Debug console, GPS |

SPI wins when you need throughput and have GPIO pins available. I2C wins when you're pin-constrained and bandwidth isn't critical.

---
title: "STM32 Bare Metal: Beyond the HAL"
description: "Why understanding register-level programming matters even when you use HAL, how to debug when abstractions leak, and the mental model for working directly with ARM Cortex-M peripherals."
pubDate: 2024-03-05
category: 'embedded-systems'
tags: ['embedded-systems', 'stm32', 'bare-metal', 'arm', 'registers']
draft: false
---

The STM32 HAL is convenient until it isn't. When your DMA transfer hangs silently, when your timer interrupt fires at 1.003× the expected frequency, when your SPI peripheral sends garbage on the MOSI line the HAL gives you no answers. The reference manual does. The registers do. The bare metal does.

This isn't about abandoning HAL. It's about knowing what HAL does so you can debug it when it misbehaves.

## The Mental Model: Memory-Mapped Peripherals

Every peripheral on an STM32 is a set of **registers mapped to specific memory addresses**. Writing to address `0x40020014` doesn't write to RAM it controls the GPIOA output data register. The CPU doesn't distinguish between "memory" and "hardware" it's all just load/store to addresses.

```c
// This isn't magic. It's a pointer to a hardware address.
#define GPIOA_ODR  (*(volatile uint32_t*)0x40020014)

// Toggle PA5 = write bit 5 of that address
GPIOA_ODR ^= (1 << 5);
```

The `volatile` keyword is critical it tells the compiler "this value can change outside your control, don't optimize away reads/writes to it." Without `volatile`, the compiler may cache the register value in a CPU register and never actually talk to the hardware.

## The Minimum Viable Blink (Zero Dependencies)

No HAL. No CMSIS. No startup code. Just registers.

```c
// STM32F4 Nucleo Blink PA5 (user LED)

// Clock control
#define RCC_AHB1ENR  (*(volatile uint32_t*)0x40023830)

// GPIO Port A registers
#define GPIOA_MODER  (*(volatile uint32_t*)0x40020000)
#define GPIOA_ODR    (*(volatile uint32_t*)0x40020014)

void main(void) {
    // Step 1: Enable clock to GPIOA
    // Without this, writing to GPIOA registers does nothing.
    // Bit 0 of RCC_AHB1ENR = GPIOAEN
    RCC_AHB1ENR |= (1 << 0);

    // Step 2: Configure PA5 as general-purpose output
    // MODER register: 2 bits per pin. 00=input, 01=output, 10=alternate, 11=analog
    // PA5 = bits [11:10]. Set to 01.
    GPIOA_MODER &= ~(3 << 10);  // Clear bits 11:10
    GPIOA_MODER |=  (1 << 10);  // Set bit 10 (output mode)

    // Step 3: Toggle forever
    while(1) {
        GPIOA_ODR ^= (1 << 5);
        // Busy-wait delay (terrible, but no timer setup needed)
        for(volatile int i = 0; i < 100000; i++);
    }
}
```

**What the HAL hides**: That single `HAL_GPIO_TogglePin(GPIOA, GPIO_PIN_5)` call does the same thing but wrapped in 4 layers of abstraction, error checking, and lock management you didn't ask for.

## The Clock Tree: Why Your Peripheral Does Nothing

The most common bare-metal mistake: **forgetting to enable the peripheral clock**. Unlike a desktop CPU where everything is always powered, STM32 peripherals are clock-gated by default (for power savings).

```
System Clock (HSI 16MHz / HSE / PLL)
    ├── AHB Bus → AHB1ENR → GPIOA, GPIOB, DMA1, DMA2
    ├── APB1 Bus → APB1ENR → TIM2, TIM3, USART2, I2C1, SPI2
    └── APB2 Bus → APB2ENR → TIM1, USART1, SPI1, ADC1
```

**Rule**: Before touching any peripheral register, enable its clock in the corresponding `RCC_xxxENR` register. If you don't, writes silently do nothing and reads return zero.

## Interrupt Handling at Register Level

```c
// Configure EXTI0 (PA0 button) to trigger on falling edge

// 1. Enable GPIOA clock
RCC_AHB1ENR |= (1 << 0);

// 2. Configure PA0 as input (MODER bits [1:0] = 00)
GPIOA_MODER &= ~(3 << 0);

// 3. Enable SYSCFG clock (needed for EXTI mux)
RCC_APB2ENR |= (1 << 14);

// 4. Route EXTI0 to PA0 (SYSCFG_EXTICR1)
SYSCFG_EXTICR1 &= ~(0xF << 0);  // Clear EXTI0 source
// 0x0 = PA0 (default)

// 5. Configure EXTI0 for falling edge trigger
EXTI_FTSR |= (1 << 0);   // Falling trigger enable
EXTI_IMR  |= (1 << 0);   // Unmask interrupt

// 6. Enable EXTI0 in NVIC (IRQ number 6)
NVIC_ISER0 |= (1 << 6);

// 7. Implement the handler (weak symbol override)
void EXTI0_IRQHandler(void) {
    if (EXTI_PR & (1 << 0)) {
        EXTI_PR |= (1 << 0);  // Clear pending bit (write-1-to-clear)
        // Your interrupt logic here
        GPIOA_ODR ^= (1 << 5);  // Toggle LED
    }
}
```

**Key insight**: The NVIC (Nested Vectored Interrupt Controller) is an ARM core peripheral, not ST-specific. EXTI is ST's GPIO-to-interrupt routing layer. Understanding this split helps when porting between STM32 families.

## DMA: When the CPU Shouldn't Be Involved

Direct Memory Access transfers data between memory and peripherals without CPU intervention. The CPU sets up the transfer, starts it, and gets interrupted when it's done.

```c
// DMA2 Stream 0: ADC1 → Memory (continuous conversion)
// 1. Enable DMA2 clock
RCC_AHB1ENR |= (1 << 22);

// 2. Configure stream
DMA2_S0CR &= ~(1 << 0);          // Disable stream first
while(DMA2_S0CR & (1 << 0));     // Wait until disabled

DMA2_S0PAR  = (uint32_t)&ADC1_DR; // Peripheral address (ADC data register)
DMA2_S0M0AR = (uint32_t)buffer;   // Memory address (your array)
DMA2_S0NDTR = BUFFER_SIZE;        // Number of transfers
DMA2_S0CR  |= (0 << 25);          // Channel 0 (ADC1)
DMA2_S0CR  |= (1 << 10);          // Memory increment mode
DMA2_S0CR  |= (1 << 8);           // Circular mode
DMA2_S0CR  |= (1 << 0);           // Enable stream
```

**When DMA hangs** (common HAL issue): Check the DMA stream error flags in `DMA_LISR`/`DMA_HISR`. The HAL often doesn't surface these errors it just silently fails. Common causes: FIFO overrun, transfer error (wrong memory alignment), direct mode error.

## When to Use HAL vs Bare Metal

| Scenario | Use |
|----------|-----|
| Prototyping, USB, Ethernet, FatFS | HAL (complexity not worth hand-rolling) |
| Production ISRs (latency-critical) | Bare metal (HAL adds ~20 cycles overhead per call) |
| Debugging a HAL peripheral issue | Bare metal (read registers directly to see actual state) |
| Teaching/learning | Bare metal first, then appreciate what HAL does |
| Safety-critical (DO-178C, IEC 61508) | Bare metal or verified HAL (need to trace every register write) |
| Low-power optimization | Bare metal (HAL's clock management is conservative) |

## Debugging Toolkit

| Tool | What It Shows |
|------|---------------|
| GDB + OpenOCD | Step through code, inspect registers live |
| `x/1x 0x40020014` (GDB) | Read any memory-mapped register directly |
| Logic analyzer | Verify SPI/I2C/UART timing on the wire |
| ST-Link Utility | Flash programming, option bytes |
| Reference Manual (RM0090) | The bible. 1700 pages of truth. |
| CubeMX | Generate clock tree config, pin mapping (even if you don't use HAL code) |

## Key Takeaways

- **Every HAL function is just register writes.** Knowing which registers helps you debug HAL issues.
- **Enable the clock first.** Every peripheral is dead until its RCC bit is set.
- **Use `volatile` on all register pointers.** Without it, the compiler optimizes away your hardware access.
- **Read the reference manual, not the datasheet.** The datasheet is marketing. The RM is engineering.
- **Start bare metal, then add HAL.** Understanding the foundation makes the abstraction useful instead of magical.
- **DMA errors are silent by default.** Always check error flags when transfers stall.

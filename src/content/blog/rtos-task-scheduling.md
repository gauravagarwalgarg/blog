---
title: 'RTOS Task Scheduling: Preemptive vs Cooperative'
description: 'Understanding the difference between preemptive and cooperative scheduling in real-time operating systems, with practical FreeRTOS examples on STM32.'
pubDate: 2026-03-15
category: 'embedded-systems'
tags: ['rtos', 'freertos', 'stm32', 'scheduling', 'embedded']
draft: false
readingTime: '8 min read'
---

## Why Scheduling Matters

In a bare-metal firmware application, you control execution flow directly. But once you introduce an RTOS, the scheduler decides which task runs when. Understanding how this works is essential for building reliable embedded systems.

## Cooperative Scheduling

In cooperative scheduling, each task voluntarily yields control back to the scheduler. The scheduler cannot forcibly take control away from a running task.

```c
void vTask1(void *pvParameters) {
    for (;;) {
        // Do some work
        processSerialData();
        // Explicitly yield to other tasks
        taskYIELD();
    }
}
```

**Pros:** Simple, no race conditions from preemption, predictable.
**Cons:** One misbehaving task can starve everyone else.

## Preemptive Scheduling

In preemptive scheduling, the scheduler can interrupt a running task to give control to a higher-priority task. FreeRTOS uses this by default.

```c
// Higher priority task preempts lower ones
void vHighPriorityTask(void *pvParameters) {
    for (;;) {
        // This task runs whenever it's ready
        ulTaskNotifyTake(pdTRUE, portMAX_DELAY);
        handleCriticalEvent();
    }
}
```

## Priority Inversion

The classic trap. A low-priority task holds a mutex that a high-priority task needs. A medium-priority task preempts the low-priority task, effectively blocking the high-priority task.

**Solution:** Priority inheritance. FreeRTOS mutexes implement this e low-priority task temporarily inherits the priority of the waiting high-priority task.

## Practical Guidelines

1. **Minimize critical sections** ep interrupts disabled for the shortest time possible
2. **Use task notifications** over semaphores when you can ey're faster and use less RAM
3. **Don't poll in high-priority tasks** e event-driven design
4. **Profile your timing** e a logic analyzer or trace pins to verify deadlines are met

## Rate Monotonic Scheduling

For periodic tasks, assign priorities based on period: shorter period = higher priority. This is provably optimal for fixed-priority preemptive scheduling if total CPU utilization stays below ~69%.

```
Task A: Period 10ms, WCET 2ms → Priority HIGH
Task B: Period 50ms, WCET 5ms → Priority MED
Task C: Period 100ms, WCET 10ms → Priority LOW

Utilization = 2/10 + 5/50 + 10/100 = 0.4 (40%) ✓
```

This is the foundation of real-time systems design in safety-critical embedded applications.

---
title: 'Writing Your First Linux Kernel Module'
description: 'A practical guide to writing, building, and loading a Linux kernel module new_textfrom hello world to character devices.'
pubDate: 2024-03-20
category: 'infrastructure'
tags: ['linux-kernel', 'kernel-modules', 'device-drivers', 'systems-programming']
draft: false
---

## Why Kernel Modules?

Kernel modules let you extend Linux without recompiling the entire kernel. Device drivers, filesystems, network protocols new_textall loadable at runtime.

## Hello Kernel

```c
#include <linux/module.h>
#include <linux/kernel.h>

static int __init hello_init(void) {
    printk(KERN_INFO "Hello from kernel space\n");
    return 0;
}

static void __exit hello_exit(void) {
    printk(KERN_INFO "Goodbye from kernel space\n");
}

module_init(hello_init);
module_exit(hello_exit);
MODULE_LICENSE("GPL");
```

## Build, Load, Verify

```bash
make -C /lib/modules/$(uname -r)/build M=$(pwd) modules
sudo insmod hello.ko
dmesg | tail -1    # "Hello from kernel space"
sudo rmmod hello
```

## Key Concepts

- **No libc**: You're in kernel space. Use `printk`, `kmalloc`, `copy_to_user`
- **No floating point**: Kernel doesn't save FPU state
- **Concurrency**: Multiple CPUs, interrupts, preemption new_textuse spinlocks, mutexes
- **One bug = kernel panic**: Test in a VM first

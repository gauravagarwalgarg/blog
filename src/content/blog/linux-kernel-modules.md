---
title: "Writing Your First Linux Kernel Module"
description: "A practical guide to writing, building, and loading a Linux kernel module from hello world to character devices, with the gotchas nobody warns you about."
pubDate: 2024-03-20
category: 'infrastructure'
tags: ['linux', 'kernel', 'c', 'systems-programming', 'drivers']
draft: false
---

Kernel modules let you extend Linux without recompiling the entire kernel. Device drivers, filesystems, network protocols, security modules all loadable at runtime with `insmod`, removable with `rmmod`. This is how you talk directly to hardware, intercept system calls, and operate with zero abstraction between your code and the CPU.

The rules are different here. No libc. No `malloc`. One bug doesn't segfault your process it panics the entire machine.

## The Minimum Viable Module

```c
// hello.c smallest possible kernel module
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Gaurav Agarwal");
MODULE_DESCRIPTION("Hello World kernel module");
MODULE_VERSION("1.0");

static int __init hello_init(void) {
    // printk, not printf. Different ring, different function.
    // KERN_INFO is the log level (like syslog severity)
    printk(KERN_INFO "hello: module loaded\n");
    return 0;  // 0 = success, negative = error (errno convention)
}

static void __exit hello_exit(void) {
    printk(KERN_INFO "hello: module unloaded\n");
}

// Register entry/exit points with the kernel
module_init(hello_init);
module_exit(hello_exit);
```

## The Build System (Kbuild)

Kernel modules use the kernel's own build system, not a standalone Makefile:

```makefile
# Makefile
obj-m += hello.o

# Point to your kernel headers
KDIR := /lib/modules/$(shell uname -r)/build

all:
	make -C $(KDIR) M=$(PWD) modules

clean:
	make -C $(KDIR) M=$(PWD) clean
```

```bash
# Build
make

# Load (requires root)
sudo insmod hello.ko

# Verify it loaded
lsmod | grep hello
dmesg | tail -5  # See the printk output

# Unload
sudo rmmod hello
```

## The Rules of Kernel Space

| User Space | Kernel Space |
|-----------|-------------|
| `printf()` | `printk()` |
| `malloc()` / `free()` | `kmalloc()` / `kfree()` (< 128KB, physically contiguous) |
| `malloc()` for large | `vmalloc()` / `vfree()` (virtually contiguous, not physical) |
| `memcpy()` from user buffer | `copy_from_user()` (verifies user pointer is valid) |
| `memcpy()` to user buffer | `copy_to_user()` (same verification) |
| `sleep()` | `msleep()`, `usleep_range()`, `schedule_timeout()` |
| Floating point | **FORBIDDEN** kernel doesn't save FPU state |
| Stack: 8MB default | Stack: **8KB or 16KB** stack overflow = instant panic |
| Segfault = process dies | Bug = **kernel panic** (entire machine dead) |

## Character Device: A Real-World Example

```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/cdev.h>

#define DEVICE_NAME "mychardev"
#define BUF_SIZE 1024

MODULE_LICENSE("GPL");

static int major;
static char device_buffer[BUF_SIZE];
static int buffer_len = 0;

// Called when user does: open("/dev/mychardev", ...)
static int dev_open(struct inode *inode, struct file *file) {
    printk(KERN_INFO "mychardev: opened\n");
    return 0;
}

// Called when user does: read(fd, buf, count)
static ssize_t dev_read(struct file *file, char __user *buf,
                        size_t count, loff_t *offset) {
    int bytes_to_read = min((int)count, buffer_len - (int)*offset);
    if (bytes_to_read <= 0) return 0;

    // CRITICAL: Never use memcpy for user pointers. This validates
    // that 'buf' actually points to user-accessible memory.
    if (copy_to_user(buf, device_buffer + *offset, bytes_to_read))
        return -EFAULT;  // Bad user pointer

    *offset += bytes_to_read;
    return bytes_to_read;
}

// Called when user does: write(fd, data, count)
static ssize_t dev_write(struct file *file, const char __user *buf,
                         size_t count, loff_t *offset) {
    int bytes_to_write = min((int)count, BUF_SIZE - 1);

    if (copy_from_user(device_buffer, buf, bytes_to_write))
        return -EFAULT;

    buffer_len = bytes_to_write;
    device_buffer[buffer_len] = '\0';
    printk(KERN_INFO "mychardev: received %d bytes\n", buffer_len);
    return bytes_to_write;
}

static int dev_release(struct inode *inode, struct file *file) {
    return 0;
}

// File operations table maps syscalls to our functions
static struct file_operations fops = {
    .owner   = THIS_MODULE,
    .open    = dev_open,
    .read    = dev_read,
    .write   = dev_write,
    .release = dev_release,
};

static int __init chardev_init(void) {
    major = register_chrdev(0, DEVICE_NAME, &fops);
    if (major < 0) {
        printk(KERN_ALERT "mychardev: failed to register (err %d)\n", major);
        return major;
    }
    printk(KERN_INFO "mychardev: registered with major number %d\n", major);
    printk(KERN_INFO "mychardev: create device with: mknod /dev/%s c %d 0\n",
           DEVICE_NAME, major);
    return 0;
}

static void __exit chardev_exit(void) {
    unregister_chrdev(major, DEVICE_NAME);
    printk(KERN_INFO "mychardev: unregistered\n");
}

module_init(chardev_init);
module_exit(chardev_exit);
```

Usage:
```bash
sudo insmod mychardev.ko
# Check dmesg for the major number (e.g., 240)
sudo mknod /dev/mychardev c 240 0
sudo chmod 666 /dev/mychardev

# Write to device
echo "Hello kernel" > /dev/mychardev

# Read from device
cat /dev/mychardev  # Outputs: Hello kernel
```

## Concurrency in Kernel Space

The kernel is inherently concurrent: multiple CPUs, interrupts, preemption. Your module code can be interrupted at **any** point (unless you explicitly disable preemption).

| Mechanism | Use Case | Can Sleep? |
|-----------|----------|-----------|
| `spin_lock()` | Short critical sections, interrupt context | No |
| `mutex_lock()` | Longer critical sections, process context | Yes |
| `atomic_t` / `atomic_inc()` | Simple counters | N/A (lock-free) |
| `rcu_read_lock()` | Read-heavy, rarely-modified data | No |
| `completion` | Wait for event from another context | Yes |

**Rule**: If you're in an interrupt handler or holding a spinlock, you **cannot** sleep. No `kmalloc(GFP_KERNEL)`, no `mutex_lock()`, no `copy_from_user()`. Use `GFP_ATOMIC` for allocations in interrupt context.

## Debugging Kernel Modules

| Technique | How |
|-----------|-----|
| `printk()` + `dmesg` | The `printf` of kernel debugging |
| `/proc/` and `/sys/` | Export internal state as virtual files |
| `ftrace` | Function tracing without recompilation |
| `KGDB` | GDB attached to a running kernel (remote) |
| `crash` / `kdump` | Post-mortem analysis of kernel panics |
| QEMU + GDB | Best for development debug without risking hardware |

**Pro tip**: Always develop in a VM first. A buggy kernel module on bare metal means hard-rebooting your machine and potentially corrupting your filesystem.

## Key Takeaways

- **No libc, no exceptions, no safety net.** Every pointer dereference must be validated. Every allocation can fail.
- **`copy_to_user`/`copy_from_user` are non-negotiable.** Direct user-pointer access is a security vulnerability (and will crash).
- **Stack is tiny (8–16KB).** No large local arrays. Allocate on heap with `kmalloc`.
- **Concurrency is the default.** Protect shared state. Assume your code runs on multiple CPUs simultaneously.
- **Test in QEMU/VM first.** A kernel panic in development is a learning opportunity. On production hardware, it's an incident.
- **Read the source.** The Linux kernel source is the best documentation. `drivers/char/` has hundreds of character device examples.

---
title: 'Python Memory Management: Under the Hood'
description: 'How CPython manages memory ference counting, garbage collection, memory pools, and why your Python program uses more RAM than you expect.'
pubDate: 2024-05-12
category: 'python'
tags: ['python', 'memory-management', 'cpython', 'internals', 'performance']
draft: false
readingTime: '10 min read'
---

## The Two-Layer System

CPython uses a two-layer memory management system:

1. **Reference counting** e primary mechanism. Every object has a count of references pointing to it.
2. **Generational garbage collector** ndles reference cycles that refcounting can't detect.

## Reference Counting

Every Python object has a `ob_refcnt` field. When it hits zero, the memory is freed immediately.

```python
import sys

a = []           # refcount = 1
b = a            # refcount = 2
print(sys.getrefcount(a))  # 3 (includes function arg)

del b            # refcount = 2
del a            # refcount = 1 → freed? No, getrefcount added 1
```

**The problem:** circular references.

```python
class Node:
    def __init__(self):
        self.next = None

a = Node()
b = Node()
a.next = b
b.next = a  # Cycle! Refcount never hits 0
del a, b    # Memory leaked without GC
```

## The Generational Collector

CPython's GC uses three generations (0, 1, 2). New objects start in generation 0. If they survive a collection cycle, they're promoted.

```python
import gc

# Force collection of specific generation
gc.collect(generation=0)

# See GC stats
print(gc.get_stats())
# [{'collections': 100, 'collected': 800, 'uncollectable': 0}, ...]
```

## Memory Pools (pymalloc)

For small objects (≤ 512 bytes), CPython uses its own allocator with arenas (256 KB), pools (4 KB), and blocks.

This is why `del` doesn't always return memory to the OS e arena might have other live objects keeping it allocated.

## Practical Tips

1. **Use `__slots__`** for classes with many instances iminates the per-instance `__dict__`
2. **Avoid circular references** when possible e `weakref` for caches and callbacks
3. **Profile with `tracemalloc`**  shows you exactly where memory is allocated
4. **Generator expressions over list comprehensions** for large datasets zy evaluation uses constant memory

```python
# Bad: allocates entire list
total = sum([x*x for x in range(10_000_000)])

# Good: constant memory
total = sum(x*x for x in range(10_000_000))
```

Understanding these internals helps you write Python code that doesn't mysteriously eat all your RAM.

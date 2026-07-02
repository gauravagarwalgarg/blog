---
title: "Python Memory Management: Why Your Script Eats RAM"
description: 'CPython reference counting, the generational garbage collector, memory pools, and practical strategies for controlling memory in production Python services.'
pubDate: 2024-05-12
category: 'programming-languages'
tags: ['python', 'memory-management', 'cpython', 'internals', 'performance']
draft: false
readingTime: '14 min read'
---

Python manages memory for you which means you don't think about it until your 2GB container gets OOM-killed at 3 AM. CPython's memory model is elegant but has sharp edges: reference cycles that evade counting, small-object pools that never return memory to the OS, and a GIL that makes everything deceptively sequential.

Understanding these internals doesn't make you a better Python programmer daily. But when your service leaks 50MB/hour and you need to find why this is the knowledge that pays off.

## CPython's Dual Strategy: Counting + Tracing

CPython uses two garbage collection mechanisms working in tandem:

### Reference Counting (Immediate, Deterministic)

Every Python object has a reference count (`ob_refcnt` in the C struct). When it drops to zero, the object is freed immediately.

```python
import sys

a = [1, 2, 3]        # refcount = 1
b = a                 # refcount = 2
print(sys.getrefcount(a))  # 3 (getrefcount itself adds a temporary ref)

del b                 # refcount = 1
del a                 # refcount = 0 → freed immediately
```

**Why this matters**: Deterministic destruction means files close, locks release, and network connections drop the instant the last reference dies. This is why `with` statements work reliably in CPython (not guaranteed in PyPy or Jython).

**The fatal flaw**: Reference cycles.

```python
class Node:
    def __init__(self):
        self.next = None

a = Node()
b = Node()
a.next = b  # a → b
b.next = a  # b → a (CYCLE)

del a, b
# Both objects have refcount = 1 (from the other's .next attribute)
# Reference counting alone will NEVER free them
```

### Generational Garbage Collector (Periodic, Cycle-Breaking)

CPython's GC handles reference cycles using a **mark-and-sweep** approach with **three generations**:

| Generation | Contains | Collected When |
|-----------|----------|----------------|
| Gen 0 | Newly created objects | Every ~700 allocations |
| Gen 1 | Survived 1 Gen-0 collection | Every 10 Gen-0 collections |
| Gen 2 | Survived 1 Gen-1 collection | Every 10 Gen-1 collections |

**Hypothesis**: Most objects die young. Objects that survive multiple collections are likely long-lived. Promote them to higher generations and check less frequently.

```python
import gc

# Current thresholds
print(gc.get_threshold())  # (700, 10, 10) by default

# Current object counts per generation
print(gc.get_count())  # (123, 4, 1) objects in each gen

# Force a full collection
gc.collect()  # Returns number of unreachable objects found
```

## The Small Object Allocator (pymalloc)

CPython doesn't call `malloc()` for every 28-byte integer. Instead, it uses a **three-level memory hierarchy**:

```
Arena (256 KB)
  └── Pool (4 KB, one per size class)
       └── Block (8, 16, 24, ... 512 bytes)
```

- **Blocks**: Fixed-size chunks. Size classes from 8 to 512 bytes (in 8-byte increments = 64 size classes).
- **Pools**: 4 KB pages. Each pool serves one size class. Contains many blocks.
- **Arenas**: 256 KB chunks obtained from the OS. Contains 64 pools.

### The Memory Never-Return Problem

When a pool becomes completely empty, its arena is *partially* freed. But **an arena is only returned to the OS when ALL its pools are empty**. In practice, one surviving object in an arena keeps 256 KB allocated.

```python
# This is why your Python process never shrinks:
data = [bytearray(100) for _ in range(1_000_000)]  # Allocates ~100MB
del data  # Objects freed, but arenas may not be returned to OS
# Process RSS stays high. Memory is "free" internally but held by pymalloc.
```

**Workaround for long-running services**: Use `multiprocessing` for memory-heavy tasks child processes return all memory when they exit.

## Practical Memory Profiling

### Finding What's Eating RAM

```python
import tracemalloc

tracemalloc.start()

# ... your code here ...

snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')

print("Top 10 memory consumers:")
for stat in top_stats[:10]:
    print(stat)
```

### Tracking Growth Over Time

```python
import tracemalloc

tracemalloc.start()
snapshot1 = tracemalloc.take_snapshot()

# ... code that might leak ...

snapshot2 = tracemalloc.take_snapshot()
top_stats = snapshot2.compare_to(snapshot1, 'lineno')

print("Top memory growth:")
for stat in top_stats[:10]:
    print(stat)
```

### Identifying Reference Cycles

```python
import gc
import objgraph  # pip install objgraph

gc.collect()
# Show objects with most referrers (potential leak sources)
objgraph.show_most_common_types(limit=10)

# Find what's keeping a specific object alive
objgraph.show_backrefs(objgraph.by_type('MyClass')[0], max_depth=5)
```

## Common Memory Leaks and Fixes

| Pattern | Why It Leaks | Fix |
|---------|-------------|-----|
| Closures capturing large scopes | Lambda/function retains reference to entire enclosing scope | Explicitly pass only needed vars |
| Global caches without bounds | Dict grows forever | Use `functools.lru_cache(maxsize=N)` or `cachetools.TTLCache` |
| Circular references with `__del__` | GC can't determine safe deletion order | Use `weakref` for back-references |
| Thread-local accumulation | ThreadLocal vars never cleaned if thread lives forever | Explicit cleanup in thread teardown |
| Large default arguments | `def f(cache={})` shared mutable default | Use `None` sentinel + create inside function |
| Pandas DataFrames in loops | Each iteration creates copies | Use `.iloc[]` views, process in chunks |

## `__slots__`: Trading Flexibility for Memory

By default, every Python object has a `__dict__` (a hash table ~104 bytes). If you have millions of instances with fixed attributes, `__slots__` eliminates this overhead:

```python
class Point:
    __slots__ = ('x', 'y', 'z')
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

# Memory per instance:
# Without __slots__: ~152 bytes (object header + __dict__ + keys)
# With __slots__:    ~64 bytes (object header + 3 pointers)
# Savings: 58% per instance. At 10M instances = ~880 MB saved.
```

## Weak References: Breaking Cycles Without Breaking Logic

```python
import weakref

class Cache:
    def __init__(self):
        self._store = weakref.WeakValueDictionary()

    def put(self, key, value):
        self._store[key] = value  # Won't prevent GC of value

    def get(self, key):
        return self._store.get(key)  # Returns None if GC'd
```

The `WeakValueDictionary` doesn't increment the reference count of its values. When no other strong reference exists, the value is GC'd and the dict entry silently disappears.

## Key Takeaways

- **Reference counting is immediate and deterministic.** Objects are freed the instant their refcount hits zero. This is CPython-specific don't rely on it for portability.
- **The generational GC only exists to handle cycles.** If your code creates no cycles, the GC does almost nothing.
- **pymalloc never returns memory to the OS eagerly.** Your process RSS is a high-water mark. Accept it or use subprocesses.
- **`tracemalloc` is your first tool** for finding what's allocating. `objgraph` for finding what's retaining.
- **Use `__slots__` for data classes with millions of instances.** Or better: use `dataclasses(slots=True)` in Python 3.10+.
- **Use `weakref` for caches and back-references.** Break cycles without breaking your object graph.
- **Disable GC in latency-sensitive code** (`gc.disable()`) if you're certain no cycles exist. Re-enable periodically.

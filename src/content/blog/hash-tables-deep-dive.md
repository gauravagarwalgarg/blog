---
title: 'Hash Tables: The Data Structure That Powers Everything'
description: 'From collision resolution to load factors y hash tables give O(1) average time and what happens when they don not.'
pubDate: 2024-04-28
category: 'computer-science'
tags: ['data-structures', 'hash-tables', 'algorithms', 'performance']
draft: false
readingTime: '9 min read'
---

## Why Hash Tables Dominate

Dictionaries in Python, HashMaps in Java, objects in JavaScript sh tables are everywhere because they offer O(1) average-case lookup, insertion, and deletion. But "average-case" hides important nuance.

## The Core Idea

1. Take a key
2. Run it through a hash function to get an integer
3. Use that integer as an index into an array
4. Store/retrieve the value at that index

```python
def simple_hash(key, size):
    return sum(ord(c) for c in str(key)) % size
```

## Collision Resolution

Two keys can hash to the same index. There are two main strategies:

### Chaining (Separate Chaining)

Each slot holds a linked list (or other collection) of entries:

```
[0] → (key1, val1) → (key5, val5)
[1] → (key2, val2)
[2] → None
[3] → (key3, val3) → (key7, val7) → (key9, val9)
```

### Open Addressing (Linear Probing)

If a slot is occupied, probe the next slot:

```python
def insert(table, key, value):
    idx = hash(key) % len(table)
    while table[idx] is not None:
        if table[idx][0] == key:
            table[idx] = (key, value)  # Update
            return
        idx = (idx + 1) % len(table)  # Probe
    table[idx] = (key, value)
```

## Load Factor and Resizing

The load factor α = n/m (items/slots). As α approaches 1, performance degrades:

- **Chaining:** Average lookup = O(1 + α). Works well even at α > 1.
- **Linear probing:** Average lookup = O(1/(1-α)). At α = 0.75, ~4 probes average.

Python's dict resizes when α exceeds 2/3. Java's HashMap resizes at 0.75.

## What Makes a Good Hash Function?

1. **Deterministic** me input always gives same output
2. **Uniform distribution** l slots equally likely
3. **Avalanche effect** all input change causes large output change
4. **Fast to compute** e whole point is performance

## Real-World Implementations

**Python dict (CPython 3.6+):** Open addressing with a compact layout. Keys and values stored in insertion order. Uses perturbation-based probing.

**Robin Hood hashing:** Reduce worst-case probe length by "stealing" slots from rich (low-displacement) entries for poor (high-displacement) entries.

## When Hash Tables Fail

- **Worst case is O(n)**  all keys hash to the same bucket
- **No ordering** n't do range queries or find min/max efficiently
- **Cache unfriendly** (chaining) inter chasing kills performance
- **Hash DoS** edictable hash functions allow adversarial O(n) behavior

For ordered data, use a balanced BST (O(log n) everything but with ordering). For the 95% case, hash tables win.

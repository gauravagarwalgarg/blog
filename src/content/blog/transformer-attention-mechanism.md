---
title: "Attention Is All You Need: The Mechanism from Scratch"
description: "Building the transformer attention mechanism from first principles scaled dot-product attention, multi-head attention, positional encoding, why self-attention replaces recurrence, O(n²) complexity analysis, and key/query/value intuition with full matrix math."
pubDate: 2026-03-10
category: 'machine-learning'
tags: ['transformers', 'attention', 'deep-learning', 'nlp']
draft: false
readingTime: '16 min'
---

The transformer architecture eliminated recurrence from sequence modeling. The core insight: instead of processing tokens sequentially (and losing information over distance), let every token attend to every other token *simultaneously*. The attention mechanism is how this parallel relationship-extraction works, and understanding its linear algebra is the foundation for understanding modern LLMs.

## Why Self-Attention Replaces Recurrence

RNNs process sequences left-to-right, maintaining a hidden state. Two fundamental problems:

1. **Sequential computation** token at position `t` can't be processed until `t-1` is done. No parallelism.
2. **Information bottleneck** the hidden state must compress *all* prior context into a fixed-size vector. Token 500 has weak access to token 1.

Self-attention solves both:

| Property | RNN | Self-Attention |
|----------|-----|----------------|
| Path length between positions i,j | O(\|i-j\|) | O(1) |
| Parallelizable | No | Yes |
| Max sequence modeling | Limited by gradient flow | Limited by memory (O(n²)) |
| Per-layer complexity | O(n × d²) | O(n² × d) |

The trade-off: attention's O(n²) memory cost vs RNN's O(1) memory per step. For sequences under ~4096 tokens, attention wins. Beyond that, you need sparse attention variants.

## Scaled Dot-Product Attention

The fundamental operation. Given queries Q, keys K, and values V:

```
Attention(Q, K, V) = softmax(QK^T / √d_k) × V
```

### Step-by-Step Computation

Let's trace through a concrete example with sequence length n=3, dimension d_k=4:

```python
import numpy as np

# Input embeddings (3 tokens, each 4-dimensional)
X = np.array([
    [1.0, 0.0, 1.0, 0.0],  # token 0
    [0.0, 1.0, 0.0, 1.0],  # token 1
    [1.0, 1.0, 0.0, 0.0],  # token 2
])

# Learned weight matrices (4×4 for this example)
W_Q = np.random.randn(4, 4) * 0.1
W_K = np.random.randn(4, 4) * 0.1
W_V = np.random.randn(4, 4) * 0.1

# Project to queries, keys, values
Q = X @ W_Q  # (3, 4)
K = X @ W_K  # (3, 4)
V = X @ W_V  # (3, 4)

# Compute attention scores
d_k = Q.shape[-1]
scores = Q @ K.T / np.sqrt(d_k)  # (3, 3) every token vs every token

# Softmax (row-wise: each token's attention distribution)
def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return exp_x / exp_x.sum(axis=-1, keepdims=True)

attention_weights = softmax(scores)  # (3, 3), rows sum to 1

# Weighted sum of values
output = attention_weights @ V  # (3, 4) contextualized representations
```

### Matrix Dimensions at Each Step

```
X:               (n, d_model)     = (3, 4)
W_Q, W_K, W_V:  (d_model, d_k)   = (4, 4)
Q, K, V:        (n, d_k)          = (3, 4)
QK^T:           (n, n)            = (3, 3)  ← attention matrix
softmax(QK^T):  (n, n)            = (3, 3)  ← attention weights
Output:         (n, d_k)          = (3, 4)  ← contextualized tokens
```

### Why Scale by √d_k?

Without scaling, when d_k is large, the dot products grow in magnitude (variance of dot product ≈ d_k). Large values push softmax into saturation regions where gradients vanish.

```
# Without scaling (d_k = 512):
dot_products ~ N(0, d_k) → values like ±30
softmax([30, -30, 0]) ≈ [1.0, 0.0, 0.0]  # nearly one-hot, gradient ≈ 0

# With scaling:
dot_products / √512 ~ N(0, 1) → values like ±2
softmax([2, -2, 0]) ≈ [0.66, 0.01, 0.33]  # smooth, gradient flows
```

## Key, Query, Value Intuition

The K/Q/V framework is a *soft dictionary lookup*:

- **Query**: "what am I looking for?" the current token's search vector
- **Key**: "what do I contain?" each token's advertised content
- **Value**: "what do I provide?" the actual information to retrieve

Analogy with a database:

```sql
-- Hard lookup (database)
SELECT value FROM table WHERE key = query;

-- Soft lookup (attention)
-- Returns weighted average of ALL values,
-- weighted by similarity(query, key)
output = Σ similarity(query, key_i) × value_i
```

### Why Separate K and V?

Keys determine *relevance*. Values determine *content*. A token might be highly relevant (matched by key) but provide different information (via value) than what made it relevant.

Example in translation: a French adjective's key might match with an English noun's query (because they're syntactically related), but the value passed is the semantic content for generating the correct English adjective.

## Multi-Head Attention

Single attention computes one set of relationships. Multi-head attention runs `h` parallel attention operations, each with different learned projections:

```python
class MultiHeadAttention:
    def __init__(self, d_model=512, n_heads=8):
        self.d_k = d_model // n_heads  # 64 per head
        self.n_heads = n_heads
        
        # Each head gets its own projection matrices
        self.W_Q = [Linear(d_model, self.d_k) for _ in range(n_heads)]
        self.W_K = [Linear(d_model, self.d_k) for _ in range(n_heads)]
        self.W_V = [Linear(d_model, self.d_k) for _ in range(n_heads)]
        
        # Output projection
        self.W_O = Linear(n_heads * self.d_k, d_model)
    
    def forward(self, X):
        heads = []
        for i in range(self.n_heads):
            Q = X @ self.W_Q[i]  # (n, d_k)
            K = X @ self.W_K[i]  # (n, d_k)
            V = X @ self.W_V[i]  # (n, d_k)
            head_i = scaled_dot_product_attention(Q, K, V)
            heads.append(head_i)
        
        # Concatenate all heads and project
        concat = np.concatenate(heads, axis=-1)  # (n, h×d_k) = (n, d_model)
        return concat @ self.W_O  # (n, d_model)
```

### Why Multiple Heads?

Different heads learn different relationship types:

| Head | Might Learn |
|------|-------------|
| Head 0 | Syntactic dependencies (subject-verb) |
| Head 1 | Positional proximity |
| Head 2 | Coreference (pronoun → antecedent) |
| Head 3 | Semantic similarity |

In practice (from attention visualization research), heads specialize automatically during training. Some heads attend to adjacent tokens; others attend to tokens at specific relative positions; some track syntactic trees.

### Efficient Implementation (Real PyTorch)

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        assert d_model % n_heads == 0
        self.d_k = d_model // n_heads
        self.n_heads = n_heads
        
        # Single large linear for all heads (more efficient)
        self.W_qkv = nn.Linear(d_model, 3 * d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, x, mask=None):
        B, N, D = x.shape
        
        # Project and reshape: (B, N, 3*D) → 3 × (B, h, N, d_k)
        qkv = self.W_qkv(x).reshape(B, N, 3, self.n_heads, self.d_k)
        qkv = qkv.permute(2, 0, 3, 1, 4)  # (3, B, h, N, d_k)
        Q, K, V = qkv[0], qkv[1], qkv[2]
        
        # Scaled dot-product attention
        scores = (Q @ K.transpose(-2, -1)) / (self.d_k ** 0.5)  # (B, h, N, N)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        
        attn = F.softmax(scores, dim=-1)
        
        # Apply attention to values
        out = (attn @ V).transpose(1, 2).reshape(B, N, D)  # (B, N, D)
        return self.W_o(out)
```

## Positional Encoding

Self-attention is permutation-equivariant: shuffling input tokens produces the same shuffled output. Without positional information, "cat sat on mat" = "mat on sat cat" to the model.

### Sinusoidal Encoding (Original Transformer)

```python
def positional_encoding(max_len, d_model):
    pe = np.zeros((max_len, d_model))
    position = np.arange(max_len)[:, np.newaxis]  # (max_len, 1)
    
    div_term = np.exp(np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model))
    
    pe[:, 0::2] = np.sin(position * div_term)  # even dimensions
    pe[:, 1::2] = np.cos(position * div_term)  # odd dimensions
    
    return pe  # (max_len, d_model)
```

### Why Sinusoids?

1. **Unique encoding** per position each position gets a distinct pattern
2. **Bounded values** always in [-1, 1], won't dominate learned embeddings
3. **Relative position information** PE(pos+k) can be expressed as a linear function of PE(pos)
4. **Extrapolation** can handle sequences longer than training data (in theory)

### Alternatives

| Method | Pros | Cons |
|--------|------|------|
| Sinusoidal (fixed) | No parameters, extrapolates | Less expressive |
| Learned absolute | More expressive | Fixed max length |
| RoPE (Rotary) | Encodes relative position, extrapolates well | More complex |
| ALiBi | No embedding needed, strong extrapolation | Linear bias may be too simple |

Modern LLMs (LLaMA, GPT-4) use RoPE: rotations in the Q/K space that encode relative position.

## Computational Complexity Analysis

### Time Complexity

```
Self-attention: O(n² × d)
  - QK^T multiplication: (n, d) × (d, n) = O(n² × d)
  - Softmax: O(n²)
  - Attention × V: (n, n) × (n, d) = O(n² × d)
  
Feed-forward: O(n × d²)
  - Each token independently: (1, d) × (d, 4d) = O(d²), done n times
```

### Memory Complexity

```
Attention matrix: O(n²) this is the bottleneck
  - For n=4096, d=512: attention matrix = 4096² = 16M entries
  - At fp16: 32 MB per layer per head
  - With 32 heads, 12 layers: 32 × 32 × 12 = 12 GB just for attention
```

### Complexity Comparison

| Component | Time | Memory | Dominates when |
|-----------|------|--------|----------------|
| Self-attention | O(n²d) | O(n²) | n > d (long sequences) |
| Feed-forward | O(nd²) | O(nd) | d > n (short sequences) |

For GPT-3 (n=2048, d=12288): feed-forward dominates. For long-context models (n=100k): attention dominates.

## Masking Patterns

### Causal Mask (Decoder / Autoregressive)

Prevents tokens from attending to future positions. Essential for language generation.

```python
# Causal mask: lower triangular
def causal_mask(n):
    mask = torch.tril(torch.ones(n, n))
    return mask  # 1 = attend, 0 = block

# Applied as:
scores = scores.masked_fill(mask == 0, float('-inf'))
# After softmax, -inf → 0 probability
```

```
Attention matrix (causal):
     t0  t1  t2  t3
t0 [ ✓   ✗   ✗   ✗ ]
t1 [ ✓   ✓   ✗   ✗ ]
t2 [ ✓   ✓   ✓   ✗ ]
t3 [ ✓   ✓   ✓   ✓ ]
```

### Padding Mask (Encoder)

Prevents attention to padding tokens in variable-length batches.

```python
# padding_mask: (B, N) 0 for pad tokens
# Expand to (B, 1, 1, N) for broadcasting with (B, h, N, N)
padding_mask = (input_ids != PAD_TOKEN).unsqueeze(1).unsqueeze(2)
```

## The Full Transformer Block

Attention is one component. The full block:

```python
class TransformerBlock(nn.Module):
    def __init__(self, d_model, n_heads, d_ff, dropout=0.1):
        super().__init__()
        self.attention = MultiHeadAttention(d_model, n_heads)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.GELU(),
            nn.Linear(d_ff, d_model),
        )
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask=None):
        # Pre-norm variant (used in GPT-2+, more stable training)
        x = x + self.dropout(self.attention(self.norm1(x), mask))
        x = x + self.dropout(self.ffn(self.norm2(x)))
        return x
```

Key design choices:
- **Residual connections** gradient highway, prevents degradation with depth
- **Layer normalization** stabilizes activations, enables deeper networks
- **Feed-forward expansion** d_ff = 4 × d_model is standard (non-linear capacity)
- **Pre-norm vs post-norm** pre-norm is more stable for deep models

## Practical Implications

Understanding attention mechanics informs:

1. **Context window limits** O(n²) is why you can't just feed a million tokens
2. **Attention sinks** first tokens often get high attention regardless of content (positional bias)
3. **Sparse attention** only attend to local windows + global tokens (Longformer, BigBird)
4. **Flash Attention** same math, but memory-efficient by tiling the computation
5. **KV-cache** during generation, cache K and V to avoid recomputation

The mechanism is simple. The emergent capabilities from stacking 96 layers of it are not.

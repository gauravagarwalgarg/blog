---
title: 'Transformer Attention Mechanism from Scratch'
description: 'Building the multi-head self-attention mechanism from first principles in NumPy, then PyTorch derstanding every matrix multiplication.'
pubDate: 2026-04-01
category: 'machine-learning'
tags: ['transformers', 'attention', 'deep-learning', 'pytorch', 'nlp']
draft: false
readingTime: '12 min read'
---

## Why Attention?

Before transformers, sequence models (RNNs, LSTMs) processed tokens sequentially. Attention lets every token attend to every other token in parallel amatically improving both training speed and the ability to capture long-range dependencies.

## The Core Formula

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Let's break this down:
- **Q** (Query): "What am I looking for?"
- **K** (Key): "What do I contain?"
- **V** (Value): "What information do I provide?"

## NumPy Implementation

```python
import numpy as np

def attention(Q, K, V):
    d_k = K.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)
    weights = softmax(scores, axis=-1)
    return weights @ V

def softmax(x, axis=-1):
    e_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e_x / e_x.sum(axis=axis, keepdims=True)
```

## Why Scale by √d_k?

Without scaling, as `d_k` grows, the dot products grow in magnitude, pushing softmax into regions with extremely small gradients. Scaling by `√d_k` keeps the variance of the dot products at 1 regardless of dimension.

## Multi-Head Attention

Instead of one attention function with `d_model`-dimensional keys, values, and queries, project them into `h` different subspaces:

```python
import torch
import torch.nn as nn

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, x):
        B, T, C = x.shape
        
        Q = self.W_q(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        
        scores = (Q @ K.transpose(-2, -1)) / (self.d_k ** 0.5)
        attn = torch.softmax(scores, dim=-1)
        out = (attn @ V).transpose(1, 2).contiguous().view(B, T, C)
        
        return self.W_o(out)
```

## The Intuition

Think of multi-head attention as the model learning to attend to different types of information simultaneously e head might track syntax, another semantics, another positional relationships.

## Causal Masking (for Decoders)

In autoregressive models (GPT-style), we mask future positions so the model can't cheat during training:

```python
mask = torch.triu(torch.ones(T, T), diagonal=1).bool()
scores.masked_fill_(mask, float('-inf'))
```

This is the fundamental building block of every modern language model.

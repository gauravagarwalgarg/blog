---
title: 'Backpropagation: The Algorithm That Trains Neural Networks'
description: 'A clear, math-first walkthrough of backpropagation ain rule, computational graphs, and why gradients flow backward.'
pubDate: 2024-06-20
category: 'machine-learning'
tags: ['neural-networks', 'backpropagation', 'deep-learning', 'optimization', 'calculus']
draft: false
readingTime: '11 min read'
---

## The Big Picture

Training a neural network means finding weights that minimize a loss function. Backpropagation efficiently computes the gradient of the loss with respect to every weight lling us which direction to nudge each weight to reduce error.

## Forward Pass

Given input x, compute the output layer by layer:

```python
# Simple 2-layer network
z1 = W1 @ x + b1      # Linear transform
a1 = relu(z1)          # Activation
z2 = W2 @ a1 + b2     # Linear transform
y_hat = softmax(z2)    # Output probabilities
loss = cross_entropy(y_hat, y_true)
```

## The Chain Rule

Backpropagation is just the chain rule applied systematically:

$$\frac{\partial L}{\partial W_1} = \frac{\partial L}{\partial z_2} \cdot \frac{\partial z_2}{\partial a_1} \cdot \frac{\partial a_1}{\partial z_1} \cdot \frac{\partial z_1}{\partial W_1}$$

We compute these partial derivatives backwards om loss to inputs reing intermediate results.

## Backward Pass (NumPy)

```python
# Gradient of loss w.r.t. output
dz2 = y_hat - y_true                    # (softmax + cross-entropy shortcut)

# Gradients for W2, b2
dW2 = dz2.reshape(-1, 1) @ a1.reshape(1, -1)
db2 = dz2

# Propagate gradient backward through layer 1
da1 = W2.T @ dz2
dz1 = da1 * (z1 > 0)                    # ReLU derivative

# Gradients for W1, b1
dW1 = dz1.reshape(-1, 1) @ x.reshape(1, -1)
db1 = dz1
```

## Why Gradients Vanish (or Explode)

Each layer multiplies the gradient by its weight matrix. After many layers:
- If weights < 1: gradients shrink exponentially → **vanishing gradients**
- If weights > 1: gradients grow exponentially → **exploding gradients**

**Solutions:**
- Careful initialization (He, Xavier)
- Residual connections (skip connections)
- Gradient clipping
- Normalization layers (BatchNorm, LayerNorm)

## Computational Graphs

Modern frameworks (PyTorch, TensorFlow) build a directed acyclic graph of operations during the forward pass. Backprop traverses this graph in reverse, applying the chain rule at each node.

```python
# PyTorch autograd does this automatically
x = torch.randn(10, requires_grad=True)
y = (x ** 2).sum()
y.backward()  # Computes dy/dx for all x
print(x.grad)  # = 2*x
```

## The Gradient Descent Update

Once we have gradients, update weights:

```python
# Vanilla SGD
for param in parameters:
    param -= learning_rate * param.grad

# Adam (adaptive learning rate)
# Maintains running averages of gradients and squared gradients
m = beta1 * m + (1 - beta1) * grad
v = beta2 * v + (1 - beta2) * grad**2
param -= lr * m / (sqrt(v) + eps)
```

Backpropagation is elegant single algorithm that scales from a 2-layer perceptron to a 175-billion parameter GPT. The math is the same; only the graph gets bigger.

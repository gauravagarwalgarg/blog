---
title: 'Backpropagation: Chain Rule, Computational Graphs, and Modern Training'
description: 'Backpropagation from first principles the chain rule applied to computational graphs, vanishing and exploding gradients, gradient clipping, batch normalization, skip connections, and how automatic differentiation engines like PyTorch autograd actually work.'
pubDate: 2026-03-05
category: 'machine-learning'
tags: ['neural-networks', 'backpropagation', 'deep-learning', 'calculus']
draft: false
readingTime: '15 min'
---

Backpropagation is not a learning algorithm it's an efficient method for computing gradients. The learning algorithm is gradient descent. Backprop's contribution is making gradient computation tractable: instead of O(n²) perturbation-based differentiation, backprop computes all gradients in a single backward pass with cost proportional to the forward pass. Every modern deep learning framework is built on this insight.

## The Chain Rule Foundation of Everything

A neural network is a composition of functions. If `y = f(g(h(x)))`, the derivative of `y` with respect to `x` is:

```
dy/dx = (dy/df) × (df/dg) × (dg/dh) × (dh/dx)
```

Each factor is a *local* gradient computed at one layer without knowledge of the rest. This decomposition is what makes backprop work.

### Concrete Example: Single Neuron

```python
# Forward pass
z = w * x + b       # linear combination
a = sigmoid(z)      # activation
L = (a - y)**2      # loss (MSE)

# Backward pass (chain rule)
dL/da = 2(a - y)                    # loss gradient
da/dz = sigmoid(z) * (1 - sigmoid(z))  # activation gradient
dz/dw = x                           # weight gradient
dz/db = 1                           # bias gradient

# Full gradients
dL/dw = dL/da × da/dz × dz/dw = 2(a-y) × σ(z)(1-σ(z)) × x
dL/db = dL/da × da/dz × dz/db = 2(a-y) × σ(z)(1-σ(z)) × 1
```

## Computational Graphs Making it Systematic

A computational graph makes backprop mechanical. Each node is an operation; edges are data flow.

```
Forward:
x ──┐
    ├── [×] ── z₁ ──┐
w ──┘                 ├── [+] ── z₂ ── [σ] ── a ── [L] ── loss
              b ─────┘

Backward (reverse topological order):
loss ← dloss/dloss = 1
a    ← dloss/da = 2(a - y)
z₂   ← dloss/dz₂ = dloss/da × da/dz₂ = 2(a-y) × σ'(z₂)
b    ← dloss/db = dloss/dz₂ × 1
z₁   ← dloss/dz₁ = dloss/dz₂ × 1
w    ← dloss/dw = dloss/dz₁ × x
x    ← dloss/dx = dloss/dz₁ × w
```

### Key Insight: Fan-Out Nodes

When a value is used by multiple downstream operations, gradients *sum*:

```python
# If x is used in two places:
y1 = f(x)
y2 = g(x)
loss = h(y1, y2)

# Then:
dloss/dx = dloss/dy1 × dy1/dx + dloss/dy2 × dy2/dx
```

This is why residual connections work: the gradient from the skip path *adds* to the gradient from the main path.

## Multi-Layer Network Matrix Form

For a 2-layer network:

```python
# Forward
Z1 = X @ W1 + b1        # (batch, hidden)
A1 = relu(Z1)           # (batch, hidden)
Z2 = A1 @ W2 + b2       # (batch, output)
Y_hat = softmax(Z2)     # (batch, output)
L = cross_entropy(Y_hat, Y)

# Backward
dZ2 = Y_hat - Y                    # (batch, output) softmax+CE gradient
dW2 = A1.T @ dZ2 / batch_size      # (hidden, output)
db2 = dZ2.mean(axis=0)             # (output,)

dA1 = dZ2 @ W2.T                   # (batch, hidden)
dZ1 = dA1 * (Z1 > 0)              # (batch, hidden) ReLU gradient
dW1 = X.T @ dZ1 / batch_size       # (input, hidden)
db1 = dZ1.mean(axis=0)             # (hidden,)
```

### Gradient Shapes Rule

```
If forward: Z = X @ W     (m,n) = (m,k) @ (k,n)
Then:
  dL/dW = X.T @ dL/dZ    (k,n) = (k,m) @ (m,n)
  dL/dX = dL/dZ @ W.T    (m,k) = (m,n) @ (n,k)
```

The shapes *always* work out to match the original matrices. This is your sanity check.

## Vanishing Gradients

The gradient at layer `l` in a deep network is:

```
∂L/∂W_l = ∂L/∂a_L × ∂a_L/∂a_{L-1} × ... × ∂a_{l+1}/∂a_l × ∂a_l/∂W_l
```

Each `∂a_{i}/∂a_{i-1}` involves the activation's derivative. For sigmoid:

```
σ'(z) = σ(z)(1 - σ(z))    maximum value: 0.25 (at z=0)
```

After 10 layers: 0.25¹⁰ = 9.5 × 10⁻⁷. The gradient has effectively vanished.

### Why ReLU Helps (But Doesn't Fully Solve It)

```
ReLU'(z) = 1 if z > 0, else 0
```

For positive activations, gradient flows unchanged (multiplied by 1). But "dead neurons" (stuck at z < 0) have exactly zero gradient permanently.

| Activation | Gradient Range | Vanishing? | Other Issues |
|------------|---------------|------------|--------------|
| Sigmoid | (0, 0.25] | Severe | Saturated outputs |
| Tanh | (0, 1] | Moderate | Saturated at extremes |
| ReLU | {0, 1} | Dead neurons | Not zero-centered |
| Leaky ReLU | {0.01, 1} | Minimal | Arbitrary slope |
| GELU | Smooth, ~(0, 1.08) | Minimal | Used in transformers |

## Exploding Gradients

The converse: if weight matrices have spectral norm > 1, gradients grow exponentially through layers.

```
||∂a_L/∂a_1|| ≈ ||W||^L × ||σ'||^L
```

If ||W|| = 1.5 and L=50: 1.5⁵⁰ ≈ 6.4 × 10⁸. Gradient explosion causes NaN losses and parameter divergence.

### Detection

```python
# Monitor gradient norms during training
for name, param in model.named_parameters():
    if param.grad is not None:
        grad_norm = param.grad.norm()
        if grad_norm > 1000:
            print(f"Exploding: {name}, norm={grad_norm:.2f}")
        if grad_norm < 1e-7:
            print(f"Vanishing: {name}, norm={grad_norm:.2e}")
```

## Gradient Clipping

The primary defense against exploding gradients. Two variants:

### Clip by Value

```python
# Clip each gradient element independently
torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=1.0)
# Equivalent to: grad = clamp(grad, -1.0, 1.0)
```

### Clip by Norm (Preferred)

```python
# Scale ALL gradients proportionally if total norm exceeds threshold
max_norm = 1.0
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm)

# Implementation:
# total_norm = sqrt(sum(grad.norm()**2 for all params))
# if total_norm > max_norm:
#     scale = max_norm / total_norm
#     for param in params: param.grad *= scale
```

Clip by norm preserves gradient *direction* (just scales magnitude). Clip by value can change direction.

### When to Clip

| Model Type | Typical max_norm | Why |
|------------|-----------------|-----|
| RNN/LSTM | 1.0 - 5.0 | Long sequences = gradient accumulation |
| Transformer | 1.0 | Large models sensitive to spikes |
| GAN (discriminator) | 0.01 - 1.0 | Training stability |
| Standard CNN | Usually not needed | Short computational graphs |

## Batch Normalization

BatchNorm addresses internal covariate shift: as earlier layers update, the input distribution to later layers changes, making optimization harder.

```python
class BatchNorm1d:
    def __init__(self, d, eps=1e-5, momentum=0.1):
        self.gamma = np.ones(d)   # learnable scale
        self.beta = np.zeros(d)   # learnable shift
        self.eps = eps
        self.running_mean = np.zeros(d)
        self.running_var = np.ones(d)
    
    def forward(self, x, training=True):
        if training:
            mean = x.mean(axis=0)             # batch statistics
            var = x.var(axis=0)
            self.running_mean = 0.9 * self.running_mean + 0.1 * mean
            self.running_var = 0.9 * self.running_var + 0.1 * var
        else:
            mean = self.running_mean           # stored statistics
            var = self.running_var
        
        x_hat = (x - mean) / np.sqrt(var + self.eps)  # normalize
        return self.gamma * x_hat + self.beta          # scale and shift
```

### How BatchNorm Helps Gradients

1. **Prevents saturated activations** normalized inputs stay in the linear region of sigmoid/tanh
2. **Reduces sensitivity to initialization** output scale is controlled regardless of weight scale
3. **Allows higher learning rates** smoother loss landscape
4. **Slight regularization** batch statistics introduce noise

### BatchNorm Gradient Flow

```
Forward: y = γ × (x - μ_B) / √(σ²_B + ε) + β

Backward:
  ∂L/∂γ = Σ ∂L/∂y_i × x̂_i
  ∂L/∂β = Σ ∂L/∂y_i
  ∂L/∂x_i = (γ / √(σ²+ε)) × (∂L/∂y_i - mean(∂L/∂y) - x̂_i × mean(∂L/∂y × x̂))
```

The last term shows that BatchNorm's gradient depends on the *entire batch* it's not element-wise.

## Skip Connections (Residual Learning)

The insight from ResNet: let layers learn *residuals* rather than full mappings.

```python
# Without skip: output = F(x)
# With skip:    output = F(x) + x

class ResidualBlock(nn.Module):
    def __init__(self, d):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d, d),
            nn.ReLU(),
            nn.Linear(d, d),
        )
    
    def forward(self, x):
        return x + self.net(x)  # skip connection
```

### Why Skip Connections Fix Vanishing Gradients

```
Forward: y = F(x) + x

Backward:
  ∂y/∂x = ∂F(x)/∂x + I    (identity matrix!)
```

The gradient through a residual block is always *at least* the identity. Even if `∂F(x)/∂x ≈ 0` (vanishing through F), the skip connection provides a gradient highway with magnitude 1.

Through L residual blocks:

```
∂y_L/∂x_0 = Π(∂F_l/∂x + I) = I + Σ(cross terms) ≠ 0
```

The gradient cannot vanish to zero as long as skip connections exist.

## Automatic Differentiation How PyTorch Actually Works

PyTorch's autograd builds a dynamic computational graph during the forward pass, then traverses it backward.

### Tape-Based AD

```python
import torch

x = torch.tensor(2.0, requires_grad=True)
w = torch.tensor(3.0, requires_grad=True)

# Forward pass graph is recorded
y = w * x          # MulBackward node created
z = y + 1          # AddBackward node created
loss = z ** 2      # PowBackward node created

# Backward pass traverse graph in reverse
loss.backward()

# Gradients accumulated in .grad
print(w.grad)  # d(loss)/dw = 2*z * x = 2*7*2 = 28
print(x.grad)  # d(loss)/dx = 2*z * w = 2*7*3 = 42
```

### Under the Hood

Each tensor operation creates a `Function` node with a `backward()` method:

```python
class MulBackward(Function):
    def __init__(self, a, b):
        self.saved_a = a  # save for backward
        self.saved_b = b
    
    def backward(self, grad_output):
        # d(a*b)/da = b, d(a*b)/db = a
        return grad_output * self.saved_b, grad_output * self.saved_a
```

### Key Properties of PyTorch Autograd

| Feature | Behavior |
|---------|----------|
| Graph construction | Dynamic (built each forward pass) |
| Gradient accumulation | Additive (call `zero_grad()` before each step) |
| In-place operations | Restricted (can invalidate graph) |
| Detaching | `.detach()` stops gradient flow |
| No-grad context | `with torch.no_grad()` disables graph recording |
| Higher-order gradients | `create_graph=True` in `.backward()` |

### Custom Autograd Function

```python
class CustomReLU(torch.autograd.Function):
    @staticmethod
    def forward(ctx, input):
        ctx.save_for_backward(input)
        return input.clamp(min=0)
    
    @staticmethod
    def backward(ctx, grad_output):
        input, = ctx.saved_tensors
        grad_input = grad_output.clone()
        grad_input[input < 0] = 0
        return grad_input

# Usage
output = CustomReLU.apply(input_tensor)
```

## Putting It Together: A Training Loop

```python
model = MLP(input_dim=784, hidden_dim=256, output_dim=10)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)

for epoch in range(100):
    for batch_x, batch_y in dataloader:
        # Forward
        logits = model(batch_x)
        loss = F.cross_entropy(logits, batch_y)
        
        # Backward
        optimizer.zero_grad()       # clear accumulated gradients
        loss.backward()             # compute gradients via backprop
        
        # Gradient clipping (before optimizer step)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        
        # Update
        optimizer.step()            # w = w - lr * grad
    
    scheduler.step()
```

The elegance: `loss.backward()` computes *all* gradients for *all* parameters in one pass. The graph was built implicitly during forward. The optimizer consumes gradients without knowing how they were computed.

## Numerical Gradient Checking

Verify your backprop implementation with finite differences:

```python
def grad_check(f, x, eps=1e-5):
    """Compare analytical gradient with numerical approximation."""
    analytic = compute_gradient(f, x)  # your backprop
    
    numerical = np.zeros_like(x)
    for i in range(len(x)):
        x_plus = x.copy(); x_plus[i] += eps
        x_minus = x.copy(); x_minus[i] -= eps
        numerical[i] = (f(x_plus) - f(x_minus)) / (2 * eps)
    
    # Relative error should be < 1e-5
    error = np.linalg.norm(analytic - numerical) / (
        np.linalg.norm(analytic) + np.linalg.norm(numerical) + 1e-8)
    return error
```

If relative error > 1e-5, your gradient computation has a bug. Common culprits: forgotten transpose, wrong axis in reduction, missing factor of 2.

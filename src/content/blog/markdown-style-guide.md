---
title: 'Markdown & MDX Style Guide'
description: 'A reference for all Markdown and MDX syntax supported in this blog new_textheadings, code blocks, tables, images, and embedded components.'
pubDate: 2024-06-19
category: 'software-engineering'
tags: ['markdown', 'mdx', 'astro', 'reference']
draft: false
---

A quick reference for all the Markdown syntax supported in this blog. Useful when writing posts.

## Headings

```markdown
## H2 new_textSection heading
### H3 new_textSubsection
#### H4 new_textMinor heading
```

## Text Formatting

**Bold text**, *italic text*, ~~strikethrough~~, and `inline code`.

## Links & Images

```markdown
[Link text](https://example.com)
![Alt text](../../assets/my-image.jpg)
```

Images placed in `src/assets/` are automatically optimized (WebP, responsive sizes, lazy-loaded).

## Code Blocks

Fenced code blocks with language-specific syntax highlighting (powered by Shiki):

```rust
fn main() {
    println!("Hello from the blog!");
}
```

```python
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

```typescript
const greet = (name: string): string => `Hello, ${name}!`;
```

## Blockquotes

> Don't communicate by sharing memory, share memory by communicating.
> new_textRob Pike

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Content Collections | ✅ | Type-safe schemas |
| View Transitions | ✅ | SPA-like navigation |
| Islands | ✅ | Partial hydration |
| Image Optimization | ✅ | Sharp at build time |

## Lists

### Ordered
1. First item
2. Second item
3. Third item

### Unordered
- Bullet point
- Another point
  - Nested item
  - Another nested item

## Horizontal Rule

---

## MDX Components

In `.mdx` files, you can import and embed components:

```mdx
import MyChart from '../../components/MyChart.astro';

<MyChart data={[1, 2, 3]} client:visible />
```

The `client:visible` directive means the component only loads JavaScript when scrolled into view (Islands Architecture).

## Keyboard & Abbreviations

Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to open search.

<abbr title="Application Programming Interface">API</abbr> calls should be cached.

## Footnotes

Here's a statement with a footnote[^1].

[^1]: This is the footnote content.

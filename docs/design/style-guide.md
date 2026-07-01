# Style Guide

Writing standards and content voice for blog posts.

---

## Voice & Tone

- **Authoritative, not academic** Write like you're explaining to a sharp colleague, not submitting a paper.
- **Direct entry** First paragraph states the thesis. No "In today's fast-paced world..." intros.
- **Show, don't tell** Code > prose. Tables > paragraphs. Diagrams > descriptions.
- **Opinionated** Take a stance. "Use X because Y" is more valuable than "there are many options."

## Anti-Patterns (Never Do This)

- "In this article, we will explore..." The reader can see what the article is about.
- "Delve deeper", "Revolutionize", "Game-changer" Empty hype words.
- Walls of text without headers Scannable structure is non-negotiable.
- Code without comments explaining the *why* Syntax is obvious; intent is not.

---

## Structure Template

```markdown
# Title (H1 descriptive, specific)

[Opening paragraph: problem statement or core thesis. Max 150 words.]

## Context / The Challenge (H2)
[Why this matters. Background mechanics.]

## Deep Dive (H2)
### Sub-section (H3)
[Core content with code, tables, lists]

### Another Sub-section (H3)
[Continue pattern]

## Key Takeaways (H2)
- Bullet 1
- Bullet 2
- Bullet 3

[Closing: 1-2 sentences. Forward-looking or call to discussion.]
```

---

## Formatting Rules

| Element | Standard |
|---------|----------|
| Headers | H2 for sections, H3 for sub-sections. Never skip levels. |
| Code blocks | Always specify language (```python, ```bash, ```c) |
| Bold | For key terms on first use: **CAP theorem**, **idempotency** |
| Lists | Bulleted for unordered, numbered only for sequences |
| Tables | For comparisons, specs, multi-column data |
| Links | Inline `[text](url)`. External links get context. |
| Images | Alt text required. Placed in `src/assets/`. |

---

## Content Length Guidelines

| Type | Target Length | Depth |
|------|-------------|-------|
| Technical deep-dive | 1500–3000 words | Full mechanics, code examples, trade-offs |
| Tutorial/How-to | 800–1500 words | Step-by-step, copy-paste ready |
| Opinion/Essay | 1000–2000 words | Thesis → evidence → conclusion |
| Quick tip | 300–600 words | One concept, one example, done |
| Micro-post | 50–200 words | Single thought or link |

---

## Code Block Standards

```python
# GOOD: Comment explains WHY, not WHAT
# Use exponential backoff to avoid thundering herd on retry
delay = min(base * (2 ** attempt) + random.uniform(0, jitter), max_delay)

# BAD: Comment restates the obvious
# multiply base by 2 to the power of attempt
delay = base * (2 ** attempt)
```

---

## SEO Checklist

- Title: specific, includes primary keyword naturally
- Description: < 160 chars, hooks the reader, includes keyword
- URL slug: lowercase, hyphenated, matches topic (`hash-tables-deep-dive`)
- Headers: contain secondary keywords where natural
- First paragraph: states the core value within 2 sentences

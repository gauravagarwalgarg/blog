# Adding New Content

## Write a New Blog Post

### 1. Create the file

```bash
touch src/content/blog/your-post-slug.md
```

### 2. Add frontmatter

```markdown
---
title: "Your Title Here"
description: "One-line hook for SEO (< 160 chars)."
pubDate: 2024-07-01
category: "software-engineering"
tags: ["relevant", "searchable", "tags"]
draft: false
---
```

### 3. Write content

Start with the thesis no intro fluff. Use H2/H3 for structure, code blocks for examples, tables for comparisons.

### 4. Preview locally

```bash
npm run dev
# Open http://localhost:4321/posts/your-post-slug/
```

### 5. Publish

```bash
git add src/content/blog/your-post-slug.md
git commit -m "feat: add post Your Title Here"
git push
```

Cloudflare auto-deploys on push.

---

## Available Categories

| Category | Slug | Use For |
|----------|------|---------|
| Software Engineering | `software-engineering` | Architecture, distributed systems, design patterns |
| Embedded Systems | `embedded-systems` | Firmware, RTOS, STM32, bare-metal |
| Machine Learning | `machine-learning` | Neural networks, transformers, ML infra |
| Computer Science | `computer-science` | Algorithms, data structures, theory |
| Programming Languages | `programming-languages` | C++, Python, Go, Rust, Java idioms |
| Electronics | `electronics` | Circuits, PCBs, signal processing |
| Product Management | `product-management` | Roadmaps, tech debt, shipping decisions |
| Developer Wellness | `developer-wellness` | Burnout, productivity, cognitive load |
| Spirituality & Flow | `spirituality` | Flow states, meditation, deep work |
| Infrastructure | `infrastructure` | Linux, Docker, K8s, cloud |
| Aerospace | `aerospace` | DO-178C, avionics, safety-critical |
| Tech Tips | `tech-tips` | Vim, tools, productivity hacks |
| Personal Finance | `personal-finance` | Investing, index funds, tax |
| History | `history` | Engineering history, civilizations |
| Culinary | `culinary` | Recipes, food science |
| Reviews | `reviews` | Hardware, books, tools |
| Poems | `poems` | Creative writing |

## Tag Guidelines

- Use lowercase, hyphenated tags: `distributed-systems`, `c++`, `python`
- Limit to 3–5 tags per post
- Reuse existing tags when possible (check other posts)
- Tags power the search and related posts features

## Draft Mode

Set `draft: true` in frontmatter to write without publishing. Draft posts are excluded from all listings, RSS, and sitemap but still render at their URL for preview.

## Using MDX (Interactive Posts)

Rename to `.mdx` and import components:

```mdx
---
title: "Interactive Demo"
---
import MyComponent from '../../components/MyComponent.astro';

Regular markdown here.

<MyComponent client:visible />
```

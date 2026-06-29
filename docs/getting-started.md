# 🚀 Getting Started Learn, Build, Iterate

> From zero Astro knowledge to publishing your first post in 30 minutes.

---

## Prerequisites

- Node.js 22+ (`node --version`)
- Git
- A text editor (VS Code recommended for Astro extension)

---

## 1. Clone & Run (5 minutes)

```bash
git clone https://github.com/GauravAgarwalGarg/Blog.git
cd Blog
npm install
npm run dev
```

Open [http://localhost:4321/Blog](http://localhost:4321/Blog). You're running.

---

## 2. Write Your First Post (10 minutes)

Create `src/content/blog/my-first-post.md`:

```markdown
---
title: "My First Post"
description: "A short description for SEO and social cards."
pubDate: 2024-06-15
category: "software-engineering"
tags: ["learning", "astro"]
draft: false
---

## Hello World

This is my first blog post. It supports:

- **Bold** and *italic*
- [Links](https://example.com)
- Code blocks with syntax highlighting

```python
def hello():
    print("Hello from my blog!")
```

> Blockquotes look like this.

That's it. Save the file and it's live on your dev server.
```

### Frontmatter Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `title` | ✅ | string | Post title |
| `description` | ✅ | string | SEO description (< 160 chars) |
| `pubDate` | ✅ | date | Publication date (YYYY-MM-DD) |
| `category` | ❌ | string | One of the defined categories |
| `tags` | ❌ | string[] | Searchable tags |
| `draft` | ❌ | boolean | `true` = hidden from listings |
| `heroImage` | ❌ | image | Hero image (auto-optimized) |
| `updatedDate` | ❌ | date | Last update date |

### Available Categories

`software-engineering` · `emerging-tech` · `aerospace` · `health-tech` · `startups` · `economics` · `infrastructure` · `history` · `culinary` · `micro`

---

## 3. Add a Hero Image (5 minutes)

Place an image in `src/assets/`:

```markdown
---
title: "Post With Image"
heroImage: "../../assets/my-image.jpg"
---
```

Astro automatically:
- Converts to WebP/AVIF
- Generates responsive sizes
- Adds width/height (no CLS)
- Lazy-loads below the fold

---

## 4. Write a Micro-Post (2 minutes)

Create `src/content/micro/quick-thought.md`:

```markdown
---
pubDate: 2024-06-16
tags: ['rust', 'til']
---

TIL: Rust's `?` operator is just syntactic sugar for early return on `Err`. But it makes error handling feel natural instead of painful.
```

Micro-posts are short-form no title, no description. Just a thought and a date.

---

## 5. Use MDX for Interactive Posts (10 minutes)

Create `src/content/blog/interactive-post.mdx`:

```mdx
---
title: "Interactive Post"
description: "A post with embedded components."
pubDate: 2024-06-17
category: "emerging-tech"
tags: ["mdx", "interactive"]
---

import Counter from '../../components/Counter.astro';

Regular Markdown works here.

## But you can also embed components:

<Counter client:visible />

And then continue with regular Markdown.
```

The `client:visible` directive means the component only loads JavaScript when scrolled into view (Island Architecture).

---

## 6. Build & Deploy (5 minutes)

```bash
# Build for production
npm run build

# Preview the build locally
npm run preview

# Deploy: just push to main
git add .
git commit -m "feat: add new post"
git push origin main
```

GitHub Actions automatically builds and deploys to Pages.

---

## 7. Customize

### Change Site Info

Edit `src/consts.ts`:
- Site title, description, author
- Navigation links
- Social links
- Projects list
- Categories

### Change Theme Colors

Edit `src/styles/global.css`:
- Light theme: `:root { ... }`
- Dark theme: `[data-theme="dark"] { ... }`

### Add a New Page

Create `src/pages/my-page.astro`:
```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---
<html lang="en">
<head><BaseHead title="My Page" description="..." /></head>
<body>
  <Header />
  <main class="container">
    <h1>My Page</h1>
  </main>
  <Footer />
</body>
</html>
```

It's automatically available at `/Blog/my-page`.

---

## Learning Astro

| Resource | Link |
|----------|------|
| Astro Docs (official) | [docs.astro.build](https://docs.astro.build/) |
| Astro Tutorial (build a blog) | [docs.astro.build/en/tutorial](https://docs.astro.build/en/tutorial/0-introduction/) |
| Astro Discord | [astro.build/chat](https://astro.build/chat) |
| Astro YouTube | [youtube.com/@astaborrodotbuild](https://www.youtube.com/@astrodotbuild) |
| Content Collections Guide | [docs.astro.build/en/guides/content-collections](https://docs.astro.build/en/guides/content-collections/) |
| View Transitions Guide | [docs.astro.build/en/guides/view-transitions](https://docs.astro.build/en/guides/view-transitions/) |
| Islands Architecture | [docs.astro.build/en/concepts/islands](https://docs.astro.build/en/concepts/islands/) |

---

## Iteration Cycle

```
1. Write content (Markdown/MDX)
2. Preview locally (npm run dev)
3. Commit & push (auto-deploys)
4. Check Lighthouse score (should be 100/100)
5. Repeat
```

### Weekly Rhythm

- **Monday**: Write one long-form post (draft)
- **Wednesday**: Edit and publish
- **Friday**: 2-3 micro-posts (quick thoughts, links)
- **Weekend**: Read, research, collect ideas for next week

---

*Cross-references: [Architecture](design/architecture.md) · [Feature Reference](design/features.md) · [Future Plans](future/roadmap.md) · [Deferred Features](future/deferred-features.md) · [Deployment](future/deployment.md) · [README](../README.md)*

# 🏗️ Architecture & Design Decisions

> Why Astro, why this structure, and how every piece fits together.

---

## Why Astro?

| Requirement | Astro's Answer |
|-------------|---------------|
| 100/100 Lighthouse | Zero JS shipped by default. Static HTML. |
| Dark mode | CSS custom properties + `<ViewTransitions />` persists state |
| Markdown blogging | Content Collections with TypeScript schema validation |
| SEO | Static HTML = crawlable. Built-in sitemap + RSS. |
| Image optimization | `astro:assets` → Sharp → WebP/AVIF at build time |
| Interactive components | Islands Architecture new_texthydrate only what needs JS |
| SPA-like navigation | View Transitions API new_textno framework, native browser |
| MDX | Embed React/Svelte components inside blog posts |
| Fast builds | Vite under the hood. Incremental builds. |
| Future SSR | Flip one config flag. Same codebase. |

### Why NOT Next.js / Gatsby / Hugo?

| Framework | Why Not |
|-----------|---------|
| Next.js | Ships React runtime (~80KB). Overkill for a blog. |
| Gatsby | GraphQL complexity. Slow builds. Plugin hell. |
| Hugo | Fast but Go templates are painful. No component model. |
| 11ty | Great but no built-in image optimization or TypeScript schemas. |
| WordPress | PHP. Plugins. Security. Performance. No. |

**Astro gives us**: Static output (like Hugo) + Component model (like React) + Zero JS (unlike Next) + TypeScript safety (unlike 11ty).

---

## Core Astro Features Used

### 1. Content Collections

```
src/content/
├── blog/          # Long-form posts (.md/.mdx)
└── micro/         # Short-form updates (.md)
```

**Why**: Type-safe frontmatter. If you forget a `title` or misspell `category`, the build fails new_textnot the user's browser.

```typescript
// content.config.ts new_textschema enforces structure
schema: z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  category: z.string().default('software-engineering'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
})
```

→ See: [Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/)

### 2. View Transitions

```astro
<!-- In BaseHead.astro -->
<ViewTransitions />
```

**Why**: SPA-like page transitions (fade, slide) without shipping a router or framework. The browser's native View Transitions API handles it. Pages feel instant.

**How it works**: Astro intercepts link clicks, fetches the next page, diffs the DOM, and animates the transition new_textall with zero client JS bundle.

→ See: [Astro View Transitions Docs](https://docs.astro.build/en/guides/view-transitions/)

### 3. Islands Architecture

```astro
<!-- Only this component gets hydrated. Rest is static HTML. -->
<SearchBar client:visible />
<DarkModeToggle client:load />
```

**Why**: A blog is 95% static content. Only interactive widgets (search, toggles, comments) need JavaScript. Islands let you hydrate just those pieces.

**Directives**:
- `client:load` new_textHydrate immediately (dark mode toggle)
- `client:visible` new_textHydrate when scrolled into view (comments, search)
- `client:idle` new_textHydrate when browser is idle (analytics)
- `client:media` new_textHydrate on media query match (mobile menu)

→ See: [Astro Islands Docs](https://docs.astro.build/en/concepts/islands/)

### 4. Image Optimization (`astro:assets`)

```astro
import { Image } from 'astro:assets';
<Image src={heroImage} width={960} height={480} alt={title} />
```

**What happens at build time**:
1. Sharp processes the image
2. Converts to WebP (and AVIF if configured)
3. Generates multiple sizes for `srcset`
4. Adds `width`/`height` attributes (prevents CLS)
5. Lazy-loads by default

**Result**: Perfect CLS score. Optimal file sizes. No runtime processing.

→ See: [Astro Image Docs](https://docs.astro.build/en/guides/images/)

### 5. MDX Integration

```mdx
---
title: "Interactive Post"
---

import Chart from '../../components/Chart.astro';

Here's a regular paragraph.

<Chart data={[1, 2, 3, 4, 5]} client:visible />

And back to regular Markdown.
```

**Why**: Embed interactive components (charts, code playgrounds, polls) directly in blog posts without leaving Markdown.

→ See: [Astro MDX Docs](https://docs.astro.build/en/guides/integrations-guide/mdx/)

### 6. Prefetching

```javascript
// astro.config.mjs
prefetch: {
  prefetchAll: true,
  defaultStrategy: 'viewport',
}
```

**Why**: Links in the viewport are prefetched automatically. When the user clicks, the page is already cached. Feels instant.

---

## Design System

### Typography

- **Font**: Atkinson Hyperlegible (local, no external requests)
- **Why**: Designed for readability. Distinguishes similar characters (Il1, O0). Perfect for code-adjacent content.
- **Loading**: `display: swap` + preload. Zero CLS.

### Color System

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#ffffff` | `#0f1117` |
| `--text` | `#1a1a2e` | `#e4e4e7` |
| `--accent` | `#1a73e8` | `#60a5fa` |
| `--border` | `#e5e7eb` | `#27272a` |

Dark mode: CSS custom properties + `data-theme` attribute + localStorage persistence + system preference detection.

### Layout

- **Max content width**: 720px (prose), 1200px (container)
- **Mobile breakpoint**: 768px
- **Spacing scale**: 0.25rem increments (4px base)
- **Border radius**: 8px (cards), 12px (images), 100px (pills)

### Components

| Component | Purpose | JS Required? |
|-----------|---------|-------------|
| Header | Navigation, dark mode toggle | Minimal (toggle only) |
| Footer | Links, copyright | No |
| PostCard | Blog post preview | No |
| FormattedDate | Date formatting | No |
| BaseHead | SEO, meta, View Transitions | No (declarative) |

---

## File Structure Rationale

```
src/
├── components/       # Reusable, composable UI pieces
├── content/          # Content Collections (type-safe)
│   ├── blog/         # Long-form (schema: title, desc, date, category, tags)
│   └── micro/        # Short-form (schema: date, tags)
├── layouts/          # Page wrappers (BlogPost layout)
├── pages/            # File-based routing (each .astro = a route)
├── styles/           # Global CSS (no CSS-in-JS, no Tailwind)
└── consts.ts         # Single source of truth for site config
```

**Why no Tailwind?** 
- Adds build complexity
- Utility classes bloat HTML
- For a blog, semantic CSS is more maintainable
- Fewer dependencies = fewer security updates
- Pure CSS achieves 100/100 Lighthouse without a framework

**Why `consts.ts`?**
- Change site title, categories, projects in ONE file
- TypeScript ensures type safety across all pages
- No magic strings scattered across components

---

## Performance Budget

| Metric | Target | How |
|--------|--------|-----|
| FCP | < 1.0s | Static HTML, local fonts, no render-blocking JS |
| LCP | < 1.5s | Optimized hero images, preloaded fonts |
| CLS | 0 | Explicit image dimensions, font-display: swap |
| TBT | 0ms | Zero client-side JS (except dark mode toggle) |
| TTI | < 1.0s | Nothing to hydrate on most pages |

---

*Cross-references: [Feature Reference](./features.md) · [Future Plans](../future/roadmap.md) · [Deferred Features](../future/deferred-features.md) · [Deployment](../future/deployment.md) · [Getting Started](../getting-started.md) · [README](../../README.md)*

# 🧩 Feature Reference new_textAstro Features in Use

> Every Astro feature leveraged in this blog, how it's implemented, and why.

---

## 1. Content Collections (Type-Safe Content)

**What**: Astro's built-in system for managing structured content with TypeScript schema validation.

**Where implemented**: 
- Schema: [`src/content.config.ts`](../../src/content.config.ts)
- Blog posts: `src/content/blog/*.md` / `*.mdx`
- Micro posts: `src/content/micro/*.md`

**How it works**:
```typescript
// content.config.ts
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: z.optional(image()),  // ← validated image reference
    category: z.string().default('software-engineering'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});
```

**Why this matters**:
- If you forget a `title` or misspell `category`, the **build fails** new_textnot the user's browser
- TypeScript autocompletion for frontmatter fields
- Image references are validated at build time
- Default values reduce boilerplate in every post

**Astro docs**: [Content Collections](https://docs.astro.build/en/guides/content-collections/)

---

## 2. View Transitions API (SPA-like Navigation)

**What**: Native browser View Transitions for seamless page navigation without a JavaScript framework.

**Where implemented**: [`src/components/BaseHead.astro`](../../src/components/BaseHead.astro)

**How it works**:
```astro
import { ViewTransitions } from 'astro:transitions';
<!-- One line. That's it. -->
<ViewTransitions />
```

**What happens under the hood**:
1. User clicks a link
2. Astro intercepts the click (no full page reload)
3. Fetches the next page in the background
4. Diffs the DOM between current and next page
5. Animates the transition using the browser's View Transitions API
6. Updates the URL and history

**Why this matters**:
- SPA-like feel without shipping React/Vue/Svelte router (~0KB client JS for navigation)
- Dark mode state persists across navigations (no flash)
- Scroll position handled automatically
- Prefetched pages feel instant

**Astro docs**: [View Transitions](https://docs.astro.build/en/guides/view-transitions/)

---

## 3. Islands Architecture (Partial Hydration)

**What**: Render pages as static HTML, hydrate only interactive components ("islands") with JavaScript.

**Where implemented**:
- Search component: [`src/components/Search.astro`](../../src/components/Search.astro) new_texthydrated in Header
- Dark mode toggle: [`src/components/Header.astro`](../../src/components/Header.astro) new_textinline script
- Table of Contents: [`src/components/TableOfContents.astro`](../../src/components/TableOfContents.astro) new_textscroll observer

**Hydration directives used**:
| Directive | Used For | Behavior |
|-----------|----------|----------|
| `client:load` | Dark mode toggle | Hydrate immediately on page load |
| `client:visible` | Search, ToC | Hydrate when scrolled into viewport |
| `client:idle` | (Future: analytics) | Hydrate when browser is idle |

**Why this matters**:
- A blog is 95% static content new_textno reason to ship a full framework
- Only ~2KB of JS for search + dark mode toggle
- Each island is independent new_textone failing doesn't break the page
- Lighthouse TBT (Total Blocking Time) stays at 0ms for most pages

**Astro docs**: [Islands Architecture](https://docs.astro.build/en/concepts/islands/)

---

## 4. Image Optimization (`astro:assets`)

**What**: Build-time image processing via Sharp new_textconverts, resizes, and optimizes images automatically.

**Where implemented**:
- Blog post hero images: [`src/layouts/BlogPost.astro`](../../src/layouts/BlogPost.astro)
- Config: [`astro.config.mjs`](../../astro.config.mjs) → `image.service`

**How it works**:
```astro
import { Image } from 'astro:assets';
<Image width={960} height={480} src={heroImage} alt={title} />
```

**What happens at build time**:
1. Sharp processes the source image
2. Converts to WebP (smaller, widely supported)
3. Generates `width` and `height` attributes (prevents CLS)
4. Adds `loading="lazy"` for below-fold images
5. Outputs optimized file to `dist/`

**Why this matters**:
- Perfect CLS (Cumulative Layout Shift) score new_textdimensions are known at build time
- 40-70% smaller file sizes vs unoptimized JPEG/PNG
- No runtime processing new_textall done at build
- No external image CDN needed (Cloudinary, imgix, etc.)

**Astro docs**: [Images](https://docs.astro.build/en/guides/images/)

---

## 5. MDX Integration

**What**: Write Markdown with embedded JSX components new_textinteractive content inside blog posts.

**Where implemented**:
- Config: [`astro.config.mjs`](../../astro.config.mjs) → `integrations: [mdx()]`
- Example post: [`src/content/blog/using-mdx.mdx`](../../src/content/blog/using-mdx.mdx)

**How it works**:
```mdx
---
title: "Interactive Post"
---
import Chart from '../../components/Chart.astro';

Regular Markdown paragraph.

<Chart data={[1, 2, 3]} client:visible />

Back to regular Markdown.
```

**Why this matters**:
- Embed interactive charts, code playgrounds, polls directly in posts
- Components are Islands new_textonly hydrated when needed
- Full Markdown syntax still works (no compromise)
- Import any Astro, React, Vue, or Svelte component

**Astro docs**: [MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/)

---

## 6. Prefetching

**What**: Automatically prefetch links in the viewport for instant navigation.

**Where implemented**: [`astro.config.mjs`](../../astro.config.mjs)

```javascript
prefetch: {
  prefetchAll: true,
  defaultStrategy: 'viewport',
}
```

**How it works**:
1. Astro observes which links are in the viewport
2. Prefetches those pages in the background (low priority)
3. When user clicks, the page is already in browser cache
4. Combined with View Transitions → feels instant

**Why this matters**:
- Zero perceived latency for navigation
- No wasted bandwidth (only prefetches visible links)
- Works with View Transitions for seamless experience

---

## 7. Local Fonts (Zero CLS)

**What**: Self-hosted fonts loaded via Astro's font system new_textno external requests, no layout shift.

**Where implemented**: [`astro.config.mjs`](../../astro.config.mjs) → `fonts` config

```javascript
fonts: [{
  provider: fontProviders.local(),
  name: 'Atkinson',
  cssVariable: '--font-atkinson',
  options: {
    variants: [
      { src: ['./src/assets/fonts/atkinson-regular.woff'], weight: 400, display: 'swap' },
      { src: ['./src/assets/fonts/atkinson-bold.woff'], weight: 700, display: 'swap' },
    ],
  },
}]
```

**Why Atkinson Hyperlegible**:
- Designed for readability (distinguishes Il1, O0)
- Perfect for code-adjacent content
- Open source, no licensing issues
- Small file size (.woff format)

---

## 8. Sitemap & RSS

**What**: Auto-generated sitemap.xml and RSS feed for SEO and syndication.

**Where implemented**:
- Sitemap: `@astrojs/sitemap` integration (auto-generates from pages)
- RSS: [`src/pages/rss.xml.js`](../../src/pages/rss.xml.js)

**Why this matters**:
- Search engines discover all pages via sitemap
- RSS readers can subscribe to your blog
- Both generated at build time new_textzero runtime cost

---

## 9. Search (Client-Side Island)

**What**: Fuzzy search over all blog posts, loaded as an Astro Island.

**Where implemented**:
- Component: [`src/components/Search.astro`](../../src/components/Search.astro)
- Index endpoint: [`src/pages/search-index.json.ts`](../../src/pages/search-index.json.ts)

**How it works**:
1. A JSON endpoint generates a search index at build time
2. The Search component lazy-loads the index on first focus
3. Client-side fuzzy matching (no server needed)
4. Keyboard shortcut: `⌘K` / `Ctrl+K`

**Why not Pagefind?**:
- Pagefind is better for 100+ posts (generates a WASM-based index)
- For < 50 posts, a simple JSON index + client-side filter is lighter
- Can upgrade to Pagefind later without changing the UI

---

## 10. Table of Contents (Auto-Generated)

**What**: Automatically extracts headings from blog posts and renders a navigable ToC.

**Where implemented**:
- Component: [`src/components/TableOfContents.astro`](../../src/components/TableOfContents.astro)
- Used in: [`src/layouts/BlogPost.astro`](../../src/layouts/BlogPost.astro)

**How it works**:
1. Astro's `render()` function returns `headings` array from Markdown
2. ToC component filters to h2/h3 depth
3. IntersectionObserver highlights the active section on scroll
4. Only shown for posts with 3+ headings

---

## 11. Related Posts (Tag/Category Scoring)

**What**: Shows relevant posts at the bottom of each article.

**Where implemented**: [`src/components/RelatedPosts.astro`](../../src/components/RelatedPosts.astro)

**Scoring algorithm**:
- Category match: +2 points
- Each overlapping tag: +1 point
- Shows top 3 by score
- Excludes current post

**Why this matters**:
- Increases time on site
- Helps readers discover related content
- Fully static new_textcomputed at build time, no client JS

---

*Cross-references: [Architecture](./architecture.md) · [Future Plans](../future/roadmap.md) · [Getting Started](../getting-started.md)*

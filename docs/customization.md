# Customization Guide

How to fork this blog and make it yours without touching the Astro component architecture.

---

## Step 1: Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/blog.git
cd blog
npm install
npm run dev
```

---

## Step 2: Replace Site Identity

Edit `src/consts.ts` this single file controls everything personal:

```typescript
// Change these immediately
export const SITE_TITLE = "Your Name's Blog";
export const SITE_DESCRIPTION = 'Your one-line pitch.';
export const SITE_AUTHOR = 'Your Name';
export const SITE_TAGLINE = 'Your Tagline';
export const SITE_BIO = 'Your bio paragraph for the homepage.';
```

### Social Links

```typescript
export const SOCIAL_LINKS = {
  github: 'https://github.com/your-username',
  linkedin: 'https://www.linkedin.com/in/your-profile/',
  twitter: 'https://x.com/your-handle',
  // Remove any you don't use
  rss: '/rss.xml',
} as const;
```

### Navigation

```typescript
export const NAV_LINKS = [
  { href: '/posts', label: 'Articles' },
  { href: '/about', label: 'About' },
  // Add or remove as needed
] as const;
```

---

## Step 3: Replace Content

### Delete existing posts

```bash
rm src/content/blog/*.md
rm src/content/micro/*.md
```

### Write your first post

```bash
cat > src/content/blog/hello-world.md << 'EOF'
---
title: "Hello World"
description: "First post on my new blog."
pubDate: 2024-07-01
category: "software-engineering"
tags: ["meta"]
draft: false
---

Your content here.
EOF
```

---

## Step 4: Customize Categories

Edit the `CATEGORIES` array in `src/consts.ts`. Add, remove, or rename:

```typescript
export const CATEGORIES = [
  'your-category-1',
  'your-category-2',
  'micro',  // keep if you want short-form posts
] as const;
```

Then update `CATEGORY_LABELS`, `CATEGORY_DESCRIPTIONS`, and `CATEGORY_ICONS` to match.

Everything auto-generates: category pages, filter nav, concepts grid.

---

## Step 5: Customize Colors

Edit `src/styles/global.css`:

```css
:root {
  /* Dark theme (default) */
  --accent: #10b981;          /* Change this to your brand color */
  --accent-hover: #34d399;
  --accent-dim: rgba(16, 185, 129, 0.1);
  --bg: #0a0a0f;              /* Background */
  --text: #e4e4e7;            /* Primary text */
}

[data-theme="light"] {
  --accent: #059669;          /* Light mode accent */
  --bg: #ffffff;
  --text: #1a1a2e;
}
```

### Fonts

Replace the `.woff` files in `public/fonts/` with your font, then update:

```css
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/your-font-regular.woff') format('woff');
  font-weight: 400;
}
```

And update the CSS variable:

```css
:root {
  --font-body: 'YourFont', system-ui, sans-serif;
}
```

---

## Step 6: Customize Projects Page

Replace the `PROJECTS` array in `src/consts.ts`:

```typescript
export const PROJECTS: Project[] = [
  {
    title: 'My Project',
    description: 'What it does.',
    url: 'https://github.com/you/project',
    docs: 'https://you.github.io/project/',  // optional
    tags: ['python', 'cli'],
    category: 'tools',
  },
];
```

Adjust `PROJECT_CATEGORY_LABELS` to match your groupings.

---

## Step 7: Update Deployment

### astro.config.mjs

```javascript
export default defineConfig({
  site: 'https://your-site.pages.dev',  // Your Cloudflare Pages URL
  base: '/',
  // ... rest stays the same
});
```

### robots.txt

Update the sitemap URL in `public/robots.txt`:

```
Sitemap: https://your-site.pages.dev/sitemap-index.xml
```

---

## Step 8: Deploy

1. Push to GitHub
2. Connect repo to Cloudflare Pages (project name = your desired subdomain)
3. Build: `npm run build`, output: `dist`, env: `NODE_VERSION=22`
4. Live at `your-project.pages.dev`

---

## What You Get Out of the Box

| Feature | Works Without Code Changes |
|---------|---------------------------|
| Dark/light mode | ✅ Toggle in header |
| Search (⌘K) | ✅ Searches all posts |
| Table of Contents | ✅ Auto-generates for posts with 3+ headings |
| Related Posts | ✅ Scored by category + tag overlap |
| RSS feed | ✅ At `/rss.xml` |
| Sitemap | ✅ At `/sitemap-index.xml` |
| SEO (OpenGraph, Twitter cards) | ✅ From frontmatter |
| Category archive pages | ✅ Auto-generated from CATEGORIES |
| Mobile responsive | ✅ Hamburger menu, touch targets |
| Security headers | ✅ Via `public/_headers` |
| AI crawler blocking | ✅ Via `public/robots.txt` |
| View Transitions (SPA feel) | ✅ Zero config |
| Prefetching | ✅ Viewport-based |
| Image optimization | ✅ Sharp at build time |
| Syntax highlighting | ✅ Shiki (GitHub theme) |

---

## What NOT to Change (Unless You Know What You're Doing)

| File | Why |
|------|-----|
| `src/content.config.ts` | Schema validation breaking it breaks all posts |
| `src/components/BaseHead.astro` | SEO, meta tags, structured data |
| `src/pages/posts/[...slug].astro` | Dynamic routing for blog posts |
| `src/pages/posts/category/[category].astro` | Dynamic category pages |
| `astro.config.mjs` (integrations) | MDX, sitemap, sharp all load-bearing |

---

## File Ownership Summary

| What to Customize | Where |
|-------------------|-------|
| All personal identity | `src/consts.ts` |
| Colors and typography | `src/styles/global.css` |
| Fonts | `public/fonts/` + CSS |
| Favicon | `public/favicon.svg` + `public/favicon.ico` |
| Content | `src/content/blog/*.md` |
| Pages (add/remove) | `src/pages/*.astro` + NAV_LINKS |
| Security/caching | `public/_headers` |
| SEO/crawlers | `public/robots.txt` |
| Deploy config | `astro.config.mjs` (site URL) |

# Gaurav's Engineering Blog Documentation

Developer documentation for the blog at [gauravagarwal.pages.dev](https://gauravagarwal.pages.dev).

---

## Quick Links

| Page | What It Covers |
|------|---------------|
| [Getting Started](getting-started.md) | Local dev setup, Node 22, build & preview |
| [Customization](customization.md) | Fork this blog and make it yours (colors, content, identity) |
| [Adding Content](adding-content.md) | New articles, categories, projects, tags |
| [Deployment](deployment.md) | Cloudflare Pages deploy pipeline |
| [Architecture](design/architecture.md) | Why Astro, design system, file structure |
| [Features](design/features.md) | Every Astro feature in use |
| [Style Guide](design/style-guide.md) | Writing voice, formatting, content standards |
| [Roadmap](future/roadmap.md) | What's built, what's next |
| [Deferred Features](future/deferred-features.md) | What we intentionally don't add and why |

---

## Deployment Architecture

```
Blog Site (Astro)          →  Cloudflare Pages  →  gauravagarwal.pages.dev
Docs (MkDocs Material)     →  GitHub Pages      →  gauravagarwalgarg.github.io/blog/
```

Both deploy automatically on `git push` to main.

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Blog framework | Astro 6 (static, zero JS) |
| Blog hosting | Cloudflare Pages (free, global CDN) |
| Docs framework | MkDocs Material |
| Docs hosting | GitHub Pages (free) |
| Content | Markdown / MDX |
| Styling | Vanilla CSS (no Tailwind) |
| Fonts | Atkinson Hyperlegible (local) |
| CI/CD | GitHub Actions (docs) + Cloudflare auto-build (blog) |

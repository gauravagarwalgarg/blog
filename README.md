# 📝 Blog

[![CI](https://github.com/gauravagarwalgarg/blog/actions/workflows/ci.yml/badge.svg)](https://github.com/gauravagarwalgarg/blog/actions/workflows/ci.yml) [![Docs](https://img.shields.io/badge/docs-live-blue?logo=github)](https://gauravagarwalgarg.github.io/blog/) ![MkDocs](https://img.shields.io/badge/MkDocs-Material-blue?logo=materialformkdocs&logoColor=white) [![License](https://img.shields.io/github/license/gauravagarwalgarg/blog)](https://github.com/gauravagarwalgarg/blog/blob/main/LICENSE)

> 📖 **Documentation**: [https://gauravagarwalgarg.github.io/blog/](https://gauravagarwalgarg.github.io/blog/)
>
> 📦 **Repository**: [GitHub](https://github.com/gauravagarwalgarg/blog)


> A curated blog covering software engineering, emerging technology, aerospace, health-tech, startups, economics, infrastructure, history, and culinary adventures.

**Live**: [gauravagarwalgarg.github.io/Blog](https://gauravagarwalgarg.github.io/Blog)

---

## ✨ Features

- 🌙 Dark mode (system preference + toggle)
- 📱 Mobile-first, responsive design
- ⚡ 100/100 Lighthouse performance target
- 🔍 SEO: canonical URLs, OpenGraph, Twitter cards
- 📡 RSS feed + Sitemap
- ✍️ Markdown & MDX support
- 🎨 Syntax highlighting (Shiki)
- 🖼️ Image optimization (Sharp)
- 📑 Table of contents (via MDX)
- 🏷️ Category filtering
- � Micro-blogging (short-form posts)
- 🚀 Static deploy via GitHub Pages (future: self-hosted dynamic)

---

## 🏗️ Tech Stack

| Layer | Tool |
|-------|------|
| Framework | [Astro 6](https://astro.build/) |
| Content | Markdown / MDX |
| Styling | Vanilla CSS (no framework overhead) |
| Fonts | Atkinson Hyperlegible (local, no CLS) |
| Images | Sharp (build-time optimization) |
| Deploy | GitHub Actions → GitHub Pages |
| Future | Docker + Caddy/Nginx (self-hosted) |

---

## 📂 Structure

```
src/
├── components/       # Reusable UI (Header, Footer, PostCard, etc.)
├── content/
│   ├── blog/         # Long-form posts (Markdown/MDX)
│   └── micro/        # Short-form micro-posts
├── layouts/          # Page layouts (BlogPost)
├── pages/            # Routes (index, blog, projects, about)
├── styles/           # Global CSS (dark mode, typography)
└── consts.ts         # Site config, categories, projects, nav
```

---

## 🚀 Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # Production build
npm run preview   # Preview production build
```

---

## ✍️ Writing a Post

Create `src/content/blog/my-post.md`:

```markdown
---
title: "My Post Title"
description: "A brief description for SEO and cards."
pubDate: 2024-06-15
category: "software-engineering"
tags: ["rust", "systems", "performance"]
draft: false
---

Your content here. Supports full Markdown + code blocks.
```

### Categories

`software-engineering` · `emerging-tech` · `aerospace` · `health-tech` · `startups` · `economics` · `infrastructure` · `history` · `culinary` · `micro`

---

## 🐳 Future: Self-Hosted Dynamic Deployment

When ready to move off GitHub Pages:

```dockerfile
# Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

```yaml
# docker-compose.yml
services:
  blog:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./certs:/etc/nginx/certs
    restart: unless-stopped
```

Switch Astro to SSR mode when needed:
```js
// astro.config.mjs
output: 'server',
adapter: node({ mode: 'standalone' }),
```

---

## 📋 Design Principles

1. **Content-first** No visual noise. Words and code are the product.
2. **Performance** No JS frameworks on the client. Static HTML + minimal CSS.
3. **Accessible** Semantic HTML, proper contrast, keyboard navigable.
4. **Progressive** Works without JS. Dark mode via CSS + localStorage.
5. **Portable** Static output. Deploy anywhere (Pages, S3, Nginx, Caddy).

---

*Inspired by [Firebase Blog](https://firebase.blog/), [Astrofy](https://astrofy-template.netlify.app/), and [OpenBlog](https://astro.build/themes/details/openblog/).*

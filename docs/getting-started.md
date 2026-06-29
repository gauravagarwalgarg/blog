# Getting Started

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 22.12.0 | `nvm install 22` |
| npm | ≥ 10 | Comes with Node |
| Git | Any | System package manager |

```bash
# Verify
node --version   # v22.x.x
npm --version    # 10.x.x
```

## Local Development

```bash
git clone https://github.com/GauravAgarwalGarg/Blog.git
cd Blog
npm install
npm run dev
```

Open `http://localhost:4321`. Hot-reload active save any file and the browser updates.

## Production Build (Local Preview)

```bash
npm run build      # Outputs static site to ./dist
npm run preview    # Serve ./dist locally for testing
```

Verify everything works at `http://localhost:4321` before deploying.

## Deploy to Cloudflare Workers

The blog deploys as a static asset Worker on Cloudflare's edge network.

### First-Time Setup

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create
3. Connect your GitHub repo (`gauravagarwalgarg/Blog`)
4. Configure:

| Setting | Value |
|---------|-------|
| Project name | `blog` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Path | `/` |
| Environment variable | `NODE_VERSION` = `22` |

5. Deploy site goes live at `blog.<account>.workers.dev`

### How It Works

```
Push to GitHub → Cloudflare detects change → npm run build (Node 22)
→ npx wrangler deploy → Static assets served from 300+ edge PoPs
```

The `wrangler.toml` in the repo root tells Wrangler to serve `./dist` as static assets:

```toml
name = "blog"
compatibility_date = "2024-12-01"
[assets]
directory = "./dist"
```

### Custom Domain (Optional)

1. Cloudflare Dashboard → your Worker → Settings → Custom Domains
2. Add your domain (must be on Cloudflare DNS)
3. HTTPS is automatic

## Project Structure

```
src/
├── components/       # Header, Footer, Search, ToC, PostCard
├── content/
│   ├── blog/         # Long-form technical articles (Markdown)
│   └── micro/        # Short-form posts
├── layouts/          # BlogPost layout
├── pages/            # Routes (Articles, Concepts, Projects, Essays, Summary, About)
├── styles/           # global.css (dark-first, no framework)
└── consts.ts         # Site config, nav, categories, projects
```

## Writing a Post

Create `src/content/blog/my-post.md`:

```markdown
---
title: "Descriptive Title Here"
description: "One-line hook for SEO and social cards (< 160 chars)."
pubDate: 2024-06-15
category: "software-engineering"
tags: ["distributed-systems", "architecture"]
draft: false
---

Content starts here. No intro fluff state the thesis immediately.
```

## Available Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Dev server at localhost:4321 |
| `npm run build` | Production build to `./dist` |
| `npm run preview` | Preview production build locally |

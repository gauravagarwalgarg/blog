# Getting Started

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 22.12.0 | `nvm install 22` |
| npm | ≥ 10 | Comes with Node |
| Git | Any | System package manager |

```bash
# Install nvm (one-time)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm in current session (required after fresh install)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node 22
nvm install 22
nvm use 22

# Verify
node --version   # v22.x.x
npm --version    # 10.x.x
```

> Future terminals will auto-load nvm from `~/.bashrc`. Only the current session needs the manual `export` + source.

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

## Deploy to Cloudflare Pages

See [Deployment Guide](deployment.md) for full setup instructions.

Quick version:
1. Push to GitHub
2. Cloudflare Dashboard → Pages → Connect repo
3. Build: `npm run build`, output: `dist`, env: `NODE_VERSION=22`
4. Live at `your-project.pages.dev`

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

# Deployment Guide

## Architecture

```
Push to GitHub → Cloudflare Pages detects change → Builds with Node 22
→ Deploys static assets to 300+ edge locations → Live in ~30 seconds
```

**Live URL**: `https://gauravagarwalgarg.pages.dev`

---

## Step 1: Local Testing (Do This First)

### Install Node 22

```bash
# Install nvm (one-time)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm in current session (required after fresh install)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node 22
nvm install 22
nvm use 22
node --version  # Must show v22.x.x
```

> Future terminals auto-load nvm from `~/.bashrc`. Only the current session needs the manual `export` + source.

### Build and Preview

```bash
cd ~/Projects/GauravAgarwalGarg/blog
npm install
npm run build
npm run preview
```

Open `http://localhost:4321` verify:
- [ ] Homepage renders with dark theme
- [ ] Navigation works (Articles, Concepts, Projects, Essays, Summary, About)
- [ ] Blog posts render with syntax highlighting
- [ ] Search works (Cmd+K)
- [ ] Dark/light mode toggle works
- [ ] Mobile menu works (resize browser to <768px)
- [ ] Projects page GitHub and Docs links clickable separately

---

## Step 2: Commit and Push

```bash
git add -A
git commit -m "your commit message"
git push origin feature/first-blog-page-with-astro
```

---

## Step 3: Cloudflare Pages Setup (First Time Only)

### 3.1 Create Pages Project

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** tab
2. Connect your GitHub account
3. Select repository: `gauravagarwalgarg/blog`
4. **Project name**: `gauravagarwalgarg` (this becomes `gauravagarwalgarg.pages.dev`)

### 3.2 Build Configuration

| Field | Value |
|-------|-------|
| Production branch | `main` (or `feature/first-blog-page-with-astro`) |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |

### 3.3 Environment Variables

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `22` |

### 3.4 Deploy

Click **Save and Deploy**. Cloudflare will:
1. Clone your repo
2. Run `npm install`
3. Run `npm run build` (outputs to `./dist`)
4. Serve `./dist` at the edge

Live at: **`https://gauravagarwalgarg.pages.dev`**

---

## Step 4: Verify Production

- [ ] Site loads at `https://gauravagarwalgarg.pages.dev`
- [ ] CSS and fonts load properly
- [ ] All pages accessible
- [ ] RSS feed at `/rss.xml`
- [ ] Sitemap at `/sitemap-index.xml`

---

## How Auto-Deploy Works

After initial setup, every `git push` to the production branch triggers:

```
git push → GitHub webhook → Cloudflare builds → Deploy to edge
```

No CI/CD config needed on your side. Cloudflare handles the entire pipeline.

### Preview Deployments

Every push to a non-production branch creates a preview at a unique URL (e.g., `abc123.gauravagarwalgarg.pages.dev`). Useful for reviewing before merging.

---

## Custom Domain (Future When Ready to Pay)

1. Buy domain from Cloudflare Registrar (~$12/year for `.dev`)
2. Dashboard → Pages → your project → **Custom domains** → Add
3. HTTPS automatic, zero config
4. Update `site` in `astro.config.mjs`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails "Node.js not supported" | Add env var `NODE_VERSION=22` |
| Site loads but no CSS | Verify `base: '/'` in astro.config.mjs |
| 404 on subpages | Check `Build output directory` is set to `dist` |
| Old content showing | Wait 60s or purge cache in dashboard |
| Fonts not loading | Paths should be `/fonts/...` (no prefix) |

---

## Rollback

Dashboard → Pages → Deployments → find last good deploy → **Rollback**

Or `git revert` + push auto-deploys the fix.

---

## Delete Old Workers Deployment

If you previously deployed to Workers (`blog.gauravagarwalgarg.workers.dev`):
1. Dashboard → Workers & Pages → select the `blog` worker
2. Settings → Delete

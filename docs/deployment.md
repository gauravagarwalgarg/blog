# Deployment Guide

## Architecture

```
Push to GitHub → Cloudflare detects change → Builds with Node 22
→ Deploys static assets to 300+ edge locations → Live in ~30 seconds
```

---

## Step 1: Local Testing (Do This First)

### Install Node 22

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm in your current session (required don't skip this)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node 22
nvm install 22
nvm use 22
node --version  # Must show v22.x.x
```

> **Note**: The install script adds nvm to `~/.bashrc` so future terminals load it automatically. But your *current* session needs the `export` + source lines above to activate nvm without reopening the terminal.

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
- [ ] Projects page links are clickable (GitHub + Docs separately)

If build fails, check the error usually a TypeScript import mismatch or missing frontmatter field.

---

## Step 2: Commit and Push

```bash
git add -A
git commit -m "feat: cloudflare deploy, updated projects, new content categories"
git push origin main
```

---

## Step 3: Cloudflare Workers Setup (First Time Only)

### 3.1 Create the Worker

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create**
3. Connect to your GitHub account
4. Select repository: `gauravagarwalgarg/blog`

### 3.2 Configure Build Settings

| Field | Value |
|-------|-------|
| Project name | `blog` |
| Production branch | `main` (or `feature/first-blog-page-with-astro` for now) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

### 3.3 Environment Variables

Add under **Settings → Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_VERSION` | `22` | Required Astro 6 needs Node ≥22 |

### 3.4 Deploy

Click **Save and Deploy**. Cloudflare will:
1. Clone your repo
2. Run `npm install`
3. Run `npm run build` (outputs to `./dist`)
4. Run `npx wrangler deploy` (serves `./dist` as static assets)

Your site goes live at: `blog.<your-subdomain>.workers.dev`

---

## Step 4: Verify Production

After first deploy, check:
- [ ] Site loads at the Workers URL
- [ ] CSS/fonts load (not unstyled)
- [ ] All pages accessible
- [ ] Social links work
- [ ] RSS feed works at `/rss.xml`

---

## Step 5: Custom Domain (Optional)

1. Dashboard → your Worker → **Settings** → **Domains & Routes**
2. Add custom domain (must be on Cloudflare DNS)
3. HTTPS is automatic no cert management needed
4. Update `site` in `astro.config.mjs` to your custom domain

---

## How Auto-Deploy Works

After initial setup, every `git push` to the configured branch triggers:

```
git push → GitHub webhook → Cloudflare build → Deploy
```

No CI/CD yaml needed on your side. Cloudflare handles the pipeline.

### Deploy Previews (Non-Production Branches)

If "Builds for non-production branches" is enabled, pushing to any branch creates a preview deploy at a unique URL. Useful for reviewing changes before merging to main.

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Build fails with "Node.js not supported" | NODE_VERSION not set | Add env var `NODE_VERSION=22` |
| Site loads but no CSS | Base path mismatch | Verify `base: '/'` in astro.config.mjs |
| 404 on pages | wrangler.toml missing or wrong | Ensure `[assets] directory = "./dist"` |
| Fonts not loading | Wrong font paths in CSS | Should be `/fonts/...` not `/blog/fonts/...` |
| Deploy succeeds but old content shows | CDN cache | Wait 60s or purge cache in dashboard |

---

## File Reference

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Site URL, base path, integrations |
| `wrangler.toml` | Cloudflare Workers static asset config |
| `public/_headers` | Security headers (X-Frame-Options, etc.) |
| `public/robots.txt` | Search engine and AI crawler rules |
| `.github/workflows/deploy.yml` | GitHub Pages fallback (manual trigger only) |

---

## Rollback

If a bad deploy goes out:
1. Dashboard → your Worker → **Deployments**
2. Find the last good deployment
3. Click **Rollback to this deployment**

Or just `git revert` and push Cloudflare auto-deploys the fix.

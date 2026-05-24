# 🚀 Deployment Guide & Cost Analysis

> How to deploy, maintain, and scale this blog new_textfrom free to self-hosted.

---

## Current Setup: GitHub Pages (Free)

```
Push to main → GitHub Actions → Astro Build → Deploy to Pages
```

**Workflow**: [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)

| Metric | Value |
|--------|-------|
| Cost | $0 |
| Build time | ~30s |
| CDN | GitHub's CDN (Fastly) |
| Custom domain | Supported (free) |
| HTTPS | Automatic (Let's Encrypt) |
| Bandwidth | 100GB/month (soft limit) |
| Build minutes | 2000/month (free tier) |

**Limitations**:
- Static only (no server-side rendering)
- No custom response headers
- No edge functions
- Rate-limited API (1000 requests/hour for Actions)
- Single region (no global edge)

**Best for**: Personal blogs with < 100K monthly pageviews.

---

## Option 2: Cloudflare Pages (Free, Better CDN)

```
Push to main → Cloudflare builds → Deploy to 300+ edge locations
```

**Migration steps**:
1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

| Metric | Value |
|--------|-------|
| Cost | $0 |
| Build time | ~20s |
| CDN | 300+ PoPs globally |
| Custom domain | Supported (free) |
| HTTPS | Automatic |
| Bandwidth | Unlimited |
| Builds | 500/month (free), unlimited (paid $20/mo) |

**Gains over GitHub Pages**:
- Faster globally (edge network)
- Custom headers (`_headers` file)
- Redirects (`_redirects` file)
- Edge functions (Workers) if needed later
- Web Analytics (free, privacy-friendly)

**Best for**: Blogs wanting better global performance without cost.

---

## Option 3: Vercel (Free Tier)

```
Push to main → Vercel builds → Deploy to edge
```

| Metric | Value |
|--------|-------|
| Cost | $0 (hobby) / $20/mo (pro) |
| Bandwidth | 100GB/month (free) |
| Builds | Unlimited |
| Edge functions | Supported |
| Analytics | $0 (basic) |

**When to choose**: If you want serverless functions or ISR (Incremental Static Regeneration) later.

---

## Option 4: Self-Hosted VPS (Full Control)

```
Push to main → CI builds Docker image → Deploy to VPS
```

### Architecture

```
┌─────────────────────────────────────────┐
│  Caddy (reverse proxy + auto-HTTPS)     │
├─────────────────────────────────────────┤
│  Astro (static files served by Caddy)   │
│  OR Astro SSR (Node.js standalone)      │
├─────────────────────────────────────────┤
│  Docker Compose                         │
├─────────────────────────────────────────┤
│  VPS (Hetzner / DigitalOcean / Oracle)  │
└─────────────────────────────────────────┘
```

### Static Deployment (Current)

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
```

```
# Caddyfile
blog.yourdomain.dev {
    root * /srv
    file_server
    encode gzip zstd

    # SPA fallback for View Transitions
    try_files {path} {path}/ /index.html

    # Cache static assets aggressively
    @static path *.js *.css *.woff *.woff2 *.webp *.avif *.jpg *.png *.svg
    header @static Cache-Control "public, max-age=31536000, immutable"

    # Security headers
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }
}
```

### SSR Deployment (Future)

When you need server-side features:

```javascript
// astro.config.mjs
import node from '@astrojs/node';

export default defineConfig({
  output: 'hybrid',  // Static by default, SSR for specific routes
  adapter: node({ mode: 'standalone' }),
});
```

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json .
ENV HOST=0.0.0.0 PORT=4321
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
```

---

## Cost Comparison

### Free Tier Options

| Provider | Cost | Bandwidth | Builds | Global CDN |
|----------|------|-----------|--------|-----------|
| GitHub Pages | $0 | 100GB/mo | 2000 min/mo | ❌ (single region) |
| Cloudflare Pages | $0 | Unlimited | 500/mo | ✅ (300+ PoPs) |
| Vercel | $0 | 100GB/mo | Unlimited | ✅ |
| Netlify | $0 | 100GB/mo | 300 min/mo | ✅ |

### Self-Hosted Options

| Provider | Monthly | Specs | Notes |
|----------|---------|-------|-------|
| Hetzner CX22 | €4.50 | 2 vCPU, 4GB RAM, 40GB SSD | Best value in EU |
| DigitalOcean Basic | $6 | 1 vCPU, 1GB RAM, 25GB SSD | Good docs, US/EU |
| Oracle Cloud Free | $0 | 4 OCPU, 24GB RAM (ARM) | Free forever (if available) |
| Fly.io | $0-5 | 3 shared VMs free | Good for containers |
| Railway | $5 | Usage-based | Easy Docker deploys |

### Total Cost Scenarios

| Scenario | Annual Cost |
|----------|-------------|
| GitHub Pages + custom domain | $12/year |
| Cloudflare Pages + domain | $12/year |
| Hetzner VPS + domain + backups | ~$80/year |
| VPS + Plausible + Newsletter | ~$280/year |
| Oracle Free + domain | $12/year |

---

## Maintenance Checklist

### Weekly
- [ ] Check GitHub Actions for failed builds
- [ ] Review Lighthouse scores (should stay 100/100)

### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Check for Astro major version updates
- [ ] Review analytics (if enabled)
- [ ] Backup content (git handles this)

### Quarterly
- [ ] Audit dependencies for vulnerabilities (`npm audit`)
- [ ] Review and prune unused images in `src/assets/`
- [ ] Check broken links
- [ ] Review SEO (Search Console)

### Yearly
- [ ] Renew domain
- [ ] Review hosting costs vs alternatives
- [ ] Consider feature additions from [deferred list](./deferred-features.md)

---

## Recommended Path

```
Phase 1 (Now):     GitHub Pages new_text$0, zero maintenance
Phase 2 (Growth):  Cloudflare Pages new_text$0, better CDN, analytics
Phase 3 (Dynamic): Hetzner VPS + Docker new_text€6/mo, full control
```

**Don't move to Phase 2 until**: You want custom headers, redirects, or global edge performance.

**Don't move to Phase 3 until**: You need SSR, API routes, or server-side features.

---

*Cross-references: [Roadmap](./roadmap.md) · [Deferred Features](./deferred-features.md) · [Architecture](../design/architecture.md)*

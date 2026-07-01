# Roadmap

What's built, what's next, and cost estimates for scaling.

---

## Deployment Architecture

| What | Where | Trigger | Cost |
|------|-------|---------|------|
| Blog (Astro) | Cloudflare Pages → `gauravagarwal.pages.dev` | Auto on push | $0 |
| Docs (MkDocs Material) | GitHub Pages → `gauravagarwalgarg.github.io/blog/` | Auto on push (docs/) | $0 |

---

## ✅ Implemented

| Feature | Location | Added |
|---------|----------|-------|
| Dark/Light mode toggle | `Header.astro` | v1 |
| Content Collections (type-safe) | `content.config.ts` | v1 |
| View Transitions (SPA-like nav) | `BaseHead.astro` | v1 |
| Client-side search (⌘K) | `Search.astro` + `search-index.json.ts` | v1 |
| Table of Contents (auto-generated) | `TableOfContents.astro` | v1 |
| Related Posts (tag/category scoring) | `RelatedPosts.astro` | v1 |
| Reading Time estimation | `BlogPost.astro` | v1 |
| Image optimization (Sharp) | `astro.config.mjs` | v1 |
| RSS feed | `rss.xml.js` | v1 |
| Sitemap | `@astrojs/sitemap` | v1 |
| Category filtering + archive pages | `[category].astro` | v1 |
| Micro-blogging | `content/micro/` | v1 |
| Mobile-responsive (hamburger menu) | All components | v1 |
| Prefetching | `astro.config.mjs` | v1 |
| MDX support | `@astrojs/mdx` | v1 |
| SEO (OpenGraph, Twitter cards, JSON-LD) | `BaseHead.astro` | v1 |
| Security headers | `public/_headers` | v2 |
| AI crawler blocking | `public/robots.txt` | v2 |
| Cloudflare Pages deploy | Auto on push | v2 |
| MkDocs docs site | GitHub Pages | v2 |
| Monthly Summary page | `summary.astro` | v2 |
| Essays section | `essays.astro` | v2 |

---

## 🔜 Next Up

| Feature | Trigger | Approach | Effort |
|---------|---------|----------|--------|
| Comments (Giscus) | Posts get regular traffic | GitHub Discussions, `client:visible` | 1 hour |
| Newsletter | 3 months consistent publishing | Buttondown free tier | 30 min |
| Analytics | Need data decisions | Plausible or self-hosted Umami | 15 min |
| Pagefind upgrade | 50+ posts | Replace JSON search with WASM index | 2 hours |
| Custom domain | After 1 year habit | `gauravagarwalgarg.dev` via Cloudflare | 10 min |

---

## 💰 Cost Estimates

### Current (Phase 1 $0/year)

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare Pages | $0 | Unlimited bandwidth, 500 builds/month |
| GitHub Pages (docs) | $0 | MkDocs hosting |
| GitHub repo | $0 | Source code + CI/CD |
| **Total** | **$0** | |

### Growth (Phase 2 ~$12/year)

| Service | Cost | Notes |
|---------|------|-------|
| Custom domain (.dev) | $12/year | Via Cloudflare Registrar |
| Cloudflare Pages | $0 | Still free |
| **Total** | **~$12/year** | |

### Full Stack (Phase 3 ~$120–280/year)

| Service | Cost | Notes |
|---------|------|-------|
| Domain | $12/year | |
| Plausible Analytics | $9/month | Or Umami self-hosted for $0 |
| Buttondown Newsletter | $0–9/month | Free up to 100 subs |
| **Total** | **$120–280/year** | |

### Self-Hosted Dynamic (Phase 4 ~$80/year)

For when SSR, API routes, or full control is needed:

| Service | Cost | Notes |
|---------|------|-------|
| Hetzner CX22 VPS | €4.50/month | 2 vCPU, 4GB RAM, 40GB NVMe |
| Domain | $12/year | |
| Backups | €1.50/month | Hetzner snapshots |
| **Total** | **~$80/year** | |

**Architecture** (Phase 4):
```
┌─────────────────────────────────────────┐
│  Caddy (reverse proxy + auto-HTTPS)     │
├─────────────────────────────────────────┤
│  Astro SSR (Node.js standalone)         │
├─────────────────────────────────────────┤
│  Docker Compose                         │
├─────────────────────────────────────────┤
│  VPS (Hetzner CX22)                     │
└─────────────────────────────────────────┘
```

**Astro SSR config** (when ready):
```javascript
import node from '@astrojs/node';
export default defineConfig({
  output: 'hybrid',  // Static default, SSR for specific routes
  adapter: node({ mode: 'standalone' }),
});
```

**Dockerfile**:
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

**docker-compose.yml**:
```yaml
services:
  blog:
    build: .
    restart: unless-stopped
    environment:
      - HOST=0.0.0.0
      - PORT=4321

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - blog

volumes:
  caddy_data:
```

**Caddyfile**:
```
blog.yourdomain.dev {
    reverse_proxy blog:4321
    encode gzip zstd
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

---

## Alternative Free Hosting (If Cloudflare Changes)

| Provider | Cost | Notes |
|----------|------|-------|
| Vercel | $0 (hobby) | 100GB bandwidth, edge functions |
| Netlify | $0 (starter) | 100GB bandwidth, forms |
| Render | $0 (static) | Auto-deploy from Git |
| Fly.io | $0 (3 VMs) | Container-native, scale-to-zero |
| Oracle Cloud Free | $0 forever | 4 OCPU, 24GB RAM (if available) |

---

## Maintenance Cadence

### Monthly
- `npm update` keep dependencies fresh
- Check Lighthouse scores (target: 100/100)
- Review build logs for warnings

### Quarterly
- `npm audit` security check
- Prune unused images in `src/assets/`
- Check for Astro major version updates

### If Self-Hosted (Phase 4)
- `apt update && apt upgrade` OS patches
- Check disk usage
- Verify backups running
- Renew domain (annual)

---

## When to Move Off Cloudflare Pages

Move when you need ANY of:
- Server-side rendering (personalization, auth)
- API routes (contact form, newsletter signup backend)
- Edge functions (A/B testing, geo-routing)
- WebSocket connections (live updates)
- Custom response headers beyond `_headers` file

**Until then**: Cloudflare Pages is free, fast, and zero-maintenance. Don't over-engineer.

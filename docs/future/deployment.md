# 🚀 Deployment Guide new_textCheapest to Best

> Self-hosting options ranked from free to premium, with clear tradeoffs.

---

## TL;DR new_textPick Your Tier

| Tier | Provider | Monthly Cost | Best For |
|------|----------|-------------|----------|
| 🆓 Free | GitHub Pages | $0 | Starting out, zero maintenance |
| 🆓 Free+ | Cloudflare Pages | $0 | Better CDN, custom headers |
| 🆓 Free+ | Vercel | $0 | Edge functions, analytics |
| 💰 Budget | Oracle Cloud Free | $0 | Full VPS control (if available) |
| 💰 Budget | Fly.io | $0-5/mo | Container-native, global |
| 💰 Value | Hetzner CX22 | €4.50/mo | Best price/performance in EU |
| 💰 Value | DigitalOcean | $6/mo | Good docs, US/EU regions |
| 💰 Pro | Railway | $5-20/mo | Zero-config Docker deploys |
| 💰 Pro | Render | $7-25/mo | Managed, auto-scaling |

---

## Tier 1: Free Static Hosting (Current)

### GitHub Pages ⭐ Current Setup

```
Push to main → GitHub Actions → Astro Build → Deploy to Pages
```

| Metric | Value |
|--------|-------|
| Cost | **$0** |
| CDN | GitHub's CDN (Fastly, single region) |
| Custom domain | ✅ Free |
| HTTPS | ✅ Automatic |
| Bandwidth | 100GB/month |
| Build minutes | 2000/month |
| Deploy time | ~45s |

**Limitations**: Static only, no custom headers, no edge functions, single region.

**Verdict**: Perfect for starting. Don't move until you have a reason.

---

### Cloudflare Pages ⭐ Recommended Upgrade

```
Push to main → Cloudflare builds → Deploy to 300+ edge locations
```

| Metric | Value |
|--------|-------|
| Cost | **$0** |
| CDN | 300+ PoPs globally |
| Custom domain | ✅ Free |
| Bandwidth | **Unlimited** |
| Builds | 500/month (free) |
| Deploy time | ~20s |
| Web Analytics | ✅ Free, privacy-friendly |

**Migration** (5 minutes):
1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub repo
3. Build command: `npm run build`
4. Output directory: `dist`
5. Done

**Gains over GitHub Pages**:
- 10x faster globally (edge network)
- Custom headers via `_headers` file
- Redirects via `_redirects` file
- Free web analytics (no JS, server-side)
- Edge functions (Workers) when needed

**Verdict**: Best free option. Move here when you want speed + analytics.

---

### Vercel

| Metric | Value |
|--------|-------|
| Cost | **$0** (hobby) / $20/mo (pro) |
| CDN | Global edge |
| Bandwidth | 100GB/month (free) |
| Builds | Unlimited |
| Edge functions | ✅ |
| Analytics | ✅ Basic free |

**When to choose**: If you want serverless functions or ISR later.

**Verdict**: Good but Cloudflare is better for pure static (unlimited bandwidth).

---

## Tier 2: Free VPS (Full Control)

### Oracle Cloud Free Tier

| Metric | Value |
|--------|-------|
| Cost | **$0 forever** |
| Specs | 4 OCPU, 24GB RAM (ARM Ampere) |
| Storage | 200GB |
| Bandwidth | 10TB/month |
| Region | Limited availability |

**Catch**: Instances are hard to get (high demand). You may need to retry for weeks.

**Setup**: Docker + Caddy (see Tier 3 setup below).

**Verdict**: Unbeatable if you can get an instance. Full VPS for $0.

---

### Fly.io

| Metric | Value |
|--------|-------|
| Cost | **$0-5/mo** |
| Specs | 3 shared VMs free (256MB each) |
| Global | ✅ Deploy to multiple regions |
| Docker | ✅ Native |
| Auto-scaling | ✅ Scale to zero |

**Deploy**:
```bash
fly launch    # One-time setup
fly deploy    # Push updates
```

**Verdict**: Great for containers. Scale-to-zero means you only pay when there's traffic.

---

## Tier 3: Budget VPS (Self-Hosted)

### Hetzner CX22 ⭐ Best Value

| Metric | Value |
|--------|-------|
| Cost | **€4.50/month** (~$5) |
| Specs | 2 vCPU, 4GB RAM, 40GB NVMe |
| Bandwidth | 20TB/month |
| Location | Germany, Finland, US |
| Backups | +€1.50/month |

**Why Hetzner**: Cheapest quality VPS in Europe. German data privacy. NVMe storage. Excellent uptime.

### DigitalOcean Basic

| Metric | Value |
|--------|-------|
| Cost | **$6/month** |
| Specs | 1 vCPU, 1GB RAM, 25GB SSD |
| Bandwidth | 1TB/month |
| Location | US, EU, Asia |

**Why DO**: Better docs, more regions, $200 free credit for new accounts.

---

### Self-Hosted Architecture

```
┌─────────────────────────────────────────┐
│  Caddy (reverse proxy + auto-HTTPS)     │
├─────────────────────────────────────────┤
│  Astro Static (served by Caddy)         │
│  OR Astro SSR (Node.js)                 │
├─────────────────────────────────────────┤
│  Docker Compose                         │
├─────────────────────────────────────────┤
│  VPS (Hetzner / DO / Oracle)            │
└─────────────────────────────────────────┘
```

### Static Deploy (Recommended)

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

    @static path *.js *.css *.woff *.woff2 *.webp *.avif *.jpg *.png *.svg
    header @static Cache-Control "public, max-age=31536000, immutable"

    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
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
      - caddy_data:/data
    restart: unless-stopped

volumes:
  caddy_data:
```

### SSR Deploy (When Dynamic Needed)

```javascript
// astro.config.mjs new_textflip to SSR
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

## Tier 4: Managed / Pro

### Railway

| Metric | Value |
|--------|-------|
| Cost | **$5/mo** + usage |
| Deploy | Push to deploy (Docker or Nixpacks) |
| Scaling | Auto |
| Databases | ✅ Postgres, Redis, MySQL |

**When**: You want managed infra without managing servers.

### Render

| Metric | Value |
|--------|-------|
| Cost | **$7/mo** (static free, services $7+) |
| Deploy | Git push |
| Auto-scaling | ✅ |
| Managed TLS | ✅ |

---

## Cost Summary (Annual)

| Setup | Annual Cost | What You Get |
|-------|-------------|-------------|
| GitHub Pages | **$0** | Static, single region |
| GitHub Pages + domain | **$12** | Custom domain |
| Cloudflare Pages + domain | **$12** | Global CDN, unlimited BW |
| Oracle Free + domain | **$12** | Full VPS, Docker, SSR |
| Fly.io + domain | **$12-72** | Global containers |
| Hetzner + domain + backups | **~$85** | Full control, EU privacy |
| Hetzner + analytics + newsletter | **~$280** | Full stack blog |

---

## Recommended Path

```
Phase 1 (Now):      GitHub Pages new_text$0, zero maintenance
                    ↓ (when you want speed + analytics)
Phase 2 (Growth):   Cloudflare Pages new_text$0, global CDN
                    ↓ (when you need SSR, API routes, or full control)
Phase 3 (Dynamic):  Hetzner VPS + Docker new_text€6/mo
```

**Rule of thumb**: Don't self-host until the free tier limits you. When it does, Hetzner + Caddy + Docker is the sweet spot for a personal blog.

---

## Maintenance Checklist

### Monthly
- [ ] `npm update` new_textkeep dependencies fresh
- [ ] Check Lighthouse scores (target: 100/100)
- [ ] Review build logs for warnings

### Quarterly
- [ ] `npm audit` new_textsecurity check
- [ ] Prune unused images in `src/assets/`
- [ ] Check for Astro major version updates

### If Self-Hosted
- [ ] `apt update && apt upgrade` new_textOS patches
- [ ] Check disk usage
- [ ] Verify backups are running
- [ ] Renew domain (annual)

---

*Cross-references: [Roadmap](./roadmap.md) · [Deferred Features](./deferred-features.md) · [Architecture](../design/architecture.md)*

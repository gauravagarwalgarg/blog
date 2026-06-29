# 🔮 Future Roadmap & Self-Hosting Plan

> Features intentionally deferred, deployment strategy, and cost estimation.

---

## Features Intentionally Not Added (Yet)

### 1. Search (Full-Text)

**Why deferred**: Static sites can't do server-side search. Client-side search (Pagefind, Fuse.js) adds JS weight.

**When to add**: When you have 30+ posts and category filtering isn't enough.

**Best approach**:
- [Pagefind](https://pagefind.app/) Runs at build time, generates a static search index. ~5KB client JS. No server needed.
- Add as an Astro Island: `<Search client:idle />`

**Estimated effort**: 2 hours.

---

### 2. Comments System

**Why deferred**: Adds external dependency and moderation overhead.

**When to add**: When posts get traffic and you want engagement.

**Best approach**:
- [Giscus](https://giscus.app/) GitHub Discussions-backed. Free. No database.
- Add as Island: `<Comments client:visible />`
- Alternative: [Utterances](https://utteranc.es/) (GitHub Issues-backed)

**Estimated effort**: 1 hour.

---

### 3. Newsletter / Email Subscription

**Why deferred**: Requires email service (cost) and GDPR compliance.

**When to add**: When you have consistent publishing cadence (weekly/biweekly).

**Best approach**:
- [Buttondown](https://buttondown.email/) Free up to 100 subscribers. Markdown-native.
- Or [Resend](https://resend.com/) + custom form (100 emails/day free)
- Embed form as static HTML (no Island needed)

**Cost**: Free → $9/month at scale.

---

### 4. Analytics

**Why deferred**: Privacy-first. No tracking by default.

**When to add**: When you want to know what resonates.

**Best approach**:
- [Plausible](https://plausible.io/) Privacy-friendly, GDPR-compliant, 1KB script
- Or [Umami](https://umami.is/) Self-hosted, free, open source
- Add as `<script>` in BaseHead (no Island needed)

**Cost**: Plausible $9/month. Umami self-hosted = free.

---

### 5. Table of Contents (Auto-Generated)

**Why deferred**: Needs rehype plugin or custom component.

**When to add**: When posts exceed 2000 words regularly.

**Best approach**:
```bash
npm install rehype-toc rehype-slug
```
```javascript
// astro.config.mjs
markdown: {
  rehypePlugins: [rehypeSlug, rehypeToc],
}
```

**Estimated effort**: 30 minutes.

---

### 6. Reading Time Estimation

**Why deferred**: Nice-to-have, not critical.

**Best approach**:
```typescript
// In content.config.ts or a utility
const wordsPerMinute = 200;
const readingTime = Math.ceil(content.split(/\s+/).length / wordsPerMinute);
```

**Estimated effort**: 15 minutes.

---

### 7. Related Posts

**Why deferred**: Needs enough posts to be meaningful.

**When to add**: When you have 15+ posts.

**Best approach**: Match by category + tags. Sort by overlap count. Show 3 at bottom of each post.

---

## 🐳 Self-Hosting Strategy

### Phase 1: Current (GitHub Pages Free)

```
Push to main → GitHub Actions → Build → Deploy to Pages
```

**Cost**: $0
**Limitations**: Static only. No server-side features. No custom headers. Rate-limited.

### Phase 2: Static + CDN (Cloudflare Pages Free)

```
Push to main → Cloudflare builds → Deploy to edge (300+ PoPs)
```

**Cost**: $0 (free tier: unlimited bandwidth, 500 builds/month)
**Gains**: Faster globally, custom headers, redirects, edge functions if needed.
**Migration**: Change deploy target. Same static output.

### Phase 3: Self-Hosted Dynamic (VPS + Docker)

```
Push to main → CI builds Docker image → Deploy to VPS
```

**Architecture**:
```
┌─────────────────────────────────────────┐
│  Caddy (reverse proxy + auto-HTTPS)     │
├─────────────────────────────────────────┤
│  Astro SSR (Node.js standalone)         │
├─────────────────────────────────────────┤
│  Docker Compose                         │
├─────────────────────────────────────────┤
│  VPS (Hetzner / DigitalOcean / Oracle)  │
└─────────────────────────────────────────┘
```

**Dockerfile**:
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
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
blog.gauravagarwal.dev {
    reverse_proxy blog:4321
    encode gzip zstd
}
```

**Astro config change for SSR**:
```javascript
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',  // or 'hybrid' for mix of static + dynamic
  adapter: node({ mode: 'standalone' }),
});
```

---

## 💰 Cost Estimation

### Static (Current & Near-Future)

| Service | Cost | Notes |
|---------|------|-------|
| GitHub Pages | $0 | Current setup |
| Cloudflare Pages | $0 | Better CDN, same static |
| Domain (.dev) | $12/year | Optional |
| **Total** | **$0-12/year** | |

### Self-Hosted (When Dynamic Needed)

| Service | Cost | Notes |
|---------|------|-------|
| Hetzner VPS (CX22) | €4.5/month | 2 vCPU, 4GB RAM, 40GB SSD |
| Domain (.dev) | $12/year | |
| Backups | €1.5/month | Hetzner snapshots |
| **Total** | **~$80/year** | |

### Self-Hosted + Extras

| Service | Cost | Notes |
|---------|------|-------|
| VPS | €4.5/month | |
| Plausible Analytics | $9/month | Or self-host Umami for $0 |
| Buttondown Newsletter | $0-9/month | Free up to 100 subs |
| Domain | $12/year | |
| **Total** | **$80-280/year** | |

### Alternative: Oracle Cloud Free Tier

| Service | Cost | Notes |
|---------|------|-------|
| Oracle ARM VPS | $0 | 4 OCPU, 24GB RAM (free forever) |
| Domain | $12/year | |
| **Total** | **$12/year** | If you can get an instance (limited availability) |

---

## 🎯 When to Move Off GitHub Pages

Move when you need ANY of:
- Server-side rendering (personalization, auth)
- API routes (contact form, newsletter signup)
- Edge functions (A/B testing, geo-routing)
- Custom response headers (security, caching)
- WebSocket connections (live updates)

**Until then**: GitHub Pages is free, fast, and zero-maintenance. Don't over-engineer.

---

*Cross-references: [Architecture](../design/architecture.md) · [Feature Reference](../design/features.md) · [Deferred Features](./deferred-features.md) · [Deployment](./deployment.md) · [Getting Started](../getting-started.md) · [README](../../README.md)*

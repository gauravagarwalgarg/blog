# Deferred Features

Features intentionally not added yet. Each has a clear trigger, cost analysis, and implementation path for when the time comes.

---

## Decision Framework

Before adding any feature:

1. **Does it serve the reader?** Not just the author's ego.
2. **Does it justify its weight?** KB of JS, hours of maintenance.
3. **Can it be an Island?** Don't pollute the static shell.
4. **Is there a simpler alternative?** CSS > JS, static > dynamic.
5. **What's the maintenance cost?** Dependencies rot. Fewer = better.

---

## 1. Tailwind CSS

**Status**: Excluded

**Why not**:
- Adds build complexity (PostCSS pipeline, purging)
- Utility classes bloat HTML readability
- For a blog with ~20 components, semantic CSS is more maintainable
- Fewer dependencies = fewer security updates
- Pure CSS achieves 100/100 Lighthouse without a framework
- No learning curve for contributors

**Reconsider when**: Site grows to 50+ components with complex responsive layouts.

**If added**: `npx astro add tailwind` one command.

---

## 2. Comments System (Giscus/Utterances)

**Status**: Deferred

**Why not now**:
- Adds external dependency (GitHub API)
- Requires moderation time
- Low-traffic blogs get spam, not engagement
- Adds ~30KB client JS (Giscus iframe)

**Trigger**: Posts consistently get 500+ views and readers ask for discussion.

**Implementation**:
```astro
<!-- Add as Island in BlogPost.astro -->
<Giscus
  client:visible
  repo="gauravagarwalgarg/blog"
  repoId="..."
  category="Blog Comments"
  categoryId="..."
  mapping="pathname"
  theme="preferred_color_scheme"
/>
```

**Estimated effort**: 1 hour (including GitHub Discussions setup).

**Cost**: $0 (GitHub Discussions is free).

---

## 3. Newsletter / Email Subscription

**Status**: Deferred

**Why not now**:
- Requires email service (cost at scale)
- GDPR compliance (consent, unsubscribe, data deletion)
- Subscribers expect regular content don't start until cadence is proven

**Trigger**: After 3 months of consistent weekly publishing.

**Options**:

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| [Buttondown](https://buttondown.email/) | 100 subscribers | Markdown-native, simple |
| [Resend](https://resend.com/) | 100 emails/day | Custom transactional |
| [ConvertKit](https://convertkit.com/) | 1000 subscribers | Creator-focused |
| [Substack](https://substack.com/) | Unlimited | But hosts content externally |

**Best approach**: Buttondown embed as static HTML form (no Island needed, no client JS).

**Estimated cost**: Free → $9/month at scale.

---

## 4. Analytics

**Status**: Deferred (privacy-first default)

**Why not now**:
- No tracking by default is a feature, not a bug
- Most analytics are vanity metrics early on
- Adds external script (even if lightweight)

**Trigger**: Need data-driven content decisions (which topics resonate, where traffic comes from).

**Options**:

| Provider | Cost | Script Size | Privacy |
|----------|------|-------------|---------|
| [Plausible](https://plausible.io/) | $9/mo | 1KB | GDPR-compliant, no cookies |
| [Umami](https://umami.is/) | $0 (self-hosted) | 2KB | Open source, no cookies |
| [Fathom](https://usefathom.com/) | $14/mo | 1KB | Privacy-focused |
| Google Analytics | $0 | 45KB | Privacy nightmare, avoid |

**Best approach**: Plausible or self-hosted Umami. Add as `<script>` in BaseHead (no Island needed).

---

## 5. Pagefind (Full-Text Search Upgrade)

**Status**: Deferred current JSON search works for < 50 posts

**Why not now**:
- Current search (JSON index + fuzzy match) is ~0KB added JS (lazy-loaded)
- Pagefind adds WASM binary (~150KB) + build step
- Overkill for current content volume

**Trigger**: 50+ posts where simple search feels slow or inaccurate.

**Migration path**:
```bash
npm install pagefind
# Add to build script:
"build": "astro build && npx pagefind --site dist"
```
Replace `Search.astro` internals with Pagefind's API. UI stays the same.

**Estimated effort**: 2 hours.

---

## 6. CMS (Content Management System)

**Status**: Excluded

**Why not**:
- Git + Markdown IS the CMS
- No database to maintain
- No admin panel to secure
- VS Code + Astro extension = best editing experience
- Version control for free (git history)

**If ever needed**:

| CMS | Type | Notes |
|-----|------|-------|
| [Tina CMS](https://tina.io/) | Git-based | Visual editing, free tier |
| [Decap CMS](https://decapcms.org/) | Git-based | Open source, no server |
| [Sanity](https://www.sanity.io/) | Headless | Overkill for a blog |
| [Strapi](https://strapi.io/) | Headless | Requires hosting |

---

## 7. i18n (Internationalization)

**Status**: Not planned

**Why not**:
- Blog is English-only by design
- i18n adds routing complexity (`/en/blog/...`, `/hi/blog/...`)
- Translation maintenance is a full-time job
- Audience is global English-speaking developers

**Reconsider**: Never, unless pivoting to a non-English audience.

---

## 8. Authentication / Gated Content

**Status**: Not planned

**Why not**:
- Blog is public by default
- Gated content reduces reach and SEO
- Adds server-side complexity (sessions, tokens)
- Would require SSR mode (currently static)

**Reconsider**: If launching a paid course or premium content tier.

---

## 9. E-commerce / Payments

**Status**: Not planned

**Why not**:
- Blog is not a store
- Payment processing adds PCI compliance burden
- Would require SSR + database

**If ever needed**: [Stripe](https://stripe.com/) + Astro SSR + `@astrojs/node` adapter.

---

## 10. Dark Mode Toggle Animation

**Status**: Kept simple (instant swap)

**Why not animated**:
- CSS transitions on `background` already provide smooth feel
- Fancy sun/moon animations add complexity for minimal UX gain
- Current implementation: 0 bytes of animation JS

**If desired**: Add CSS `transition` on the SVG icons with `transform: rotate()`. ~10 lines of CSS.

---

## 11. View Transitions Customization

**Status**: Using defaults

**Why not custom**:
- Default fade transition works well for a blog
- Custom animations (slide, morph) add complexity
- Risk of motion sickness for users with `prefers-reduced-motion`

**If desired**: Add `transition:animate` directives per element in layouts.

---

## 12. PWA (Progressive Web App)

**Status**: Not planned

**Why not**:
- Blog is read-and-leave, not an app people install
- Service workers add caching complexity
- Offline reading is niche for a tech blog

**Reconsider**: If mobile readership exceeds 70% and users request offline access.

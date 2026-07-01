# Adding Content

Everything you need to add articles, categories, and topics without touching the Astro layout or component code.

---

## Adding a New Article

### 1. Create the file

```bash
touch src/content/blog/your-post-slug.md
```

Use lowercase, hyphenated slugs: `distributed-systems-primer.md`, `debugging-burnout.md`

### 2. Add frontmatter

```markdown
---
title: "Your Title Here"
description: "One-line hook for SEO (< 160 chars)."
pubDate: 2024-07-01
category: "software-engineering"
tags: ["relevant", "searchable", "tags"]
draft: false
---
```

### 3. Write content

Start with the thesis no intro fluff. Use H2/H3 for structure, code blocks for examples, tables for comparisons.

### 4. Preview locally

```bash
npm run dev
# Open http://localhost:4321/posts/your-post-slug/
```

### 5. Publish

```bash
git add src/content/blog/your-post-slug.md
git commit -m "feat: add post Your Title Here"
git push
```

Cloudflare auto-deploys on push. Live in ~30 seconds.

---

## Adding a New Category

Categories control the Concepts page grid, the filter nav on Articles, and the category archive pages. All managed in one file.

### Step 1: Add to the CATEGORIES array

Edit `src/consts.ts`:

```typescript
export const CATEGORIES = [
  'software-engineering',
  'embedded-systems',
  // ... existing categories
  'your-new-category',   // ← add here
  'micro',               // keep micro last
] as const;
```

### Step 2: Add a label

```typescript
export const CATEGORY_LABELS: Record<Category, string> = {
  // ... existing
  'your-new-category': 'Your New Category',
};
```

### Step 3: Add a description (optional but recommended)

```typescript
export const CATEGORY_DESCRIPTIONS: Partial<Record<Category, string>> = {
  // ... existing
  'your-new-category': 'One-line description for the Concepts page card.',
};
```

### Step 4: Add an icon code (optional)

```typescript
export const CATEGORY_ICONS: Partial<Record<Category, string>> = {
  // ... existing
  'your-new-category': 'NC',  // 2-letter code shown in the badge
};
```

### That's it.

No page creation needed. The following all auto-generate:
- `/posts/category/your-new-category` archive page (via `[category].astro`)
- Concepts page grid card (if posts exist in that category)
- Filter nav on Articles page
- Homepage "Browse by Category" section

---

## Adding Tags to a Post

Tags are free-form strings in the frontmatter array:

```markdown
tags: ["distributed-systems", "architecture", "consensus"]
```

**Guidelines:**
- Lowercase, hyphenated: `machine-learning` not `Machine Learning`
- 3–5 tags per post
- Reuse existing tags (check other posts) for better Related Posts matching
- Tags power: search results, related posts scoring, tag display on cards

No config change needed tags are extracted automatically.

---

## Adding a New Project

Edit the `PROJECTS` array in `src/consts.ts`:

```typescript
export const PROJECTS: Project[] = [
  // ... existing projects
  {
    title: 'My New Project',
    description: 'One-line description of what it does.',
    url: 'https://github.com/gauravagarwalgarg/my-project',
    docs: 'https://gauravagarwalgarg.github.io/my-project/',  // optional
    tags: ['python', 'cli', 'automation'],
    category: 'tools',  // must match a ProjectCategory
  },
];
```

**Available project categories:** `interview`, `languages`, `systems`, `tools`, `learning`, `apps`

To add a new project category, add it to:
1. `ProjectCategory` type union
2. `PROJECT_CATEGORY_LABELS` record

---

## Adding a Nav Link

Edit `NAV_LINKS` in `src/consts.ts`:

```typescript
export const NAV_LINKS = [
  { href: '/posts', label: 'Articles' },
  { href: '/concepts', label: 'Concepts' },
  // ... existing
  { href: '/new-page', label: 'New Page' },  // ← add here
] as const;
```

Then create the page at `src/pages/new-page.astro`. The header and footer nav update automatically.

---

## Content Workflow Summary

| Task | File to Edit | Pages Auto-Updated |
|------|-------------|-------------------|
| New article | Create `src/content/blog/slug.md` | Articles, Category, Homepage, Summary, Search, RSS |
| New category | `src/consts.ts` (4 places) | Concepts, Articles filter, Category archive |
| New project | `src/consts.ts` (PROJECTS array) | Projects page |
| New tag | Just add to post frontmatter | Search, Related Posts |
| New nav link | `src/consts.ts` (NAV_LINKS) + create page | Header, Footer, Mobile menu |

---

## Frontmatter Reference

| Field | Required | Default | Type | Description |
|-------|----------|---------|------|-------------|
| `title` | ✅ | | string | Post title |
| `description` | ✅ | | string | SEO description (< 160 chars) |
| `pubDate` | ✅ | | date | Publication date (YYYY-MM-DD) |
| `category` | ❌ | `software-engineering` | string | Must match a CATEGORIES entry |
| `tags` | ❌ | `[]` | string[] | Searchable tags |
| `draft` | ❌ | `false` | boolean | `true` = hidden from all listings |
| `heroImage` | ❌ | | image path | Hero image (auto-optimized by Sharp) |
| `updatedDate` | ❌ | | date | Last update date |
| `readingTime` | ❌ | | string | Override auto-calculated reading time |

---

## Draft Mode

Set `draft: true` to write without publishing:

```markdown
---
title: "Work in Progress"
draft: true
---
```

Draft posts are excluded from: listings, RSS, sitemap, search index, related posts. They still render at their URL for personal preview.

---

## Using MDX (Interactive Posts)

Rename to `.mdx` and import components:

```mdx
---
title: "Interactive Demo"
category: "software-engineering"
---
import MyComponent from '../../components/MyComponent.astro';

Regular markdown here.

<MyComponent client:visible />

Back to markdown.
```

---

## Quick Checklist Before Publishing

- [ ] Title is descriptive and specific (not clickbait)
- [ ] Description is < 160 chars and hooks the reader
- [ ] Category matches an existing entry in `CATEGORIES`
- [ ] Tags are lowercase, hyphenated, 3–5 per post
- [ ] `draft: false` (or removed)
- [ ] Content starts with thesis, not fluff
- [ ] Code blocks have language specified (```python, ```bash, etc.)
- [ ] Runs locally without errors (`npm run build`)

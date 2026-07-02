---
title: "Hello World: Why This Blog Exists"
description: "The case for engineers writing publicly what this blog covers, the tech stack choice (Astro + static Markdown), publishing philosophy (content-first, no tracking, ship static), and why writing is a career multiplier for technical professionals."
pubDate: 2026-01-15
category: 'software-engineering'
tags: ['meta', 'blog', 'writing']
draft: false
readingTime: '4 min'
---

Writing is thinking made visible. This blog exists because explaining a concept forces you to understand it at a level that "knowing" alone doesn't require. If you can't write a clear paragraph about how something works, you don't actually understand it you've only memorized it.

## The Case for Engineers Writing Publicly

Three compounding returns:

1. **Clarified thinking** the act of structuring an explanation reveals gaps in understanding. Every post I write exposes something I thought I knew but didn't.

2. **Compounding reference** a year from now, when I need to remember how SPI clock modes work, I'll read my own post. It's a personal documentation system that happens to be public.

3. **Career signal** writing demonstrates communication ability, depth of knowledge, and genuine interest. It's differentiation that compounds: 50 posts over 3 years shows sustained technical curiosity.

## What This Blog Covers

```
├── Software Engineering    architecture, design, infrastructure
├── Embedded Systems        RTOS, protocols, bare-metal, hardware
├── Aerospace               safety-critical, DO-178C, flight software
├── Machine Learning        from-scratch implementations, intuition
├── Personal Finance        index investing, tax optimization
├── History                 engineering achievements of past civilizations
├── Culinary                technique-driven cooking
├── Reviews                 tools and hardware I actually use
└── Creative                poems, short-form writing
```

Deliberately broad. Engineers are not monolithic we have interests outside our IDEs. The constraint is depth, not topic.

## The Stack

**Astro** a static site generator that ships zero client-side JavaScript by default. Content lives in Markdown files with YAML frontmatter. Build output is plain HTML and CSS.

Why Astro over alternatives:

| Framework | JS Shipped | Build Speed | Content Model |
|-----------|-----------|-------------|---------------|
| Astro | 0 KB (default) | Fast | Markdown-native |
| Next.js | 80+ KB | Medium | React-centric |
| Gatsby | 70+ KB | Slow | GraphQL overhead |
| Hugo | 0 KB | Fastest | Go templates |
| Jekyll | 0 KB | Slow | Ruby ecosystem |

Astro gives me Markdown-first content, component islands for any interactive elements (rare), and a modern DX without shipping a framework to readers.

## Publishing Philosophy

- **No tracking** no Google Analytics, no cookies, no fingerprinting. I don't need to know your screen resolution to write about backpropagation.
- **No ads** this blog costs ~$0/month (GitHub Pages). There's nothing to monetize.
- **Ship static** HTML files on a CDN. No server, no database, no attack surface. Page loads in <100ms.
- **Content-first** no "subscribe to my newsletter" popups, no dark patterns, no engagement hooks. The content is the interface.
- **Permissive sharing** if something here is useful, take it. Attribution is appreciated but not required.

## Publishing Cadence

One deep-dive per month, occasional micro-posts (short observations, links, one-paragraph thoughts). Quality over quantity. I'd rather publish 12 good posts per year than 52 mediocre ones.

## The First Post Problem

Every blog starts with a "hello world" post explaining why the blog exists. This is that post. It's also the last time I'll talk about the blog itself. From here: content only.

*Let's go.*

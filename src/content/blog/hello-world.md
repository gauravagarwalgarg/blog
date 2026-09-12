---
title: "Hello World: Why This Blog Exists"
description: "The case for engineers writing publicly, the tech stack choice (Astro), publishing philosophy (content-first, zero tracking), and why writing is an undeniable career multiplier."
pubDate: 2026-02-15
category: 'software-engineering'
tags: ['meta', 'blog', 'writing']
draft: false
readingTime: '4 min'
---

Writing is just thinking with a paper trail. I built this blog for a simple reason: explaining a concept brutally exposes what you actually don't know. 

Memorizing an API signature isn't understanding. If you can't write a coherent paragraph about how a system works under the hood, you are just pattern-matching. 

## The Case for Engineers Writing Publicly

Three compounding returns that aren't just hype:

1. **Clarified thinking:** The act of structuring an explanation reveals gaps. Every time I draft a post, I find some assumption I thought I knew but didn't.
2. **Personal reference architecture:** A year from now, when I'm debugging SPI clock modes at 2 AM, I'm going to read my own post. It's a personal documentation system. It just happens to be public.
3. **The career signal:** Writing proves communication ability, technical depth, and actual interest. It's differentiation that scales. Fifty posts over three years signals sustained curiosity in a way a resume bullet never will.

## What This Blog Covers

```text
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

It's deliberately broad. Engineers aren't monolithic—we have interests outside our IDEs. The constraint here is depth, not topic.

## The Stack (Because Engineers Always Ask)

**Astro.** It's a static site generator that ships zero client-side JavaScript by default. Content lives in Markdown files with YAML frontmatter. Build output is plain HTML and CSS.

Here is the tradeoff matrix for why I didn't pick something heavier:

| Framework | JS Shipped | Build Speed | Content Model |
|-----------|-----------|-------------|---------------|
| Astro | 0 KB (default) | Fast | Markdown-native |
| Next.js | 80+ KB | Medium | React-centric |
| Gatsby | 70+ KB | Slow | GraphQL overhead |
| Hugo | 0 KB | Fastest | Go templates |

Astro gives me Markdown-first content, component islands for the rare interactive element, and modern DX. No shipping an entire SPA framework to readers just to render text.

## Publishing Philosophy

- **Zero tracking:** No Google Analytics, no cookies, no fingerprinting. I don't need to know your screen resolution to explain backpropagation.
- **Zero ads:** This costs ~$0/month to host on GitHub Pages. There is literally nothing to monetize.
- **Ship static:** HTML files on a CDN. No server, no database, zero attack surface. Pages load in under 100ms.
- **Content-first:** No "subscribe to my newsletter" popovers. No engagement hooks. The content is the interface.
- **Permissive sharing:** If a code snippet here solves your bug, take it. Attribution is nice, but I'm not checking.

## The New Cadence

Starting in 2026, the strict rule is: **One post every Sunday.** 
I used to aim for monthly deep-dives, but consistency forces iteration. Not every post will be a 4,000-word magnum opus. Some will be raw human touchpoints, some will be deeply technical.

## The First Post Problem

Every engineering blog starts with a "hello world" post explaining the stack and why it exists. You are reading it. 
It is also the last time I will talk about the blog itself. 

From here: just the work.

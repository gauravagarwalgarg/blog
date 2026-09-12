# Cross-Posting Strategy & Implementation

This document outlines the step-by-step process required to enable automated cross-posting of blog articles from this repository to secondary platforms (Substack, Hashnode, Dev.to, Medium, Fediverse).

## Current Status
**Parked.** The automation workflow (`.github/workflows/crosspost.yml`) is currently inactive pending API integration setups.

## Implementation Steps

### 1. Hashnode
- **Requirements:** Hashnode Personal Access Token (PAT), Publication ID.
- **Workflow:** Use the Hashnode GraphQL API (`https://api.hashnode.com`) to post markdown content.
- **Action Items:**
  1. Generate PAT in Hashnode settings.
  2. Add `HASHNODE_PAT` and `HASHNODE_PUBLICATION_ID` to GitHub repository secrets.
  3. Implement a script (or use a GitHub action like `sinedied/publish-to-hashnode`) in `crosspost.yml`.

### 2. Dev.to (Forem)
- **Requirements:** Dev.to API Key.
- **Workflow:** Use the Forem REST API (`POST /api/articles`).
- **Action Items:**
  1. Generate API key in Dev.to extensions.
  2. Add `DEVTO_TOKEN` to GitHub secrets.
  3. Ensure markdown frontmatter includes required Forem fields (or map them during the script execution).

### 3. Medium
- **Requirements:** Medium Integration Token, User ID.
- **Workflow:** Use the Medium REST API (`POST /v1/users/{userId}/posts`).
- **Action Items:**
  1. Request an integration token from Medium settings.
  2. Fetch the Author ID.
  3. Add `MEDIUM_TOKEN` and `MEDIUM_USER_ID` to GitHub secrets.
  4. Ensure canonical URL is set pointing to `gauravagarwal.pages.dev` to avoid SEO penalty.

### 4. Substack
- **Requirements:** Substack does not have an official REST API for creating posts.
- **Workflow (Alternative):** 
  - Option A: Use a tool like Zapier/Make to watch the blog's RSS feed and create draft emails.
  - Option B: Use an unofficial Puppeteer/Playwright scraper script running in Actions to log in and create a post.
- **Action Items:**
  1. Set up an RSS feed specifically for the blog (Astro RSS integration is already active).
  2. Map the RSS feed to a Make.com webhook to auto-draft Substack posts.

### 5. Fediverse (Mastodon)
- **Requirements:** Mastodon instance API token.
- **Workflow:** Use the Mastodon API (`POST /api/v1/statuses`).
- **Action Items:**
  1. Create an app in the Mastodon instance to get an Access Token.
  2. Add `MASTODON_ACCESS_TOKEN` to GitHub secrets.
  3. Write a step to post a summary + link whenever a new article is pushed.

## Testing Strategy
Before fully enabling `crosspost.yml`, all API integrations must be tested in a separate branch using `workflow_dispatch` to push to "Draft" states where supported (Dev.to, Medium, Hashnode all support creating drafts via API).

---
name: Custom-domain trailing slashes
description: External hosting behavior that affects canonical URLs and sitemap entries.
---

The live custom domain normalizes directory-like public routes to trailing-slash URLs with a temporary redirect, such as `/sudoku` to `/sudoku/`.

**Why:** Canonical tags and sitemap entries that omit the slash point at redirecting URLs and create avoidable crawl inconsistency.

**How to apply:** Use trailing-slash URLs for public route canonicals, Open Graph URLs, JSON-LD URLs, sitemap entries, and prerendered internal links; keep the root URL as `/`.
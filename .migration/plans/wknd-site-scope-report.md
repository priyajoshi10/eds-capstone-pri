# WKND Per-Template Migration Plan

## Objective
Migrate **one representative page per template** (build and verify its block variants, parsers, transformers, and import script), then hand back a clear, repeatable way to **bulk-import all remaining URLs** in each template using that validated infrastructure.

## Context (from the site catalog)
Six templates, 65 URLs total. **home-landing** is already fully migrated. The remaining five each need one representative page migrated now; their other URLs are then bulk-import-ready.

| Template | URLs | Representative URL (migrate now) | Remaining to bulk-import |
|----------|-----:|----------------------------------|-------------------------:|
| home-landing | 12 | https://wknd.site/us/en.html | ✅ already all imported |
| adventure-detail | 32 | https://wknd.site/us/en/adventures/bali-surf-camp.html | 31 |
| article-detail | 12 | https://wknd.site/us/en/magazine/arctic-surfing.html | 11 |
| listing-profile-grid | 5 | https://wknd.site/us/en/about-us.html | 4 |
| adventure-listing | 2 | https://wknd.site/us/en/adventures.html | 1 |
| faq-page | 2 | https://wknd.site/us/en/faqs.html | 1 |

## Per-template workflow (one representative page each)
page analysis → block mapping → import infrastructure (parsers/transformers) → import script + bundle → **import the single representative page** → verify in preview. Bulk import of the rest is deferred to you (see "Bulk-import handoff").

## Checklist

### adventure-detail — migrate representative page
- [ ] Analyze `bali-surf-camp` (hero banner, attribute sidebar, tabbed content); create/reuse block variants
- [ ] Map DOM selectors into `page-templates.json`
- [ ] Generate parsers + transformers; generate & bundle `import-adventure-detail.js`
- [ ] Import the one representative page; verify structure in preview

### article-detail — migrate representative page
- [ ] Analyze `arctic-surfing` (hero image, byline, body w/ inline images, related-stories sidebar); create/reuse variants
- [ ] Map selectors → generate infrastructure → bundle `import-article-detail.js`
- [ ] Import the one representative page; verify

### listing-profile-grid — migrate representative page
- [ ] Analyze `about-us` (title + avatar/thumbnail card grids); create/reuse variants
- [ ] Map selectors → generate infrastructure → bundle `import-listing-profile-grid.js`
- [ ] Import the one representative page; verify

### adventure-listing — migrate representative page
- [ ] Analyze `adventures` (title, hero intro, filterable teaser-card grid); create/reuse variants
- [ ] Map selectors → generate infrastructure → bundle `import-adventure-listing.js`
- [ ] Import the one representative page; verify

### faq-page — migrate representative page
- [ ] Analyze `faqs` (intro + accordion + contact sidebar); create/reuse variants
- [ ] Map selectors → generate infrastructure → bundle `import-faq-page.js`
- [ ] Import the one representative page; verify

### Bulk-import handoff (documented, not executed now)
- [ ] Write per-template URL lists of the remaining URLs (`tools/importer/urls-<template>.txt`, excluding the already-migrated representative page)
- [ ] Provide the exact bulk-import command per template and a combined "import everything remaining" command
- [ ] Summarize which infrastructure each template's bulk import relies on

## Bulk-import handoff — how you'll import the rest
After each representative page is validated, every other URL in that template imports with the **same bundled script**, because parsers/transformers/mappings are template-wide. For each template you (or I, on request) run:

```
node <content-import-scripts>/run-bulk-import.js \
  --import-script tools/importer/import-<template>.bundle.js \
  --urls tools/importer/urls-<template>.txt
```

- `urls-<template>.txt` = that template's `urls[]` from `page-templates.json` (the representative page can stay in the list — it just re-imports harmlessly, or be omitted).
- Outputs `content/**.plain.html` for every URL plus a compiled report in `tools/importer/reports/`.
- To import the whole remaining site in one pass, run that command once per template (5 commands), or I can queue them sequentially.

## Notes
- Template-based mode: template discovery is skipped (catalog exists); each run starts at page analysis.
- Variants are reused across templates where they match (e.g. `cards-teaser`, `hero-adventure`), reducing new-variant work.
- Non-English locale pages are mostly "Coming Soon" stubs — expect lower completeness scores there (not defects).
- **Sequence:** adventure-detail → article-detail → listing-profile-grid → adventure-listing → faq-page.
- **Execution requires Execute mode.** On approval, I'll migrate the five representative pages, then give you the ready-to-run bulk-import commands (and run them too if you want).

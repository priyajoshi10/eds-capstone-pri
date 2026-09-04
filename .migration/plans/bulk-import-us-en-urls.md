# WKND Import Status — What's Done, What's Left

## Answer up front
**No — not all pages are imported yet.** Only **17 content pages** exist so far: the full **home-landing** set (12 locale homepages) plus the **5 representative pages** (one per remaining template). Everything else — including most of your 26-URL US/EN list — has **not** been imported yet.

## Current state (`content/**.plain.html` on disk)
**Imported (17 pages + nav + footer):**
- home-landing (12): `index`, `ca/en`, `ca/fr`, `ch/de`, `ch/fr`, `ch/it`, `de/de`, `es/es`, `fr/fr`, `it/it`, `us/en`, `us/es`
- adventure-detail (1): `us/en/adventures/bali-surf-camp`
- article-detail (1): `us/en/magazine/arctic-surfing`
- listing-profile-grid (1): `us/en/about-us`
- adventure-listing (1): `us/en/adventures`
- faq-page (1): `us/en/faqs`
- fragments: `nav`, `footer`

## Your 26-URL list: 6 done, 20 still to import
| Template | In your list | Imported | Left to import |
|----------|-------------:|---------:|---------------:|
| home-landing (`us/en.html`) | 1 | 1 | 0 |
| adventure-listing (`adventures.html`) | 1 | 1 | 0 |
| listing-profile-grid (`about-us`, `magazine`) | 2 | 1 | 1 (`us/en/magazine.html`) |
| faq-page (`faqs.html`) | 1 | 1 | 0 |
| adventure-detail (`/adventures/*`) | 16 | 1 | 15 |
| article-detail (`/magazine/<article>`) | 5 | 1 | 4 |
| **Total** | **26** | **6** | **20** |

## Checklist

### Import the 20 remaining US/EN pages (then upload all)
- [ ] adventure-detail: import the 15 remaining `/us/en/adventures/*` pages (all except bali-surf-camp) via `import-adventure-detail.bundle.js`
- [ ] article-detail: import the 4 remaining `/us/en/magazine/<article>` pages (guide-la-skateparks, san-diego-surf, ski-touring, western-australia) via `import-article-detail.bundle.js`
- [ ] listing-profile-grid: import `us/en/magazine.html` via `import-listing-profile-grid.bundle.js`
- [ ] Verify 26/26 US/EN pages now exist in `content/**.plain.html`, 0 failures

### Upload everything to DA (`priyajoshi10 / eds-capstone-pri`)
- [ ] Enumerate all `content/**.plain.html` (pages + `nav` + `footer`)
- [ ] POST each to `https://admin.da.live/source/priyajoshi10/eds-capstone-pri/<path>.html` (no auth header — credentials injected)
- [ ] Capture status per file; confirm 2xx (401/403 → DA opt-in off, pause and report)
- [ ] Report per-file upload summary

## Decision needed
I can proceed one of two ways once in Execute mode:
- **A — Import the 20 missing US/EN pages first, then upload all 26 + home-landing + fragments to DA** (complete US/EN site).
- **B — Upload only what's imported now** (the 17 pages + fragments) and leave the other 20 for later.

## Notes
- The other ~39 non-English locale URLs (mostly "Coming Soon" stubs) are out of scope for your 26-URL list; covered by `urls-<template>-remaining.txt` if you later want the full 65.
- Uploading to DA needs the DA/IMS opt-in in **Settings → LLM Permissions**; a 401/403 means it's off (no tokens in chat).
- **Execution requires Execute mode.** Tell me A or B (or approve to default to **A**), and on exit from plan mode I'll run it and report status.

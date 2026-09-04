# WKND Bulk-Import Handoff

One representative page per template has been migrated and verified. All parsers,
transformers, block mappings, and bundled import scripts are template-wide, so every
remaining URL imports with the **same bundled script** — no further per-page work.

## Scripts directory (resolve once)

```bash
CID=/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts
```

## Per-template bulk import

Each command imports that template's remaining URLs (representative page already imported).
Use `urls-<template>.txt` to (re-)import ALL of a template's URLs instead of the `-remaining` list.

```bash
# adventure-detail — 31 remaining (32 total)
node "$CID/run-bulk-import.js" \
  --import-script tools/importer/import-adventure-detail.bundle.js \
  --urls tools/importer/urls-adventure-detail-remaining.txt

# article-detail — 11 remaining (12 total)
node "$CID/run-bulk-import.js" \
  --import-script tools/importer/import-article-detail.bundle.js \
  --urls tools/importer/urls-article-detail-remaining.txt

# listing-profile-grid — 4 remaining (5 total)
node "$CID/run-bulk-import.js" \
  --import-script tools/importer/import-listing-profile-grid.bundle.js \
  --urls tools/importer/urls-listing-profile-grid-remaining.txt

# adventure-listing — 1 remaining (2 total)
node "$CID/run-bulk-import.js" \
  --import-script tools/importer/import-adventure-listing.bundle.js \
  --urls tools/importer/urls-adventure-listing-remaining.txt

# faq-page — 1 remaining (2 total)
node "$CID/run-bulk-import.js" \
  --import-script tools/importer/import-faq-page.bundle.js \
  --urls tools/importer/urls-faq-page-remaining.txt
```

## Import everything remaining in one pass

```bash
CID=/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts
for t in adventure-detail article-detail listing-profile-grid adventure-listing faq-page; do
  node "$CID/run-bulk-import.js" \
    --import-script "tools/importer/import-$t.bundle.js" \
    --urls "tools/importer/urls-$t-remaining.txt"
done
```

## What each template's bulk import relies on

| Template | Bundled script | Parsers used | Transformers |
|----------|----------------|--------------|--------------|
| adventure-detail | import-adventure-detail.bundle.js | carousel-hero, columns-attributes, tabs-adventure | wknd-cleanup, wknd-sections |
| article-detail | import-article-detail.bundle.js | cards-related (+ default content) | wknd-cleanup, wknd-sections |
| listing-profile-grid | import-listing-profile-grid.bundle.js | cards-profile | wknd-cleanup, wknd-sections |
| adventure-listing | import-adventure-listing.bundle.js | hero-adventure, tabs-adventure | wknd-cleanup, wknd-sections |
| faq-page | import-faq-page.bundle.js | accordion-faq (+ default content) | wknd-cleanup, wknd-sections |

## Notes
- Output: `content/**.plain.html` per URL + compiled report in `tools/importer/reports/`.
- If a bundle needs regenerating after a parser change:
  `"$CID/aem-import-bundle.sh" --importjs tools/importer/import-<template>.js`
- Non-English locale pages (ca/fr, ch/de, etc.) are mostly "Coming Soon" stubs — expect
  lower content-completeness scores there; that is faithful to the source, not a defect.
- `--force` re-fetches even already-saved pages; default reuses saved content.

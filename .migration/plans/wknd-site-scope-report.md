# WKND.site Site Scope Report Plan

## Objective
Produce a complete migration scope report for **https://wknd.site** — discovering all URLs across the full site, analyzing representative pages, cataloging page templates and blocks, and summarizing the overall migration effort.

## Inputs (confirmed)
- **Base URL:** `https://wknd.site`
- **Scope depth:** Full site — discover all URLs (sitemap + crawl fallback), then analyze representative pages per template.

## Approach
Run the site scope analysis capability end-to-end. It: enables site-planning mode, catalogs the site (project setup → URL discovery → page analysis → template naming → block cataloging), generates a summary with migration metrics, and presents a completion report. Read-only discovery — no content files are created or modified.

## Checklist

- [ ] **Enable site planning mode** — Merge `site-planning` into `.migration/project.json` features.
- [ ] **Discover URLs** — Fetch `https://wknd.site/sitemap.xml`; if unavailable or incomplete, crawl to enumerate all reachable pages.
- [ ] **Deduplicate & catalog URLs** — Normalize and group the discovered URL set; record total page count (`urls-all.json`, `urls-grouped.json`, `urls-sample.json`).
- [ ] **Group pages into templates** — Cluster similar pages into distinct page templates and name them (`template-catalog.json`).
- [ ] **Analyze representative pages** — Inspect structure, sections, and authoring decisions per sampled template (`.pages/`).
- [ ] **Inventory blocks** — Identify distinct block variants across templates and note reuse (`block-catalog.json`).
- [ ] **Assess complexity** — Flag navigation, footer, and special components (carousels, embeds, forms, Dynamic Media) adding effort.
- [ ] **Generate summary** — Run `generate-summary.js` to produce validated `summary.json` with metrics and effort estimates.
- [ ] **Present completion summary** — Run `present-completion-summary.js` and share its output as the scope report.

## Notes
- Scope analysis is read-only; it does not build parsers, transformers, or import content.
- **Execution requires Execute mode.** The environment is currently blocking writes/commands under plan mode. Once you exit plan mode, I will run the full scope analysis immediately following the checklist above.
```

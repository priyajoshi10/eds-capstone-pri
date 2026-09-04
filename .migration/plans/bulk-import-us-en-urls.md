# Verify Magazine Pages Render in Preview

## Objective
Open the preview URLs for the magazine listing page and all 5 article-detail pages to confirm they render end-to-end (blocks decorate, header/footer resolve, content intact).

## Which preview to check
There are two possible preview surfaces — I need to confirm which you mean, since one requires a publish step:

| Surface | URL pattern | Ready now? |
|---------|-------------|-----------|
| **Local dev** (`aem up`) | `http://localhost:3000/content/us/en/magazine/...` | ✅ renders committed code + local `content/` |
| **AEM preview** (DA-published) | `https://main--eds-capstone-pri--priyajoshi10.aem.page/us/en/magazine/...` | ⚠️ only after each page is previewed/published via admin.hlx.page |

The DA upload wrote source files, but AEM `.aem.page` preview typically needs a preview/publish trigger per path before it renders live. Local preview works immediately.

## Pages to verify (6)
- `us/en/magazine` (listing)
- `us/en/magazine/arctic-surfing`
- `us/en/magazine/guide-la-skateparks`
- `us/en/magazine/san-diego-surf`
- `us/en/magazine/ski-touring`
- `us/en/magazine/western-australia`

## Checklist
- [ ] Confirm target surface (local preview vs AEM `.aem.page`) — see question below
- [ ] Open the magazine listing page; confirm title, article teaser links, header + footer render
- [ ] Open each of the 5 article-detail pages; confirm hero image, title/byline, body (headings, blockquote, inline images), author bio, and the related-stories (`cards-related`) sidebar render
- [ ] For AEM preview only (if chosen): trigger preview for each path via admin.hlx.page first, then open
- [ ] Capture a lightweight snapshot per page (DOM/accessibility tree; screenshot only if pixel check needed)
- [ ] Report per-page pass/fail with any rendering gaps

## Notes
- Local preview reflects the committed blocks/CSS/JS + the local `content/` files (fast, no publish).
- AEM `.aem.page` reflects what's published from DA and is the "real" shared preview a PR would link to; it may need a per-path preview trigger (admin.hlx.page) which is a credentialed action (git/IMS opt-in).
- **Execution requires Execute mode.** Once you pick the surface and I'm in Execute mode, I'll open each page, verify rendering, and report.

/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks + section metadata.
 *
 * Inserts an <hr> before every non-first section and a "Section Metadata"
 * block after each styled section, using boundaries from
 * page-templates.json (payload.template.sections).
 *
 * DOM notes (verified against migration-work/cleaned.html), why selector
 * resolution is more than a plain querySelector:
 *   - Section selectors in the template are arrays, e.g. [".carousel.cmp-carousel--hero"].
 *   - `.teaser.cmp-teaser--hero` (section-4 "Next Adventures") ALSO matches the
 *     three carousel teasers nested inside section-1's `.carousel.cmp-carousel--hero`.
 *     The section-4 teaser is uniquely the one carrying `cmp-teaser--imagebottom`
 *     and, more robustly, the only match NOT nested inside an already-claimed section.
 *   - `.image-list.list` matches BOTH section-3 ("Recent Articles") and
 *     section-5 ("Where do you want to go?"). querySelector alone would return the
 *     first for both.
 * To resolve uniquely we walk sections in DOM order, claiming the first candidate
 * that is neither already claimed nor nested inside a claimed section element.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

function resolveSectionElements(element, sections) {
  const claimed = [];
  const isInsideClaimed = (el) => claimed.some((c) => c !== el && c.contains(el));
  return sections.map((section) => {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      const candidates = Array.from(element.querySelectorAll(sel));
      const pick = candidates.find((c) => !claimed.includes(c) && !isInsideClaimed(c));
      if (pick) {
        claimed.push(pick);
        return pick;
      }
    }
    return null; // selector didn't match on this page — never guess a replacement
  });
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    // Resolve to unique elements now, before parsers replace any section element.
    const resolved = resolveSectionElements(element, sections);

    // Insert breaks in reverse; references stay live regardless of order.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = resolved[i];
      if (i === 0 && !section.style) continue; // first section: no leading break
      if (!sectionEl) continue;

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers may have replaced section elements. Anchor each styled section's
    // Section Metadata block to the marker <hr> inserted above.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || null;
      if (!anchor) continue; // marker didn't survive — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never keeps a leading break
      }
    }
  }
}

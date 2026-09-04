/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://wknd.site/us/en/faqs.html
 * Generated: 2026-09-04
 *
 * Q&A accordion. Each `.cmp-accordion__item` becomes a 2-column row:
 *   cell1 = question text (.cmp-accordion__title / .cmp-accordion__button)
 *   cell2 = answer content (.cmp-accordion__panel body)
 * Follows the Block Collection accordion convention (each row = title | body).
 */
export default function parse(element, { document }) {
  // Each accordion item = one row. Fallbacks handle DOM variations across pages.
  const items = Array.from(
    element.querySelectorAll('.cmp-accordion__item, [class*="accordion__item"]'),
  );

  const cells = [];

  items.forEach((item) => {
    // --- Title cell: question text ---
    const titleEl = item.querySelector(
      '.cmp-accordion__title, .cmp-accordion__button, .cmp-accordion__header',
    );
    const questionText = titleEl ? titleEl.textContent.trim() : '';

    // --- Content cell: answer panel body ---
    const panel = item.querySelector(
      '.cmp-accordion__panel, [class*="accordion__panel"]',
    );

    let contentCell;
    if (panel) {
      // Prefer the inner text/content nodes so we don't carry wrapper cruft,
      // but fall back to the whole panel if the expected structure isn't found.
      const contentNodes = Array.from(
        panel.querySelectorAll(':scope .cmp-text, :scope .text'),
      );
      if (contentNodes.length) {
        contentCell = contentNodes;
      } else {
        contentCell = [panel];
      }
    } else {
      contentCell = [''];
    }

    // Skip empty items (no question and no answer).
    if (!questionText && (!panel || !panel.textContent.trim())) return;

    cells.push([questionText, contentCell]);
  });

  // Empty-block guard: nothing extracted, leave content in place.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'accordion-faq',
    cells,
  });
  element.replaceWith(block);
}

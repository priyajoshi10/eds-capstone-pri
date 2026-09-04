/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-profile. Base: cards.
 * Source: https://wknd.site/us/en/about-us.html
 * Generated: 2026-09-04
 *
 * On the source page each contributor profile is a SEPARATE sibling
 * <section class="experiencefragment cmp-experience-fragment--contributor">
 * element (7 across two grids), NOT wrapped in a single container. The
 * page-templates.json instance selector matches EACH card individually, so
 * parse() is invoked once per contributor section.
 *
 * Strategy: on the FIRST invocation collect every sibling contributor section
 * in the document, build ONE cards-profile block whose rows are the cards, and
 * insert it where the first contributor lives; then remove all consumed
 * contributor sections. Because subsequent matched sections are now detached
 * (no parentNode), the import script's parentNode guard skips them.
 *
 * Card row (2 columns, matching the cards library convention):
 *   cell 1 = avatar image
 *   cell 2 = name (h3) + role (h5) + social icon links
 */
export default function parse(element, { document }) {
  const CONTRIBUTOR_SELECTOR = '.experiencefragment.cmp-experience-fragment--contributor';

  // Collect all contributor sections in document order.
  const contributors = Array.from(
    document.querySelectorAll(CONTRIBUTOR_SELECTOR),
  );

  // Only build once, on the first contributor. If this element is not the
  // first in document order, leave it in place (it will be removed by the
  // first invocation before its own parse call runs, and skipped via the
  // parentNode guard).
  if (contributors.length === 0 || contributors[0] !== element) {
    return;
  }

  const cells = [];

  contributors.forEach((section) => {
    // Avatar image (mandatory first cell).
    const image = section.querySelector('.cmp-image__image, .image img, img');

    // Text content cell: name, role, social links.
    const textCell = [];

    // Name — first title (h3).
    const name = section.querySelector('.title:not(.cmp-title--black) .cmp-title__text, h3.cmp-title__text, h3');
    if (name) textCell.push(name);

    // Role — secondary title (h5).
    const role = section.querySelector('.cmp-title--black .cmp-title__text, h5.cmp-title__text, h5');
    if (role) textCell.push(role);

    // Social icon links.
    const links = Array.from(
      section.querySelectorAll('.cmp-buildingblock--btn-list a.cmp-button, a.cmp-button'),
    );
    links.forEach((link) => textCell.push(link));

    // Row: [image cell, text cell]. Pad the image cell if missing so the
    // block table stays a consistent 2 columns.
    cells.push([image || '', textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });

  // Insert the single block where the first contributor is, then remove all
  // consumed contributor sections (including this one).
  element.replaceWith(block);
  contributors.forEach((section) => {
    if (section !== element && section.parentNode) section.remove();
  });
}

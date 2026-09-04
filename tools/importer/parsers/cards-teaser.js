/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser. Base: cards.
 * Source: https://wknd.site/ (.image-list.list)
 * Generated: 2026-09-04
 *
 * Cards library structure: 2 columns, first row = block name.
 * Each subsequent row = one card: [image] | [linked title + description].
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-image-list__item, li'));

  const cells = [];

  items.forEach((item) => {
    // Image (mandatory) — first cell.
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Text content (mandatory) — second cell: linked title + description.
    const titleLink = item.querySelector('.cmp-image-list__item-title-link, a[class*="title-link"]');
    const titleText = item.querySelector('.cmp-image-list__item-title, [class*="item-title"]');
    const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');

    const textCell = [];
    // Prefer the linked title (preserves the anchor + link target); fall back to plain title.
    if (titleLink) {
      textCell.push(titleLink);
    } else if (titleText) {
      textCell.push(titleText);
    }
    if (description) textCell.push(description);

    if (image || textCell.length) {
      cells.push([image || '', textCell]);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}

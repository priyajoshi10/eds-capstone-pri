/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base: columns.
 * Source: https://wknd.site/ (.teaser.cmp-teaser--featured)
 * Generated: 2026-09-04
 *
 * Columns library structure: first row = block name; subsequent rows contain
 * one cell per visual column. Here: 1 content row, 2 columns —
 * [image] | [eyebrow/pretitle + heading + description + CTA].
 */
export default function parse(element, { document }) {
  // Left column: image.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Right column: all teaser content (pretitle/eyebrow, title, description, CTA).
  // Prefer the content wrapper so nothing is dropped; fall back to individual selectors.
  const textCell = [];
  const contentEl = element.querySelector('.cmp-teaser__content');
  if (contentEl) {
    // Push each element child (pretitle, title, description, action-container) in order.
    Array.from(contentEl.children).forEach((child) => textCell.push(child));
  } else {
    const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"]');
    const title = element.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = element.querySelector('.cmp-teaser__description, [class*="description"], p');
    const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));
    if (eyebrow) textCell.push(eyebrow);
    if (title) textCell.push(title);
    if (description) textCell.push(description);
    ctaLinks.forEach((cta) => textCell.push(cta));
  }

  // Empty-block guard.
  if (!image && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [
    [image || '', textCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}

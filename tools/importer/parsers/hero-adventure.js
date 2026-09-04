/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-adventure. Base: hero.
 * Source: https://wknd.site/ (.teaser.cmp-teaser--hero)
 * Generated: 2026-09-04
 *
 * Hero library structure: 1 column, 3 rows.
 * Row 1 = block name; Row 2 = background image; Row 3 = title + subheading + CTA.
 */
export default function parse(element, { document }) {
  // Background image (optional).
  const bgImage = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');

  // Text content: title, description/subheading, CTA(s).
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"], p');
  const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));

  const contentCell = [];
  if (title) contentCell.push(title);
  if (description) contentCell.push(description);
  ctaLinks.forEach((cta) => contentCell.push(cta));

  // Empty-block guard.
  if (!bgImage && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Row 2: background image (1-column cell). Only add if present.
  if (bgImage) cells.push([bgImage]);
  // Row 3: text content (1-column cell holding all elements).
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-adventure', cells });
  element.replaceWith(block);
}

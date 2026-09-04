/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://wknd.site/ (.carousel.cmp-carousel--hero)
 * Generated: 2026-09-04
 *
 * Carousel library structure: 2 columns, first row = block name.
 * Each subsequent row = one slide: [image, textContent(title + description + CTA)].
 */
export default function parse(element, { document }) {
  // Each slide is a carousel item; fall back to nested teasers if item wrapper differs.
  let slides = Array.from(element.querySelectorAll(':scope .cmp-carousel__item'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll(':scope .teaser.cmp-teaser--hero'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Image (mandatory) — first cell.
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Text content (optional) — second cell: title, description, CTA.
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = slide.querySelector('.cmp-teaser__description, [class*="description"], p');
    const ctaLinks = Array.from(slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));

    const textCell = [];
    if (title) textCell.push(title);
    if (description) textCell.push(description);
    ctaLinks.forEach((cta) => textCell.push(cta));

    // Only add a row if the slide has any content.
    if (image || textCell.length) {
      cells.push([image || '', textCell]);
    }
  });

  // Empty-block guard: no slides found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}

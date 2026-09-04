/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-related. Base: cards (no-images variant).
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html
 * Selector: .list.cmp-list--upnext
 *
 * Text-only "related stories" list ("SHARE THIS STORY" sidebar). No images,
 * so this maps to the 1-column "Cards (no images)" convention: one row per
 * related article, each cell holding a linked title followed by its date.
 * Generated: 2026-09-04
 */
export default function parse(element, { document }) {
  // Each related story is a list item. Fall back across list markup variations.
  const items = Array.from(
    element.querySelectorAll('li.cmp-list__item, ul > li, .cmp-list__item'),
  ).filter((li, i, arr) => arr.indexOf(li) === i);

  const cells = [];

  items.forEach((li) => {
    // The item link carries the article href; title/date live inside it.
    const link = li.querySelector('a.cmp-list__item-link, a');
    const titleEl = li.querySelector('.cmp-list__item-title, [class*="title"]');
    const dateEl = li.querySelector('.cmp-list__item-date, [class*="date"], time');

    const title = titleEl ? titleEl.textContent.trim() : (link ? link.textContent.trim() : '');
    if (!title && !link) return; // skip empty items

    const cellContent = [];

    // Linked title (preserve href) rendered as the card's clickable heading.
    if (link && link.getAttribute('href')) {
      const titleLink = document.createElement('a');
      titleLink.setAttribute('href', link.getAttribute('href'));
      titleLink.textContent = title || link.textContent.trim();
      const heading = document.createElement('h3');
      heading.append(titleLink);
      cellContent.push(heading);
    } else if (title) {
      const heading = document.createElement('h3');
      heading.textContent = title;
      cellContent.push(heading);
    }

    // Date below the title.
    if (dateEl && dateEl.textContent.trim()) {
      const dateP = document.createElement('p');
      dateP.textContent = dateEl.textContent.trim();
      cellContent.push(dateP);
    }

    if (cellContent.length) {
      // 1-column (no images) cards: one row, one cell holding all elements.
      cells.push([cellContent]);
    }
  });

  // Empty-block guard: no related stories found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-related', cells });
  element.replaceWith(block);
}

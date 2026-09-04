/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-attributes. Base: columns.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selector: .contentfragment.cmp-contentfragment--elements
 *
 * Renders a content-fragment sidebar of attribute label/value pairs
 * (Activity, Adventure Type, Trip Length, Group Size, Difficulty, Price)
 * as a 2-column columns block: each row is `label | value`.
 */
export default function parse(element, { document }) {
  // Each attribute pair lives in a .cmp-contentfragment__element wrapper,
  // with the label in <dt class="...element-title"> and the value in
  // <dd class="...element-value">. Fall back to bare dt/dd if wrappers vary.
  let pairs = Array.from(
    element.querySelectorAll('.cmp-contentfragment__element'),
  );

  const cells = [];

  if (pairs.length) {
    pairs.forEach((pair) => {
      const labelEl = pair.querySelector('.cmp-contentfragment__element-title, dt');
      const valueEl = pair.querySelector('.cmp-contentfragment__element-value, dd');
      const label = labelEl ? labelEl.textContent.trim() : '';
      const value = valueEl ? valueEl.textContent.trim() : '';
      // Only emit a row when at least the label is present.
      if (label || value) {
        cells.push([label, value]);
      }
    });
  } else {
    // Fallback: pair up sibling dt/dd elements directly.
    const dts = Array.from(element.querySelectorAll('dt'));
    dts.forEach((dt) => {
      const label = dt.textContent.trim();
      const dd = dt.nextElementSibling && dt.nextElementSibling.tagName === 'DD'
        ? dt.nextElementSibling
        : null;
      const value = dd ? dd.textContent.trim() : '';
      if (label || value) {
        cells.push([label, value]);
      }
    });
  }

  // Empty-block guard: no attribute pairs found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-attributes',
    cells,
  });
  element.replaceWith(block);
}

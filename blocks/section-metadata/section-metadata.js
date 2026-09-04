import { toClassName } from '../../scripts/aem.js';

/**
 * Section Metadata block.
 *
 * This project's vendored aem.js does not consume `.section-metadata` inside
 * decorateSections, so the div is treated as a block and this decorator runs.
 * It reads the key/value rows, applies each as a section-level class or data
 * attribute on the parent `.section`, then removes itself from the DOM.
 *
 * Rows are `key | value` pairs, e.g. `style | highlight` → adds the `highlight`
 * class (each space-separated token) to the parent section.
 *
 * @param {Element} block The section-metadata block element
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) {
    block.remove();
    return;
  }

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = toClassName(cells[0].textContent.trim());
    const value = cells[1].textContent.trim();
    if (!key || !value) return;

    if (key === 'style') {
      // Apply each style token as a class on the section (e.g. "highlight", "dark").
      value.split(',').forEach((s) => {
        const cls = toClassName(s.trim());
        if (cls) section.classList.add(cls);
      });
    } else {
      // Any other key becomes a data attribute for downstream use.
      section.dataset[key] = value;
    }
  });

  // The block's wrapper is metadata-only; remove it so it renders nothing.
  const wrapper = block.parentElement;
  block.remove();
  if (wrapper && wrapper.classList.contains('section-metadata-wrapper') && !wrapper.childElementCount) {
    wrapper.remove();
  }
}

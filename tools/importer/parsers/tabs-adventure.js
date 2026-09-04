/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-adventure. Base: tabs.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 * Selector: .tabs.panelcontainer
 *
 * Renders a tabbed panel (Overview / Itinerary / What to Bring) as a
 * 2-column tabs block: each row is `tab label | panel content`.
 */
export default function parse(element, { document }) {
  // Tab labels live in the <ol class="cmp-tabs__tablist"> as list items.
  const tabLabels = Array.from(
    element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, .cmp-tabs__tablist > li'),
  );
  // Each panel holds the content for the tab at the same index.
  const tabPanels = Array.from(
    element.querySelectorAll('.cmp-tabs__tabpanel'),
  );

  const cells = [];

  tabPanels.forEach((panel, i) => {
    const labelEl = tabLabels[i];
    const label = labelEl ? labelEl.textContent.trim() : '';

    // The meaningful panel content lives inside the content fragment's
    // elements wrapper (paragraphs, lists, images). Prefer that wrapper;
    // fall back to the article, then the panel itself.
    const content = panel.querySelector('.cmp-contentfragment__elements')
      || panel.querySelector('.cmp-contentfragment')
      || panel;

    // Drop the redundant content-fragment title (adventure name repeated per panel)
    // and stray <meta> tags. Remove only empty layout-grid scaffolding — grids
    // that wrap real content (e.g. body images) must be preserved.
    content
      .querySelectorAll('.cmp-contentfragment__title, meta')
      .forEach((el) => el.remove());
    content.querySelectorAll('.aem-Grid').forEach((grid) => {
      if (!grid.querySelector('img, picture, video, iframe')
        && !grid.textContent.trim()) {
        grid.remove();
      }
    });

    cells.push([label, content]);
  });

  // Empty-block guard: no tabs found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'tabs-adventure',
    cells,
  });
  element.replaceWith(block);
}

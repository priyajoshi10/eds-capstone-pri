import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale, loadQueryIndex, listFolder } from '../../scripts/index-cards.js';

/**
 * Read a simple key/value config from the block rows, e.g.
 *   | folder | magazine |
 *   | limit  | 4        |
 *   | cta    | All Articles |
 * Returns {} when the block has no such config (legacy static authoring).
 */
function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key && value) config[key] = value;
    }
  });
  return config;
}

/** Build one teaser card <li> from an index entry, matching the static markup. */
function buildCard(entry) {
  const li = document.createElement('li');

  const imageCell = document.createElement('div');
  imageCell.className = 'cards-teaser-card-image';
  if (entry.image) {
    imageCell.append(createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]));
  }

  const body = document.createElement('div');
  body.className = 'cards-teaser-card-body';
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = entry.path;
  a.title = entry.title || '';
  a.textContent = entry.title || '';
  p.append(a);
  if (entry.description) p.append(document.createTextNode(entry.description));
  body.append(p);

  li.append(imageCell, body);
  return li;
}

/**
 * Legacy path: the cards were authored inline. Decorate the existing DOM into
 * the ul/li teaser layout (unchanged behaviour for pages not yet migrated).
 */
function decorateStatic(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-teaser-card-image';
      else div.className = 'cards-teaser-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}

/**
 * Dynamic path: populate the teaser grid from /query-index.json, filtered to the
 * current locale + folder, newest first, limited. Also appends a locale-relative
 * "All ..." CTA when configured. Fails silently (empty block) on fetch error or
 * when no entries match the current locale.
 */
async function decorateDynamic(block, config) {
  const folder = config.folder.replace(/^\/|\/$/g, '');
  const limit = config.limit ? parseInt(config.limit, 10) : undefined;
  const locale = getLocale();

  block.textContent = '';

  let entries = [];
  try {
    const data = await loadQueryIndex();
    entries = listFolder(data, locale, folder, limit);
  } catch {
    entries = [];
  }

  if (!entries.length) {
    // No content for this locale/folder yet — hide the whole section so we
    // don't render an empty heading + CTA with no cards.
    const section = block.closest('.section');
    if (section) section.dataset.emptyIndexCards = 'true';
    return;
  }

  const ul = document.createElement('ul');
  entries.forEach((entry) => ul.append(buildCard(entry)));
  block.append(ul);

  // Optional CTA button ("All Articles" / "All Trips") pointing at the current
  // locale's listing page.
  if (config.cta) {
    const ctaWrap = document.createElement('p');
    ctaWrap.className = 'cards-teaser-cta button-container';
    const a = document.createElement('a');
    a.href = `${locale}/${folder}`;
    a.className = 'button';
    a.textContent = config.cta;
    ctaWrap.append(a);
    block.append(ctaWrap);
  }
}

export default async function decorate(block) {
  const config = readConfig(block);
  if (config.folder) {
    await decorateDynamic(block, config);
  } else {
    decorateStatic(block);
  }
}

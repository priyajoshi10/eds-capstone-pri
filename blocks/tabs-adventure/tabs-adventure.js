// eslint-disable-next-line import/no-unresolved
import { toClassName, createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale, loadQueryIndex, listFolder } from '../../scripts/index-cards.js';

/**
 * Populate a tab panel with the full adventure listing for the current locale,
 * fetched from the query index. Used for the "All" tab so its cards are dynamic
 * (the per-category tabs stay authored — the index carries no category field).
 * @param {Element} panel the tabpanel element to fill
 * @param {string} folder e.g. "adventures"
 */
async function populateFromIndex(panel, folder) {
  let entries = [];
  try {
    const data = await loadQueryIndex();
    entries = listFolder(data, getLocale(), folder);
  } catch {
    entries = [];
  }
  if (!entries.length) return;

  const ul = document.createElement('ul');
  entries.forEach((entry) => {
    const li = document.createElement('li');

    const imgP = document.createElement('p');
    const imgA = document.createElement('a');
    imgA.href = entry.path;
    if (entry.image) {
      imgA.append(createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]));
    }
    imgP.append(imgA);

    const bodyP = document.createElement('p');
    const titleA = document.createElement('a');
    titleA.href = entry.path;
    titleA.textContent = entry.title || '';
    bodyP.append(titleA);
    if (entry.description) bodyP.append(document.createTextNode(entry.description));

    li.append(imgP, bodyP);
    ul.append(li);
  });
  panel.replaceChildren(ul);
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-adventure-list';
  tablist.setAttribute('role', 'tablist');

  const pending = [];

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const label = tab.textContent.trim();
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-adventure-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-adventure-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();

    // Dynamic "All" tab: when the panel is authored empty, fill it with the
    // full listing for the current locale from the query index. The folder is
    // the listing page's own third path segment (e.g. /us/en/adventures ->
    // "adventures"). Per-category tabs stay authored (no category field in the
    // index).
    if (/^all$/i.test(label) && !tabpanel.querySelector('ul, picture')) {
      const seg = getLocale().split('/').filter(Boolean);
      const folder = window.location.pathname.split('/').filter(Boolean)[seg.length];
      if (folder) pending.push(populateFromIndex(tabpanel, folder));
    }
  });

  block.prepend(tablist);
  await Promise.all(pending);
}

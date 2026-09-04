// WKND header — content-first: reads content/nav.plain.html and decorates.
// Metadata-independent dual-fetch: /content first (localhost), then root (DA/EDS prod).

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    if (expanded && !isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, false);
    }
  }
}

/**
 * Toggle the mobile nav open/closed.
 * @param {Element} nav the nav element
 * @param {Boolean} [force] optional forced state
 */
function toggleMenu(nav, force) {
  const expanded = force !== undefined ? force : nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  document.body.style.overflowY = (expanded && !isDesktop.matches) ? 'hidden' : '';
  if (button) button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  if (expanded) window.addEventListener('keydown', closeOnEscape);
  else window.removeEventListener('keydown', closeOnEscape);
}

/**
 * Build the search form from the ':search:' placeholder in the tools section.
 * Form controls live in JS (not the plain fragment) per the nav contract.
 * @param {Element} toolsSection the tools section element
 */
function decorateSearch(toolsSection) {
  const placeholder = [...toolsSection.querySelectorAll('p')]
    .find((p) => p.textContent.trim() === ':search:');
  if (!placeholder) return;
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = '/us/en/search';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'fulltext';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');
  form.append(input);
  placeholder.replaceWith(form);
}

/**
 * Loads and decorates the header, mainly the nav.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // metadata-independent dual-fetch: /content first (localhost), then root (DA/EDS prod)
  let base = '/content/';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/nav.plain.html');
  }
  if (!resp.ok) return;
  const html = await resp.text();

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.innerHTML = html;

  // Resolve bare relative image paths (e.g. images/wknd-logo.svg) against the nav
  // fragment base. Leave absolute URLs, data: URIs, root paths, and DA-managed
  // media (./media_...) untouched.
  nav.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (
      src
      && !src.startsWith('/')
      && !src.startsWith('./')
      && !src.startsWith('data:')
      && !/^https?:\/\//.test(src)
    ) {
      img.setAttribute('src', `${base}${src}`);
    }
  });

  const sections = [...nav.children];
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    if (sections[i]) sections[i].classList.add(`nav-${c}`);
  });

  // Brand: mark the logo link
  const brand = nav.querySelector('.nav-brand');
  if (brand) {
    const brandLink = brand.querySelector('a');
    if (brandLink) brandLink.className = 'nav-brand-link';
  }

  // Sections: WKND nests the primary links under a "Home" parent (matches source).
  // The logo is the Home link on desktop, so mark the Home wrapper for desktop hiding;
  // its child links (Magazine/Adventures/FAQs/About Us) render as the flat primary nav.
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const topList = navSections.querySelector(':scope > ul');
    if (topList) topList.classList.add('nav-list');
    navSections.querySelectorAll(':scope > ul > li').forEach((li) => {
      li.classList.add('nav-item');
      const link = li.querySelector(':scope > a');
      if (link && link.textContent.trim().toLowerCase() === 'home') {
        li.classList.add('nav-item-home');
        link.classList.add('nav-trigger');
      }
    });
  }

  // Tools: sign-in, locale toggle, and the search form
  const tools = nav.querySelector('.nav-tools');
  if (tools) decorateSearch(tools);

  // Hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // Reset menu state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.replaceChildren(navWrapper);
}

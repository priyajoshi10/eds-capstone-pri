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
 * Build the search form in the tools section. Replaces the "Search" placeholder
 * paragraph (or a :search: icon span) with a real search input.
 * Form controls live in JS (not the plain fragment) per the nav contract.
 * @param {Element} toolsSection the tools section element
 */
function decorateSearch(toolsSection) {
  if (!toolsSection) return;
  const placeholder = [...toolsSection.querySelectorAll('p')]
    .find((p) => /^(:search:|search)$/i.test(p.textContent.trim()))
    || toolsSection.querySelector('p');
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
 * Wire the locale (en-US) toggle in the utility bar to open/close the grouped
 * country/locale dropdown list. Content lives in the fragment; JS only adds behavior.
 * @param {Element} utilitySection the utility section element
 */
function decorateLocale(utilitySection) {
  if (!utilitySection) return;
  const list = utilitySection.querySelector(':scope > ul');
  const toggle = [...utilitySection.querySelectorAll(':scope > p > a, :scope > p')]
    .find((el) => /en-us/i.test(el.textContent.trim()));
  if (!list || !toggle) return;
  list.classList.add('nav-locale-list');

  // Flags are keyed by country code (the part after the hyphen in each locale,
  // e.g. en-US -> US). Tag each top-level country group and the toggle with a
  // data-flag country code; header.css maps that to the matching flag SVG.
  const countryOf = (el) => {
    const code = [...el.querySelectorAll('a')]
      .map((a) => a.textContent.trim())
      .find((t) => /^[a-z]{2}-[a-z]{2}$/i.test(t));
    return code ? code.split('-')[1].toUpperCase() : null;
  };
  const trigger = toggle.closest('p') || toggle;
  trigger.classList.add('nav-locale-toggle');
  const link = trigger.querySelector('a') || trigger;
  const activeLocale = link.textContent.trim().toLowerCase();
  const toggleCC = (link.textContent.trim().split('-')[1] || 'US').toUpperCase();
  link.dataset.flag = toggleCC;

  list.querySelectorAll(':scope > li').forEach((li) => {
    const cc = countryOf(li);
    if (cc) li.dataset.flag = cc;
    // Wrap the country label (the text before the sub-list) in a title span so
    // it can be styled independently of the inline locale links.
    const sub = li.querySelector(':scope > ul');
    if (sub) {
      const title = document.createElement('span');
      title.className = 'nav-locale-title';
      [...li.childNodes].forEach((node) => {
        if (node !== sub && !(node.nodeType === 1 && node.tagName === 'UL')) {
          title.appendChild(node);
        }
      });
      li.insertBefore(title, sub);
      // Mark the locale matching the current toggle as active (underlined).
      sub.querySelectorAll(':scope > li > a').forEach((a) => {
        if (a.textContent.trim().toLowerCase() === activeLocale) {
          a.closest('li').classList.add('nav-locale-active');
        }
      });
    }
  });
  link.setAttribute('role', 'button');
  link.setAttribute('aria-expanded', 'false');
  link.setAttribute('aria-haspopup', 'true');
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const open = link.getAttribute('aria-expanded') === 'true';
    link.setAttribute('aria-expanded', open ? 'false' : 'true');
    list.classList.toggle('is-open', !open);
  });
  document.addEventListener('click', (e) => {
    if (!utilitySection.contains(e.target)) {
      link.setAttribute('aria-expanded', 'false');
      list.classList.remove('is-open');
    }
  });
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

  // Four content sections: utility (top dark bar), brand (logo), sections (nav), tools (search).
  const sections = [...nav.children];
  const classes = ['utility', 'brand', 'sections', 'tools'];
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
      // The Home label may be a direct <a> (local) or wrapped in a <p> (DA/EDS),
      // so match the direct link or the first-child paragraph's link.
      const link = li.querySelector(':scope > a, :scope > p > a');
      if (link && link.textContent.trim().toLowerCase() === 'home') {
        li.classList.add('nav-item-home');
        link.classList.add('nav-trigger');
      }
    });

    // Highlight the nav item for the current section (source shows it yellow).
    // Only the primary child links (Magazine/Adventures/FAQs/About Us) — not the
    // hidden Home link — are candidates. A link is current when its target path
    // equals the page path or is a prefix of it (so article sub-pages highlight
    // their parent section). Normalize: strip /content, .html, trailing slash.
    const norm = (p) => p.replace(/^\/content/, '').replace(/\.html$/, '').replace(/\/$/, '');
    const currentPath = norm(window.location.pathname);
    navSections.querySelectorAll('.nav-item-home > ul a[href]').forEach((a) => {
      const target = norm(new URL(a.href, window.location).pathname);
      if (target && (currentPath === target || currentPath.startsWith(`${target}/`))) {
        a.closest('li').classList.add('nav-item-active');
      }
    });
  }

  // Utility: wire the en-US locale dropdown toggle
  decorateLocale(nav.querySelector('.nav-utility'));

  // Tools: build the search form
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

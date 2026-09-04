// WKND footer — content-first: reads content/footer.plain.html and decorates.
// Metadata-independent dual-fetch: /content first (localhost), then root (DA/EDS prod).

/**
 * Loads and decorates the footer.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  let base = '/content/';
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/footer.plain.html');
  }
  if (!resp.ok) return;
  const html = await resp.text();

  const footer = document.createElement('div');
  footer.innerHTML = html;

  // Resolve bare relative image paths against the footer fragment base.
  // Leave absolute URLs (http/https), data: URIs, root paths (/), and DA-managed
  // media (./media_...) untouched.
  footer.querySelectorAll('img[src]').forEach((img) => {
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

  // Label the sections for styling: brand, nav, social, legal.
  const sections = [...footer.children];
  const classes = ['footer-brand', 'footer-nav', 'footer-social', 'footer-legal'];
  classes.forEach((c, i) => {
    if (sections[i]) sections[i].classList.add(c);
  });

  block.replaceChildren(footer);
}

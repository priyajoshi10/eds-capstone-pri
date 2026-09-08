/*
 * Shared helpers for index-driven listing blocks (cards-teaser, tabs-adventure).
 * The site publishes a single global /query-index.json covering every locale and
 * content type; blocks filter it to the CURRENT locale + folder at runtime so a
 * visitor on /us/en only sees /us/en content, /ca/fr only sees /ca/fr, etc.
 */

/**
 * Current locale prefix from the URL — the first two path segments
 * (e.g. "/us/en", "/ca/fr"). Falls back to "/us/en".
 * @returns {string}
 */
export function getLocale() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  return segments.length >= 2 ? `/${segments[0]}/${segments[1]}` : '/us/en';
}

// Fetch the global query index once per page load; shared across blocks.
let queryIndexPromise;
export function loadQueryIndex() {
  if (!queryIndexPromise) {
    queryIndexPromise = fetch('/query-index.json')
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => (Array.isArray(j.data) ? j.data : []))
      .catch(() => []);
  }
  return queryIndexPromise;
}

/**
 * Direct-child pages of `${locale}/${folder}/`, newest first.
 * "Direct child" means exactly one path segment below the folder, so nested
 * pages (e.g. /ca/en/magazine/members-only/alaskan-adventure) and the folder
 * landing page itself are excluded from the listing.
 * @param {Array} data query-index rows
 * @param {string} locale e.g. "/us/en"
 * @param {string} folder e.g. "magazine"
 * @param {number} [limit] optional max number of entries
 * @returns {Array}
 */
export function listFolder(data, locale, folder, limit) {
  const base = `${locale}/${folder}/`;
  const depth = base.split('/').filter(Boolean).length + 1; // segments of a direct child
  // Section landing pages that live under a content folder but are not articles
  // themselves (e.g. the gated "members-only" hub) must not appear as cards.
  const NON_ARTICLE = new Set(['members-only']);
  const items = data
    .filter((item) => item.path && item.path.startsWith(base))
    .filter((item) => item.path.split('/').filter(Boolean).length === depth)
    .filter((item) => !NON_ARTICLE.has(item.path.split('/').filter(Boolean).pop()))
    .sort((a, b) => (Number(b.lastModified) || 0) - (Number(a.lastModified) || 0));
  return typeof limit === 'number' ? items.slice(0, limit) : items;
}

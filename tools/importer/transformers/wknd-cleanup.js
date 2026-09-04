/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 * Removes non-authorable site chrome and leftover elements from the WKND
 * homepage DOM. All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Mobile nav toggle + overlay nav that can interfere with block parsing.
    // Found in cleaned.html: <div id="toggleNav">, <div id="mobileNav" class="cmp-navigation--mobile">
    WebImporter.DOMUtils.remove(element, [
      '#toggleNav',
      '#mobileNav',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (header/footer experience fragments, tracking iframe).
    // Found in cleaned.html:
    //   <header class="experiencefragment cmp-experiencefragment--header ...">
    //   <footer class="experiencefragment cmp-experiencefragment--footer ...">
    //   <iframe id="destination_publishing_iframe_wkndsite_0" ...> (Adobe ID syncing)
    WebImporter.DOMUtils.remove(element, [
      'header.cmp-experiencefragment--header',
      'footer.cmp-experiencefragment--footer',
      '#destination_publishing_iframe_wkndsite_0',
      'iframe',
      'meta',
      'noscript',
    ]);
  }
}

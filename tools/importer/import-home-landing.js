/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsFeaturedParser from './parsers/columns-featured.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import heroAdventureParser from './parsers/hero-adventure.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'columns-featured': columnsFeaturedParser,
  'cards-teaser': cardsTeaserParser,
  'hero-adventure': heroAdventureParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home-landing',
  description: 'Locale landing page with a full-width hero carousel, a featured article teaser with side text, and multiple card-grid content rows',
  urls: [
    'https://wknd.site/',
    'https://wknd.site/ca/en.html',
    'https://wknd.site/ca/fr.html',
    'https://wknd.site/ch/de.html',
    'https://wknd.site/ch/fr.html',
    'https://wknd.site/ch/it.html',
    'https://wknd.site/de/de.html',
    'https://wknd.site/es/es.html',
    'https://wknd.site/fr/fr.html',
    'https://wknd.site/it/it.html',
    'https://wknd.site/us/en.html',
    'https://wknd.site/us/es.html',
  ],
  blocks: [
    { name: 'carousel-hero', instances: ['.carousel.cmp-carousel--hero'] },
    { name: 'columns-featured', instances: ['.teaser.cmp-teaser--featured'] },
    { name: 'cards-teaser', instances: ['.image-list.list'] },
    { name: 'hero-adventure', instances: ['.teaser.cmp-teaser--hero'] },
  ],
  sections: [
    { id: 'section-1-hero-carousel', name: 'Hero carousel', selector: ['.carousel.cmp-carousel--hero'], style: null, blocks: ['carousel-hero'], defaultContent: [] },
    { id: 'section-2-featured-article', name: 'Featured article teaser', selector: ['.teaser.cmp-teaser--featured'], style: 'highlight', blocks: ['columns-featured'], defaultContent: [] },
    { id: 'section-3-recent-articles', name: 'Recent Articles', selector: ['.image-list.list'], style: null, blocks: ['cards-teaser'], defaultContent: [] },
    { id: 'section-4-next-adventures', name: 'Next Adventures', selector: ['.teaser.cmp-teaser--hero'], style: null, blocks: ['hero-adventure'], defaultContent: [] },
    { id: 'section-5-destinations', name: 'Where do you want to go?', selector: ['.image-list.list'], style: null, blocks: ['cards-teaser'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections (sections run in afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip already-replaced/detached elements)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index to avoid empty-path crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

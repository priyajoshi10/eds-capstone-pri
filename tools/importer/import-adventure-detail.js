/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsAttributesParser from './parsers/columns-attributes.js';
import tabsAdventureParser from './parsers/tabs-adventure.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'columns-attributes': columnsAttributesParser,
  'tabs-adventure': tabsAdventureParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'adventure-detail',
  description: 'Detail page with a hero banner, a left sidebar of attribute label/value pairs, and a tabbed main content area with body copy and images',
  blocks: [
    { name: 'carousel-hero', instances: ['.carousel.cmp-carousel--mini'] },
    { name: 'columns-attributes', instances: ['.contentfragment.cmp-contentfragment--elements'] },
    { name: 'tabs-adventure', instances: ['.tabs.panelcontainer'] },
  ],
  sections: [
    { id: 's1-breadcrumb', name: 'Breadcrumb', selector: ['.breadcrumb.cmp-breadcrumb--fixed'], style: null, blocks: [], defaultContent: ['.breadcrumb.cmp-breadcrumb--fixed'] },
    { id: 's2-hero', name: 'Hero image carousel', selector: ['.carousel.cmp-carousel--mini'], style: null, blocks: ['carousel-hero'], defaultContent: [] },
    { id: 's3-title', name: 'Adventure title', selector: ['.title.cmp-title--underline'], style: null, blocks: [], defaultContent: ['.title.cmp-title--underline'] },
    { id: 's4-attributes', name: 'Adventure attributes sidebar', selector: ['.contentfragment.cmp-contentfragment--elements'], style: null, blocks: ['columns-attributes'], defaultContent: [] },
    { id: 's5-tabs', name: 'Tabbed main content', selector: ['.tabs.panelcontainer'], style: null, blocks: ['tabs-adventure'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

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

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
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

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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

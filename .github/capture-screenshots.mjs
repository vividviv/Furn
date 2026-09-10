/**
 * Regenerates .github/screenshots/*.jpg — the images the README shows.
 *
 * They are captured from https://preview.colorlib.com/theme/furn/, which is the static
 * HTML edition of Furn, not a live Shopify storefront. That is deliberate: this theme and
 * the HTML edition are built from the same `base.css`, so the preview renders exactly what
 * the Liquid renders, and it can be screenshotted without standing up a store with
 * plausible furniture in it. Anything that needs a real storefront — checkout, Markets,
 * Search & Discovery facets — is not screenshotted here.
 *
 * Playwright is not a dependency of a Shopify theme, so point at an install elsewhere.
 * ESM will not import a bare directory — give it the entry file, not the package folder:
 *
 *   PLAYWRIGHT_PATH="/path/to/node_modules/playwright/index.js" node .github/capture-screenshots.mjs
 *
 * Headless only. Never switch this to `headless: false` — a headed Chrome steals focus
 * from whoever is at the keyboard.
 */

import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'screenshots');
mkdirSync(out, { recursive: true });

const BASE = process.env.FURN_PREVIEW || 'https://preview.colorlib.com/theme/furn/';

const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;

const browser = await chromium.launch({ headless: true });

/**
 * Waits for fonts and every lazy image in the viewport to actually have pixels.
 *
 * Two things to know about the waits in here:
 *  - `document.fonts.ready` resolves to a FontFaceSet, which Playwright cannot serialise
 *    back across the bridge — await it inside the page and return nothing.
 *  - every wait is raced against a deadline. One image that never resolves (a font CDN
 *    that hangs rather than 404s, say) would otherwise wedge the whole run silently,
 *    which is exactly what a `waitUntil: 'load'` here used to do.
 */
async function settle(page, budget = 6000) {
  await page.evaluate(async (ms) => {
    const deadline = (p) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
    await deadline(document.fonts?.ready ?? Promise.resolve());
    const pending = [...document.images].filter((i) => !i.complete);
    await deadline(Promise.all(
      pending.map((i) => new Promise((r) => { i.onload = i.onerror = r; })),
    ));
  }, budget);
  await page.waitForTimeout(400);
}

/** Scrolls the whole page so lazy-loaded images below the fold decode before a full-page shot. */
async function loadEverything(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await settle(page);
}

async function shot(name, { path = '', width = 1200, height = 750, dpr = 1, full = false, before } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
    reducedMotion: 'reduce', // freeze the reveal animations so nothing is caught mid-fade
  });
  const page = await ctx.newPage();
  // Neither `load` nor `networkidle` ever fires on the preview — something in the font
  // stack keeps a request open for the life of the page. Wait for the DOM and let
  // settle() decide when it is actually painted.
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await settle(page);
  if (full) await loadEverything(page);
  if (before) await before(page);
  await page.screenshot({ path: join(out, `${name}.jpg`), quality: 88, type: 'jpeg', fullPage: full });
  await ctx.close();
  console.log(`✓ ${name}.jpg`);
}

// Homepage, above the fold.
await shot('hero', { height: 675 });

// The whole homepage, for the collapsed <details> block in the README.
await shot('homepage-full', { full: true });

await shot('collection-page', { path: 'shop.html' });
await shot('product-page', { path: 'product.html' });
await shot('blog-page', { path: 'blog.html' });
await shot('about-page', { path: 'about.html' });

// The tabbed collection grid — the one section that is Furn's rather than shared with Fashe.
await shot('product-tabs', {
  before: async (page) => {
    await page.locator('collection-tabs').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await settle(page);
  },
});

// Cart drawer, with something in it — an empty drawer shows nothing worth showing.
// Quick add opens the drawer, and the open drawer then covers the grid, so each
// addition has to be followed by closing it again before the next one is clickable.
await shot('cart-drawer', {
  before: async (page) => {
    const drawer = page.locator('#CartDrawer');
    for (const i of [0, 1]) {
      await page.locator('[data-add-to-cart]').nth(i).click();
      await drawer.waitFor({ state: 'visible' });
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await drawer.waitFor({ state: 'hidden' });
    }
    await page.locator('#CartIconBubble').click();
    await drawer.waitFor({ state: 'visible' });
    await settle(page);
    await page.waitForTimeout(500); // let the slide-in finish
  },
});

// Mobile. 400 CSS px at 2x so the phone shot is not soft next to the desktop ones.
// Viewport only, not fullPage: the homepage is ~8,700 CSS px tall on a phone, and a
// 17,000px strip is unreadable in a README and blows past what GitHub will inline.
await shot('mobile-view', { width: 400, height: 860, dpr: 2 });

await browser.close();

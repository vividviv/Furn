/**
 * Generates .github/social-preview.png — the image GitHub shows when this repo is
 * shared on social, in chat and in search previews.
 *
 * A bare crop of the storefront is pretty but says nothing: a reader seeing it in a
 * feed cannot tell it is a Shopify theme, or free. So the card keeps the design as the
 * hero — that is what sells a furniture theme — and puts the name, the platform and the
 * facts beside it rather than over it, because the hero screenshot has its own headline
 * and buttons and two competing layouts in one frame reads as a mistake.
 *
 * 1280x640 at deviceScaleFactor 1. Do not render at 2x: GitHub caps the upload at 1MB
 * and the extra pixels buy nothing at this display size.
 *
 * There is no API for uploading it. Settings -> General -> Social preview, in a browser.
 *
 * Playwright is not a dependency of a Shopify theme, so point at an install elsewhere.
 * ESM will not import a bare directory — give it the entry file, not the package folder:
 *
 *   PLAYWRIGHT_PATH="/path/to/node_modules/playwright/index.js" node .github/social-preview.mjs
 */

import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;

const hero = readFileSync(join(here, 'screenshots/hero.jpg')).toString('base64');

// Furn's own tokens, so the card cannot drift from the theme it is advertising.
const CORAL = '#fd8f5f';
const NAVY = '#1f2b7b';

const html = `<!doctype html><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1280px; height: 640px; overflow: hidden;
         font-family: Poppins, -apple-system, "Helvetica Neue", Arial, sans-serif; }
  .card { position: relative; width: 1280px; height: 640px; background: ${NAVY};
          display: grid; grid-template-columns: 730px 550px; }
  .body { padding: 74px 56px 62px 76px; display: flex; flex-direction: column; }
  /* Crops hard onto the armchair in the lower right of the hero. A plain "cover" pulls in
     the storefront's own nav and white headline card, which then sits next to this card's
     headline and reads as a pasted rectangle. hero.jpg is 1200x675; this shows roughly
     x 780-1200, y 200-675 of it, scaled to fill the 550x640 panel. */
  .shot { position: relative; background: url(data:image/jpeg;base64,${hero}) no-repeat;
          background-size: 1617px 909px; background-position: -1051px -269px; }
  /* Feathers the seam so the crop does not read as a pasted rectangle. */
  .shot::before { content: ''; position: absolute; inset: 0;
                  background: linear-gradient(90deg, ${NAVY} 0%, rgba(31,43,123,.55) 12%, rgba(31,43,123,0) 34%); }
  .kicker { font-size: 19px; letter-spacing: .34em; text-transform: uppercase;
            color: ${CORAL}; font-weight: 500; }
  h1 { font-size: 138px; line-height: .95; font-weight: 300; color: #fff;
       letter-spacing: -.02em; margin-top: 22px; text-transform: uppercase; }
  h1 b { font-weight: 700; color: ${CORAL}; }
  p { font-size: 27px; line-height: 1.38; color: rgba(255,255,255,.82);
      font-weight: 300; margin-top: 26px; }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: auto; }
  .chip { font-size: 17px; font-weight: 400; color: rgba(255,255,255,.9); white-space: nowrap;
          border: 1px solid rgba(255,255,255,.3); border-radius: 999px; padding: 8px 18px; }
  .chip--on { background: ${CORAL}; border-color: ${CORAL}; color: ${NAVY}; font-weight: 600; }
  .by { position: absolute; right: 46px; bottom: 40px; font-size: 17px;
        letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.75);
        text-shadow: 0 1px 12px rgba(0,0,0,.85); }
</style>
<div class="card">
  <div class="body">
    <div class="kicker">Free Shopify theme</div>
    <h1>Fu<b>rn</b></h1>
    <p>For furniture, homeware and interiors stores — built on Online&nbsp;Store&nbsp;2.0 theme blocks.</p>
    <div class="chips">
      <span class="chip chip--on">Free</span>
      <span class="chip">Theme blocks</span>
      <span class="chip">Ajax cart</span>
      <span class="chip">No jQuery</span>
    </div>
  </div>
  <div class="shot"><div class="by">Colorlib</div></div>
</div>`;

const tmp = join(here, '.social-preview.tmp.html');
writeFileSync(tmp, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 });
await page.goto('file://' + tmp, { waitUntil: 'load' });
// Resolves to a FontFaceSet, which cannot cross the bridge — await it inside the page.
await page.evaluate(async () => { await document.fonts.ready; });
await page.waitForTimeout(400);
await page.screenshot({ path: join(here, 'social-preview.png') });
await browser.close();
unlinkSync(tmp);

console.log('wrote .github/social-preview.png (1280x640)');

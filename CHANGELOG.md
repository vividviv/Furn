# Changelog

All notable changes to the Furn Shopify theme.

## [1.0.0] — 2026-09-09

First release. Furn ported from the Colorlib HTML template onto Shopify's
theme-blocks architecture, sharing its foundation with Fashe 2.0.

### Added

- 19 JSON templates, 38 sections, 14 blocks, 18 snippets.
- `page-header` section — image banner with the page title and a breadcrumb
  trail, wired into every inner template. Emits `BreadcrumbList` JSON-LD.
- `tabbed-collections` section — the "Popular products" grid with one
  collection per tab. Panels render server-side, so the grid works without
  JavaScript and tab switching makes no request. Implements the ARIA tabs
  pattern including arrow-key, Home and End navigation.
- `heading` colour in every colour scheme, so headings can differ from body
  copy. Falls back to the text colour when unset.
- `show_title` on the eight `main-*` sections, so a template using
  `page-header` does not end up with two `<h1>` elements.

### Fixed in the shared design system

Building the HTML edition on the same stylesheet surfaced three bugs that were
also present in Fashe, and are fixed in both:

- `.h4`, `.h5` and `.h6` utility classes were never defined — only `.h0`
  through `.h3`. Seven places in the theme use them, so those headings had been
  rendering one size too large.
- `.nav__link` was `display: block`, so the chevron on a dropdown link wrapped
  onto its own line.
- The HTML edition's `money()` used `toFixed(2)` while the server-rendered
  markup used a thousands separator, so four-figure prices disagreed between
  the two. Latent in Fashe, whose prices all sit under $1,000.

### Notes

- `shopify theme check`: 98 files, 0 offenses.
- Assets are two files totalling 64 KB unminified: `base.css` (41 KB) and
  `theme.js` (24 KB). No framework, no jQuery, no CDN dependency.
- The source HTML template loads **16 stylesheets and 27 scripts**, among them
  jQuery 1.12.4, Bootstrap 4, Owl Carousel, Slick, Slicknav, WOW.js, Magnific
  Popup, gijgo, lightSlider and Modernizr. Shopify permits none of that in a
  theme today, so this is a rewrite rather than a wrapper.

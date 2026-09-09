# Furn — free Shopify furniture theme

Furn is a free Shopify theme for furniture, homeware and interiors stores, built
by [Colorlib](https://colorlib.com). It is a port of the free Furn HTML template
onto Shopify's current theme architecture.

It is a **theme-blocks theme** — Online Store 2.0 with JSON templates, section
groups and theme blocks — so every section, including the product page, can be
added, reordered and nested from the theme editor without touching Liquid.

## What's in it

- **19 JSON templates** covering home, collection, product, cart, search, blog,
  article, pages, the full customer account set, password and 404.
- **38 sections** and **14 blocks**, all editor-configurable.
- **Two asset files** — `assets/base.css` (41 KB) and `assets/theme.js` (24 KB).
  No framework, no jQuery, no build step, no external CDN.
- **Four colour schemes** applied per section, plus font pickers, spacing,
  corner radius and card controls.
- **Ajax cart drawer**, predictive search, variant swatches, quantity steppers
  and product recommendations, all as custom elements.

## Sections specific to Furn

| Section | What it does |
|---|---|
| `page-header` | The image banner that opens every inner page: title, breadcrumb trail, and `BreadcrumbList` JSON-LD so the crumbs can appear in search results. |
| `tabbed-collections` | The "Popular products" grid where each tab is a collection. Every panel renders server-side, so it works with JavaScript off and switching tabs costs no request. |

## Design

Taken from the source template: coral `#fd8f5f`, navy `#1f2b7b`, blush
`#f2e1d9`, Poppins, uppercase headings, square corners. Headings carry their own
colour in each scheme (`heading`), so navy titles can sit over neutral body copy.

Every colour, font and radius is a theme setting — nothing above is hard-coded
in the stylesheet.

## Install

Upload `furn-shopify-theme.zip` in **Online Store → Themes → Add theme → Upload zip**.

## Accessibility

Skip link, visible focus states, labelled form controls, `prefers-reduced-motion`
support, and the tabbed grid implements the ARIA tabs pattern with arrow-key,
Home and End navigation.

## Licence

CC BY 3.0, matching the Furn HTML template it is ported from. Imagery in the
demo is from Unsplash.

## Credits

Based on the [Furn HTML template](https://colorlib.com/wp/template/furn/) by
Colorlib. Architecture shared with the
[Fashe Shopify theme](https://colorlib.com/wp/themes/fashe-free-shopify-ecommerce-theme/).

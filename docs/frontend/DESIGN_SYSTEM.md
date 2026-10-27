# Design system

[Documentation index](../README.md)

The interface uses handwritten CSS and Lucide React icons. Shared semantic tokens are defined in [index.css](../../apps/web/src/index.css); marketplace rules are in [App.css](../../apps/web/src/App.css), with separate seller, admin and customer stylesheets. There is no separate component-library or utility-CSS dependency.

## Colors and themes

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `--primary` | `#175cd3` | `#8bb7ff` | Actions and accents |
| `--primary-hover` | `#104cae` | `#a8c9ff` | Action hover |
| `--on-primary` | `#ffffff` | `#102a56` | Text on primary buttons |
| `--navy` | `#102a56` | `#e2eaf7` | Main text |
| `--page` | `#f7f9fc` | `#111c2e` | Page background |
| `--surface` | `#ffffff` | `#19273c` | Cards, forms and dialogs |
| `--soft` | `#eaf2ff` | `#213654` | Soft sections and selected states |
| `--muted` | `#596b83` | `#aabbd0` | Supporting text |
| `--border` | `#dce4ef` | `#35465e` | Borders |

Semantic status groups include `--success-bg/text/border`, `--warning-bg/text/border` and `--error-bg/text`, plus toast background/text tokens. The light accent constants are green `#18a572`, orange `#f59e0b` and red `#ef4444`; use the semantic pairs for readable status text. Store artwork retains brand-specific colors.

First visits use light mode regardless of OS preference. The shared toggle applies `data-theme="dark"` on the document root and saves `matjari-theme`. Its accessible name is “Dark theme” and `aria-pressed` exposes state. The document-head script applies the saved preference before React rendering. Blocked storage still allows changes during the visit and shows a notice. Reset/sign-out preserve the preference.

## Typography and components

Inter is loaded from Google Fonts, with Arial and sans-serif fallbacks. The base size is 14px with 1.6 line height. Default headings are 44px/29px/17px for h1/h2/h3, with tighter line height and letter spacing; page and responsive rules override them. Product cards and dense workspace text have smaller supporting sizes.

- **Buttons:** `.button` uses primary/on-primary tokens; `.secondary` uses surface/main text. Disabled controls reduce opacity and use a not-allowed cursor. Key icon, quantity and cart targets have 44px minimum dimensions.
- **Cards:** marketplace product/store cards and workspace/customer cards use bordered, rounded surfaces. Flexible product bodies align actions at the bottom.
- **Tables:** seller/admin tables use dense headings, status cells and horizontal scroll wrappers. Seller wrappers are labeled and keyboard focusable; column headers use scope semantics.
- **Badges:** status text accompanies semantic success/warning/error styling; meaning is not expressed only through color.
- **Dialogs:** seller forms and admin details/confirmations use native modal behavior and themed surfaces. Responsive rules constrain dialog height and allow internal scrolling.
- **Forms:** labels, native inputs/selects/textareas, required fields, validation messages and role alerts support product, stock, contact and checkout actions. Customer fields use explicit length/type constraints.

## Responsive rules

These are actual CSS thresholds, not a shared JavaScript breakpoint system:

| Stylesheet | Thresholds | Examples |
| --- | --- | --- |
| Marketplace `App.css` | max 1150, 850, 640, 360px; min 1600px | Container width, navigation/search wrapping, grids and large-screen layout |
| Seller | max 1200, 900, 600px; min 1700px | Compact workspace, mobile sidebar at 900px, smaller grids/dialogs |
| Admin | max 1050, 900, 700, 400px; min 1500px | Banner/sidebar changes, stacked grids and denser metrics |
| Customer | max 767px | Single-column checkout and contact fields |
| Shared `index.css` | max 900, 600, 430px | Drawer visibility, toolbar wrapping and dialog sizing |

The body has a 320px minimum width. Tables may scroll inside their own regions. Test representative widths and both tablet orientations; see [testing](TESTING.md).

## Accessibility

Implemented support includes a skip link, visible keyboard focus, semantic landmarks, labeled controls, status/error announcements, reduced-motion CSS, route heading focus/title updates, mobile Escape handling/focus return, and modal focus behavior. The sidebar hides offscreen links from keyboard navigation. Some controls use `.sr-only` labels.

The Phase 6 report records representative text-token contrast checks and headless Chrome keyboard/layout checks. This is not full accessibility certification; screen-reader workflows, every visual state and physical devices still need review. External fonts/photos have system-font/image fallbacks.

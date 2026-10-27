# Phase 6 — frontend polish and QA

Implemented October 27, 2026 on `feature/frontend-final-polish`. The initial worktree was clean. All source and documentation changes are inside `apps/web`; no backend/database access, authentication/payment integration, commits, pushes or merges were performed.

## Changes and design

Preserved the existing React layouts, reusable marketplace/seller components, route guards, shared PlatformProvider, versioned persistence and currency-separated calculations. Replaced fixed UI surface/text/status colors with shared semantic variables. Light mode retains the requested blue/navy palette; dark mode uses navy/charcoal surfaces and readable blue accents. Branded illustrations/store colors retain their intended presentation.

Aligned product-card actions using flexible card bodies, increased dense supporting text sizes, standardized key touch targets, improved chart label wrapping and chronological overview chart ordering, and retained horizontal scrolling within table containers. Checkout now shows shipping, review and confirmation steps; customer navigation marks the active page, and order progress highlights the current status. Demo account choices explicitly identify Customer, Seller and Admin. A Demo Mode marker and theme toggle are visible in every route group. Workspace footers include the required team credits.

Page titles follow the rendered page heading, including lazily loaded routes. Route-heading focus no longer interrupts an active input or open dialog. Marketplace navigation supports Escape and returns focus to its toggle. Seller navigation locks background scrolling while open and hides offscreen links from keyboard access. Seller tables have labeled keyboard-focusable scroll regions and column header semantics. Existing native modal focus handling, error/status announcements, role guards, ownership checks and reduced-motion support remain in place.

## Theme behavior

- First visit defaults to light regardless of the OS preference.
- A named toggle exposes dark-mode state with `aria-pressed` and shows the action available next.
- `matjari-theme` persists separately from `matjari-demo-v1`.
- A small document-head script applies the preference before app/style rendering and updates browser theme color.
- Theme variables cover public/customer/seller/admin pages, authentication, forms, tables, dialogs, chart labels, status badges, skeletons and toasts.
- Theme changes work in memory if storage is blocked, with a visible notice.
- Sign-out and Reset Demo Data leave theme choice intact.

## Files modified

| Files | Purpose |
| --- | --- |
| `index.html` | Early theme initialization and browser theme color. |
| `src/theme/model.js`, `src/theme/ThemeToggle.jsx` (new) | Isolated preference persistence and accessible theme control. |
| `src/index.css`, `src/App.css` | Semantic tokens, dark palette, shared responsive/accessibility refinements and marketplace surfaces. |
| `src/seller/seller.css`, `src/admin/admin.css`, `src/customer/customer.css` | Theme-aware forms, cards, statuses, banners and tables. |
| `src/platform/DemoControls.jsx` | Global theme control and Demo Mode indicator. |
| `src/App.jsx` | Heading-based document titles and noninterrupting route focus. |
| `src/components/Marketplace.jsx` | Mobile Escape behavior and reusable workspace credits. |
| `src/customer/Pages.jsx` | Explicit demo role labels, active account navigation and checkout steps. |
| `src/admin/Pages.jsx` | Chronological weekly overview chart ordering. |
| `src/seller/UI.jsx`, `src/admin/Layout.jsx` | Shared credits, seller drawer scroll lock/navigation association. |
| `src/seller/Dashboard.jsx`, `src/seller/Management.jsx`, `src/seller/Orders.jsx` | Keyboard-accessible table scroll regions and column headers. |
| `tests/theme.test.js` (new) | Preference defaults, persistence, blocked storage and reset independence. |
| `tests/polish.browser.mjs` (new), `package.json` | Repeatable full workflow and two-theme responsive/browser checks. |
| `README.md`, `PHASE6.md` | Current setup, routes, policies, limitations and QA report. |

## Verification

Build, ESLint and all six Node test files pass. Node coverage includes checkout atomicity/idempotency, shared status propagation, tenant/customer isolation, route protection, protected cart, persisted session validation, reset and independent theme persistence. The existing RBAC Chrome suite passed all 31 checks with no uncaught runtime errors, including safe intended routes, wrong-role denial, invalid saved sessions, logout/back, foreign tenant/order access and registration.

The complete 22-step demo workflow was executed through the UI: guest browsing, protected Add to Cart, customer login, explicit product addition, populated cart, shipping/review/checkout, confirmation and history; seller login to the order's tenant, order search and status update; customer login and updated timeline; admin statistics, confirmed store suspension, unavailable public storefront, restoration and reload persistence. No guards were bypassed or session records injected.

The Chrome polish suite passed **336 route/theme/width checks**: 24 routes × seven widths × two themes. Each route rendered without unintended document overflow or clipped main form/button controls outside the intended table scroll regions. Populated cart/checkout/history, owned customer and seller order details, confirmation, seller product forms and admin tenant dialogs were included.

| Width | Light | Dark |
| --- | --- | --- |
| 320px | Pass | Pass |
| 375px | Pass | Pass |
| 430px | Pass | Pass |
| 768px | Pass | Pass |
| 1024px | Pass | Pass |
| 1440px | Pass | Pass |
| 1920px | Pass | Pass |

Additional checks passed for seller/admin dashboards at 768×1024 portrait and 1024×768 landscape in both themes. Mobile navigation Escape behavior, modal viewport width and theme-aware dialog backgrounds were exercised. Cancelled reset preserved the entire graph; confirmed reset removed the created checkout order/session and retained the theme. Theme changes and browsing remained usable when storage access threw exceptions. No uncaught JavaScript exceptions occurred. Home/admin screenshots at 375px and 1440px were visually inspected in both themes; these generated review artifacts are outside the repository at `/tmp/matjari-phase6`.

The theme contrast checks verify eight shared text/background pairs at a minimum 4.5:1: main text/surface, muted text/surface, muted text/page, primary/soft, button text/primary, and success/warning/error text against their respective status backgrounds. They are representative semantic-token checks, not a complete page-level accessibility certification.

## Limitations

Checks use headless desktop Chrome viewport emulation, not physical touch devices. Firefox/Safari and a full screen-reader/assistive-technology audit were not run. Shared semantic text pairs are checked for 4.5:1 contrast; this does not certify every photograph/illustration or every possible state. External photographs/fonts are blocked in the repeatable polish suite to exercise image/system-font fallbacks; delivery from external providers is outside the checks.

The existing demo remains local to one origin and one active tab. There is no real identity verification, payment, shipping, live telemetry or cross-device synchronization. Timeline stages do not provide historical timestamps. CSS minimum width remains 320px. Real authorization and transactional data services must be implemented server-side before any production use.

## Preview

```sh
npm run dev --prefix apps/web -- --host 127.0.0.1 --port 5180
```

Open the URL printed by Vite. The QA server used `http://127.0.0.1:5181` because port 5180 was already occupied. Choose an account on Demo Login; use the global theme toggle, role-specific navigation and Reset Demo Data to present the demo. See README for build/preview and browser-test commands.

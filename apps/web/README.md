# Matjari customer marketplace

React / Vite customer frontend for a multi-tenant, multi-store marketplace. All data is local mock data; no API or database connections are made.

## Run locally

```sh
cd apps/web
npm install
npm run dev
```

Open the URL Vite prints. `npm run build` creates `dist/`; `npm run preview` serves the production build. Production hosting must rewrite non-asset URLs to `index.html` for client-side routing.

## Routes

- `/`: marketplace home, categories, featured stores and products.
- `/stores`: searchable store directory, categories and load more.
- `/stores/:slug`: isolated storefront, search, filtering and sorting.
- `/products`: catalog with URL-backed filters, sorting and pagination.
- `/products/:id`: product details, quantity selection and same-store recommendations.
- `/cart`: persistent bag, quantity updates, removal and subtotals by currency.

Unknown routes and missing product/store IDs have recovery links. Customer accounts and checkout are explicitly unavailable in this phase.

## Organization

- `src/data/marketplace.js`: four tenants, six stores and 26 products; stable tenant/store/product IDs, USD/EUR/ILS, inactive and sold-out records.
- `src/services/catalog.js`: product selectors, filtering/pagination, price formatting, cart validation and currency subtotals. Replace this boundary when introducing API queries.
- `src/context/`: local cart state; defensive localStorage parsing, purchase eligibility and stock enforcement.
- `src/components/Marketplace.jsx`: shared layout, cards, search, states, pagination and quantity controls.
- `src/pages/`: six customer page types, including the storefront rendered through the catalog component.
- `src/index.css`, `src/App.css`: theme, accessible controls and responsive layouts.

Price sorting groups currencies rather than comparing USD, EUR and ILS as equivalent amounts. Select a currency for directly comparable prices. No currency conversion or checkout policy is assumed. Persisted cart data is revalidated against current mock inventory. Browser storage failures do not prevent an in-memory cart from working.

Product/store imagery uses Unsplash image URLs; Inter loads from Google Fonts. Images have local UI fallbacks and the font stack falls back to Arial/system sans-serif if external services are unavailable. No fabricated ratings, shipping promises or payment guarantees are shown.

## Checks

```sh
npm run build
npm run lint
```

The starter has no test framework. Responsive breakpoints target 320, 375, 430, 768, 1024, 1440 and 1920px. Reduced motion, keyboard focus, named controls, a skip link and live cart notifications are included.

## Phase 1 verification

- Production build and ESLint completed successfully.
- Temporary Playwright tooling outside the repository tested all six page types at 320, 375, 430, 768, 1024, 1440 and 1920px. No horizontal overflow was detected. External images and fonts were blocked for this matrix to exercise fallback layouts.
- Browser flows covered sibling-store isolation, search, category/availability filters, pagination, currency-specific sorting, empty results, add/update/remove cart actions, persistence, currency subtotals, stock caps, invalid routes, malformed saved data and mobile navigation. The production run reported no runtime errors.
- Desktop (1440px) and mobile (375px) home screenshots were also inspected with external imagery loaded. These checks are separate from the fallback matrix; not every page was manually inspected at every width.
- Direct Node assertions checked exact per-currency totals, persisted-cart validation, duplicate rejection, stock limits, filtering and same-tenant store isolation. No test framework was added to the starter.

All implementation changes are limited to `apps/web`. Checkout, authentication, live inventory and API integration remain future work. Unsplash imagery is illustrative mock content.

## Phase 2: merchant dashboard

Run `npm install` (if dependencies are not installed), then `npm run dev` from
`apps/web`. Open `/seller/dashboard` on the Vite development URL, or use the
**Merchant dashboard · Demo** link in the marketplace footer.

Pages: dashboard, stores, products, inventory, orders, and order details. Seller
routes use a separate sidebar/header layout; customer routes and catalog state
remain independent.

The shared SellerProvider provides mock authentication, validated store selection,
and session-only merchant mutations. StoreSwitcher shows the current tenant and
only that tenant's stores. All Stores aggregates authorized records. Selection
persists in localStorage and is revalidated against the current tenant. Changing
tenants or stores resets page-local filters/forms. The sidebar's demo tenant
selector makes isolation across four tenants and six stores easy to inspect.

`src/seller/data.js` is the mock data access/selector boundary. It reuses the
marketplace IDs and records, adds four seller-only products (30 total), and seeds
35 orders. Products and orders require both matching tenant ownership and an
authorized store relationship. Foreign order URLs return an unavailable state,
including when an order belongs to a different selected store. Sales charts and
totals group original currencies, excluding pending, cancelled, and refunded
orders; no exchange-rate conversion is performed.

Mock operations include creating stores with unique slugs; adding/editing products
with store, price, stock, and SKU validation; activating/deactivating products;
setting inventory quantities; and updating order status. Cancellation, refunds,
and product deactivation require confirmation. Order transitions are explicitly
listed in `transitions`; terminal states cannot be reopened. Stock's configurable
low threshold is exported as `threshold` (default 5). Mutations reset on reload;
only the selected store is persisted. Order transitions do not simulate payments,
stock reservation, shipping services, or automatic inventory reconciliation.

Responsive CSS supports a 320px minimum viewport, a mobile navigation drawer with
Escape dismissal and keyboard focus handling, adapting card grids, stacked forms,
responsive charts, and horizontal scrolling contained inside tables. Desktop,
tablet, and mobile browser screenshots were not verified in this environment.

Checks: `npm run build`, `npm run lint`, and `npm test`. The Node test suite covers
tenant/store isolation, stale selections, dataset relationships, product/order
filters, inventory thresholds, currency totals, product validation, and order
transitions. It tests selectors and rules rather than browser interactions.

This is explicitly a frontend demonstration, not production authentication or
authorization. A future API must derive tenant identity from an authenticated
session and enforce authorization on every read and mutation. Backend and database
files are unchanged. No chart or other runtime dependency was added.

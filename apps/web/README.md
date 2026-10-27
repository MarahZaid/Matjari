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

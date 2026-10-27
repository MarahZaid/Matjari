# Matjari frontend demo

Matjari is a multi-tenant, multi-store eCommerce demonstration for Advanced Database Systems — Fall 2026. The React/Vite frontend includes a marketplace, customer checkout and account, tenant-scoped seller tools, and platform administration. All operations use fictional browser data. No backend, MySQL, credentials, payment provider or shipping service is connected.

## Start and preview

From the repository root:

```sh
npm ci --prefix apps/web
npm run dev --prefix apps/web -- --host 127.0.0.1 --port 5180
```

Open the URL Vite prints (normally http://127.0.0.1:5180; another port is selected if occupied). For a production preview:

```sh
npm run build --prefix apps/web
npm run preview --prefix apps/web -- --host 127.0.0.1
```

Storage is per origin; different ports have separate demo data.

## Routes

| Area | Routes |
| --- | --- |
| Public marketplace | `/`, `/stores`, `/stores/:slug`, `/products`, `/products/:id` |
| Demo account selection | `/login`, `/register` |
| Customer | `/account`, `/account/orders`, `/account/orders/:id`, `/cart`, `/checkout`, `/checkout/confirmation/:reference` |
| Seller | `/seller/dashboard`, `/seller/stores`, `/seller/products`, `/seller/inventory`, `/seller/orders`, `/seller/orders/:id` |
| Admin | `/admin/dashboard`, `/admin/tenants`, `/admin/stores`, `/admin/analytics`, `/admin/monitoring` |

`/orders` redirects to customer order history; `/seller` and `/admin` redirect to their dashboards. Unknown paths show a not-found state.

## Demo login and route protection

Choose a fictional customer, a seller associated with a specific tenant, or Platform Admin Demo at `/login`. No password is requested. Registration creates a local customer profile using fictional contact details. Sign Out ends the session and clears the cart and selected customer/tenant/store context; orders remain attached to their customer.

Guests can browse, but cart/account/checkout and workspaces require the appropriate role. Guest Add to Cart returns to the product after customer login; press Add to Cart again to confirm the action. No cart mutation occurs before login. Sellers and admins cannot use customer checkout. Each role receives a 403 for another role's protected pages. Intended destinations are restored only when safe and permitted for the chosen role. Valid sessions survive reload; invalid sessions become guests.

Seller store selection and records remain scoped to the signed-in tenant. Switching tenants requires signing out and selecting another seller account. Customer history, order URLs and confirmation references expose only the active customer's orders. See [DEMO_RBAC.md](DEMO_RBAC.md) for the access matrix and implementation details. These frontend policies demonstrate isolation; bundled data/localStorage are inspectable and are not production authorization.

## Shared mock data and checkout

One PlatformProvider graph connects tenants, stores, products, inventory, customers, orders and sample monitoring events. Seller edits and admin status changes propagate to the marketplace. Suspending a store hides it and its products publicly; suspending a tenant hides every associated storefront. Historical customer orders remain visible. Monitoring uses deterministic mock events, with no live health information.

Checkout validates contact/shipping fields, availability and stock before atomically creating store/currency orders and deducting inventory. Historical item prices are snapshots. Orders split by store and currency; USD, EUR and ILS are never combined or converted. Demo cash on delivery collects no payment; new checkout orders use zero shipping/discount assumptions. Seller status changes appear in the customer's order timeline. Status stages are current-state indicators, not timestamped shipment events.

The versioned `matjari-demo-v1` localStorage record persists the shared graph, session and cart. Corrupt/unsupported data is preserved with a recovery notice; storage failures leave the demo usable in memory. The app is intended for one active browser tab.

**Reset Demo Data** is available in the shared demo toolbar and asks for confirmation. Cancel preserves data. Confirm restores the seed, removes created profiles/orders/edits, ends the session and clears the cart. Theme preference is retained.

## Light and dark themes

First-time visitors start in light mode. The shared **Dark theme / Light theme** button appears on public, authentication, customer, seller and admin pages. Its accessible name is “Dark theme” and `aria-pressed` reports whether dark mode is enabled. The preference uses the independent `matjari-theme` key and is applied in the document head before React renders. Dark mode uses navy/charcoal surfaces and blue accents. Forms, tables, dialogs, charts, status badges, toasts and loading states share theme variables. If storage is blocked, changing the theme still works for the visit and shows a notice.

## Verification

```sh
npm run lint --prefix apps/web
npm test --prefix apps/web
npm run build --prefix apps/web
```

Node tests cover catalog rules, seller scope, admin selectors, checkout transactions, customer ownership, role guards, persistence/reset and theme preferences.

Real-browser suites require a running frontend, Playwright and Chrome supplied by your environment. No browser testing dependency is added to the app. For example:

```sh
WEB_URL=http://127.0.0.1:5180 PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs npm run test:browser --prefix apps/web
WEB_URL=http://127.0.0.1:5180 PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs npm run test:polish --prefix apps/web
```

`CHROME_PATH` overrides `/usr/bin/google-chrome`. `SCREENSHOT_DIR` optionally saves screenshots to an existing directory. `TRACE_QA=1` logs navigation in the polish suite. The RBAC suite checks login, logout/back, safe redirects, customer/seller isolation, invalid sessions and registration. The polish suite traverses guest shopping through checkout, seller updates, customer verification and admin suspension/restoration, then checks 24 routes at seven widths under both themes, dialogs, tablet orientation and theme/reset/storage failure behavior. External fonts and product photography are blocked in that suite for deterministic fallback testing. See [PHASE6.md](PHASE6.md) for executed results and limitations. Earlier phase reports describe historical implementation states; this README and DEMO_RBAC describe the current behavior.

## Limitations and future integration

This is a browser demo, not a production service. It has no cross-tab/device concurrency control, real authentication, payments, shipping, live monitoring, exchange rates or server-side authorization. Imagery/fonts depend on external providers; image fallbacks and system fonts remain available offline. Browser QA uses headless Chrome; physical devices, Firefox/Safari and full assistive-technology certification are outside the executed checks.

A future backend must derive identity/tenant ownership from verified server sessions and authorize every read/mutation, replace local selectors with paginated API queries, provide transactional inventory/order writes and idempotency, and integrate payment/shipping providers. No backend endpoints or database migrations are part of this frontend.

Designed & Developed by
Alaa Dere · Hiba Burhan · Marah Zaid · Shorouq Derieh

Matjari | Advanced Database Systems Project — Fall 2026

# Phase 4 frontend integration report

> Historical report: This report records Phase 4. Its unguarded role controls, legacy cart import and customer selector were later replaced by validated sessions and role guards. See the [current frontend guides](../../docs/README.md) for implemented behavior and setup.

Verified on October 27, 2026. All repository changes are inside `apps/web`. No API, database, migrations, real authentication, payments, commits, pushes, or merges were performed.

## Files changed

| Files | Purpose |
| --- | --- |
| `src/platform/Provider.jsx` | Shared React state and persistence lifecycle; confirmed reset. |
| `src/platform/persistence.js` (new) | Versioned seed, fictional customers, demo role/context, storage validation, recovery and legacy preference import. |
| `src/platform/selectors.js` (new) | Public stores/products and customer-scoped order selectors. |
| `src/platform/useMarketplace.js` (new) | Reactive marketplace access to public selectors. |
| `src/platform/DemoControls.jsx` (new) | Role navigation, saved-role shortcut, demo order link, reset and storage messages. |
| `src/context/CartProvider.jsx` | Shared persisted cart, current product lookup, stock/availability revalidation. |
| `src/services/catalog.js` | Catalog/cart helpers accept current data; clamp stale catalog pages. |
| `src/pages/Home.jsx`, `Stores.jsx`, `Catalog.jsx`, `ProductDetails.jsx`, `Cart.jsx` | Use shared public data, current prices, stock and store associations. Categories include seller additions. |
| `src/pages/Orders.jsx` (new) | Fictional customer selector and order history reflecting seller status changes. |
| `src/components/Marketplace.jsx` | Product cards resolve current public store data. |
| `src/App.jsx` | Wire shared storefront selection, demo controls and customer order route. |
| `src/seller/Provider.jsx` | Persist tenant/store context; retain scoped mutations; provide new stores/products with presentation defaults. |
| `src/seller/data.js` | Validate currencies and preserve existing product store ownership/order relationships. |
| `src/seller/UI.jsx` | Merchant drawer accessibility semantics and accurate persistence copy. |
| `src/admin/Pages.jsx`, `Layout.jsx` | Accurate suspension/recovery copy and functional state updates. Existing charts/counts continue deriving from shared data. |
| `src/index.css` | Responsive demo controls, customer order cards and focus styles. |
| `tests/integration.test.js` (new) | Nine integration tests covering the shared model, selectors, persistence, cart and currencies. |
| `PHASE4.md` (new) | This report and preview instructions. |

## Shared state architecture

`PlatformProvider` owns one frontend state graph: tenants, stores, products, customers, orders with item snapshots, sample platform events, cart, and demo context. It extends the existing Phase 1–3 seed rather than importing a reference database. Stable IDs connect tenant → stores → products/orders/events, and customers → orders. Order prices remain historical snapshots when catalog prices change.

SellerProvider is a scoped view and mutation adapter over that graph, not a separate dataset. Its existing tenant-scoped selectors support All Stores and individual owned stores. Suspended stores remain available to the seller for management; suspension changes public visibility. Existing admin metrics, charts, detail dialogs and monitoring use the same graph. Public selectors exclude inactive products, suspended stores and every store belonging to a suspended tenant. Customer order history retains past orders even if a storefront is suspended.

Role controls and tenant/customer selection are frontend demo behavior, not production security. Roles do not gate routes. No passwords, credentials, payment details or secrets are stored.

## Persistence and recovery

- Storage key: `matjari-demo-v1`, with `{ version: 1, data }` envelope.
- Saves products, stores, inventory, orders, cart, selected tenant/store, explicitly selected demo role and fictional customer. Reload restores these values; the URL determines the currently displayed area, and the role shortcut resumes the selected role.
- Validates collections, unique IDs/slugs, parent relationships, quantities, currencies, statuses, customer references, order item references and order arithmetic before accepting a save.
- On the first versioned save, imports the older cart and authorized store preference; leaves old keys untouched. Existing versioned data takes precedence.
- Corrupt, unsupported-version or invalid stored data is preserved. The app uses a seed in memory and explains that Reset Demo Data is needed to replace the saved copy. There is no automatic destructive migration.
- Storage access/quota failures are caught and the app remains usable in memory, with a visible message.
- Reset Demo Data uses browser confirmation. Cancel leaves data unchanged. Confirm replaces the data with the predictable seed and clears the shared cart/context.
- Cart items are revalidated against current public products, removed when unavailable, and capped when stock falls. Current prices are used. USD, EUR and ILS subtotals remain separate.

## Automated verification

Passed:

```sh
npm run build --prefix apps/web
npm run lint --prefix apps/web
npm test --prefix apps/web
node apps/web/tests/integration.test.js
git diff --check
```

The test runner passed all three test files (26 declared tests: 9 seller, 8 admin, 9 integration). The new integration file was also executed directly and passed all nine tests. Coverage includes multi-store ownership and tenant scoping; public product visibility; tenant/store suspension and reactivation; malformed/duplicate cart entries and stock limits; cross-role product and order updates; persistence/reload; corrupt/unsupported data; storage failures; reset; legacy preference import; separate currency totals; and stale pagination.

## Actual browser verification

Used local headless Google Chrome through its DevTools protocol against Vite at `http://127.0.0.1:5180`. These were real browser checks, not inferred from CSS.

Checked 18 routes at each width: **320, 375, 430, 768, 1024, 1440, 1920 px** (900 px viewport height): home, store directory, store detail, catalog, product detail, cart, customer orders, all six seller page types including order details, and all five admin pages. No horizontal page overflow or uncaught JavaScript exceptions were found.

Additional checks at every width: populated mixed-currency cart, product form dialog, store creation dialog and tenant detail dialog. Dialog bounds remained inside the viewport and pages did not overflow. Seller/admin drawer Escape handling and focus restoration were checked at mobile width.

Browser scenarios passed:

1. Add a product to the cart, set its stock to zero through seller inventory, reload the cart and verify removal.
2. Create a seller product through its form, reload the public catalog and find it; verify the saved product count. Edit an existing product price and verify persistence.
3. Create an additional store through the seller form, open its public storefront and verify it exists in shared admin data.
4. Mark a pending order paid in seller order details and see the update in the corresponding fictional customer's history.
5. Suspend a tenant in the admin confirmation dialog, then verify its storefront is unavailable and its products disappear from public search.
6. Cancel reset and retain changes; confirm reset and recover the original product count, stock and availability.
7. Load malformed storage, see the recovery message and verify the malformed value was not overwritten.
8. Add USD, ILS and EUR items and verify three separate cart subtotals.

## Known limitations

- State is local to the browser origin and intended for one active demo tab. Concurrent tabs/devices do not synchronize or resolve conflicting writes.
- Monitoring events remain labeled seed samples; actions do not create backend telemetry. No server health is measured.
- Customer history displays fictional seed orders. Checkout, customer account authentication, new order placement and payments remain out of scope.
- Historical order item snapshots are preserved. Existing products cannot be moved to another store; create a new product in that store instead.
- Browser verification used headless Chrome; Firefox/Safari, physical devices and a complete assistive-technology audit were not run.
- Product imagery still uses the existing external image URLs and fallback UI.

## Preview

From the repository root:

```sh
npm run dev --prefix apps/web -- --host 127.0.0.1 --port 5180
```

Open `http://127.0.0.1:5180/`. Use Demo role to switch areas. Seller's sidebar selects the demo tenant and the top bar selects All Stores or an owned store. My demo orders opens fictional customer history. Reset Demo Data restores the seed after confirmation.

For a production build preview:

```sh
npm run build --prefix apps/web
npm run preview --prefix apps/web -- --host 127.0.0.1
```

Storage belongs to an origin, so using a different preview port starts a separate browser dataset.

# Phase 5 customer shopping experience

> Historical report: This report records Phase 5. Its demo password field and role controls were later replaced by password-free account selection and role guards. See the [current frontend guides](../../docs/README.md) for implemented behavior and setup.

Implemented October 27, 2026. Changes are confined to apps/web.

## Pages and components

- /login and /register: fictional account selection or registration, validation, password visibility, return-to-checkout navigation.
- /account: persisted name, email and optional phone editing; sign out.
- /checkout: customer and shipping fields, review step, store/currency summaries, availability errors and duplicate-submit protection.
- /checkout/confirmation/:reference: customer-scoped persisted order confirmation, individual order links and continue-shopping action.
- /account/orders: customer-scoped history with order-number search, supported-status filtering, date sorting and six-item pagination.
- /account/orders/:id: historical item prices, quantities, store, shipping information, date, current status and progress timeline.
- /orders remains supported as a redirect to the new history.
- Reusable customer frame, contact fields, session guard and order card; existing marketplace header and bag now link to account/checkout.

## Demo identity

The existing versioned Phase 4 context gains an optional signedIn boolean. Older saves remain compatible and start signed out. Users select any fictional customer and enter any six-character demo password. Registration adds a fictional customer to the same state. Passwords exist only in component memory and are never persisted or validated against credentials. Sign out ends the demo session without deleting history. Account and order routes show only the selected signed-in customer's data; this is frontend demo behavior, not a security boundary.

## Checkout policy

Orders split by both store and currency. There is no conversion or combined mixed-currency total. All resulting orders share a UUID checkout reference and receive unique stable reference-based IDs. Demo cash on delivery collects no payment. Shipping and discounts are explicitly zero-value demo assumptions. Existing seed orders retain their historical fees.

A pure transaction validates the signed-in customer, contact details, required shipping fields, nonempty cart, unique items, integer quantities, stock, active product, active store and active tenant before returning any changes. Orders and stock updates are applied together to the existing shared graph. A synchronous shared-state adapter ensures transactions read the latest in-tab state. A submission lock plus persisted checkout-reference idempotency prevents repeated orders or deductions.

## Verification

Build, lint, the four test files, and git diff whitespace validation passed. Six additional customer tests cover:
- Contact, session, address, cart and quantity validation.
- Multi-store/currency splitting and historical item snapshots.
- Atomic stock deduction and all-or-nothing rejection.
- Duplicate submission, including a repeated request after refilling the cart.
- Inactive products and suspended stores/tenants.
- Customer isolation, confirmation ownership, seller scope and shared status changes, admin order totals.
- Reload persistence for session, stock, orders and confirmation.

Existing seller, admin and integration tests continue passing. Seller-scoped selectors include checkout orders; seller status changes use the same order objects consumed by customer details; admin metrics derive the updated order count. These integration assertions exercise the shared model, rather than a full browser traversal of each seller/admin action.

Actual headless Google Chrome verification passed demo login, shipping entry, review, repeated submission, successful checkout and confirmation reload. Seven customer routes were checked at 320, 375, 430, 768, 1024, 1440 and 1920 pixels (49 route/width checks), including populated checkout and order details. No horizontal page overflow or uncaught JavaScript exceptions were observed.

## Persistence and limitations

The original matjari-demo-v1 version-1 envelope remains in use. Optional additive fields preserve older valid saves. Profiles, sessions, order snapshots, checkout references and inventory survive reload when browser storage is available. Existing corrupt-data recovery, reset and unavailable-storage notices remain intact.

This is one-browser, one-active-tab demo state. There is no cross-device/tab concurrency control, real authentication, payment, shipment integration, delivery estimate or tracking number. Fictional details should be used. Timeline stages reflect the current status rather than timestamped shipment events; cancelled/refunded orders show their terminal state. Historical seed orders may have no payment-method snapshot. Physical devices, Firefox/Safari and a full assistive-technology audit were not tested. No new dialogs were introduced.

## Preview

From the repository root:

    npm run dev --prefix apps/web -- --host 127.0.0.1 --port 5180

Open http://127.0.0.1:5180. Add products, continue from the bag to demo checkout, select a fictional customer, and place an order. Use Demo role to inspect the matching seller tenant/store and update its order status, then return to the customer's order details. Admin dashboard metrics use the same persisted graph.

No API, MySQL, migrations, real providers, commits, pushes or merges were used.

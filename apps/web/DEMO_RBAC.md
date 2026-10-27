# Phase 5.1 demo access control

All changes are frontend only. These guards demonstrate navigation policies; localStorage and all bundled demo data remain inspectable and editable. Real backend authentication and authorization are required before handling private data. There are no passwords, tokens, backend endpoints, or database changes.

## Session and routes

`src/auth/model.js` defines the canonical session: `userId`, `role`, `displayName`, and the role-specific `customerId` or `tenantId`. A missing/invalid session is a guest. Associations are validated against existing local profiles and tenants. The existing versioned platform persistence stores the session alongside demo data. Restoration is synchronous before routes mount, so protected content never renders during restoration. Corrupt saves retain the existing recovery/reset message. Legacy sessions and unowned carts become guest sessions.

`src/auth/Routes.jsx` provides nested `RequireRole` and `GuestOnly` guards. Guests receive a sign-in-required message and an intended destination. Wrong-role sessions receive a distinct 403 page and their allowed home link. Unknown routes use the separate 404 page. Redirects reject external URLs, backslashes, control characters, encoded paths and dot segments, and only restore permitted destinations. Guards run for direct navigation, reloads and browser history.

| Route group | Guest | Customer | Seller | Admin |
| --- | --- | --- | --- | --- |
| Marketplace, stores, products | Allow | Allow | Allow | Allow |
| Login / register | Allow | Own home | Own home | Own home |
| Cart, checkout, account, orders, confirmations | Login | Allow, own data | 403 | 403 |
| Seller and all nested routes | Login | 403 | Own tenant | 403 |
| Admin and all nested routes | Login | 403 | 403 | Allow |

## Shopping and identities

Every Add to Cart button uses the shared cart provider. Guests are sent to login with the product destination without changing the cart. Customer login returns them to the product where they explicitly press Add to Cart again. Sellers/admins receive 403 for cart actions. Cart updates revalidate role, public availability and stock. Checkout retains its atomic availability and ownership validation. Order history selectors validate the active customer, and order/confirmation URL lookups use owned records only.

Login explicitly selects an existing customer, a tenant-associated seller (including Tenant A and B), or Platform Admin Demo. Registration validates fictional contact fields and duplicate email addresses, creates only a local customer, and signs that customer in. No password field or credential check exists.

Sign Out clears the session, cart, customer/tenant/store selections and remounts transient UI state. Every new session starts with an empty cart; existing orders stay attached to their original customer. Seller tenant switching is removed: changing tenants requires signing out and choosing another seller account. Valid seller store selection survives refresh. Navigation derives from the active session.

## Verification

Run from `apps/web`:

```sh
npm run build
npm run lint
npm test
```

`tests/rbac.test.js` covers the access matrix, identity and association validation, restoration, isolation, session changes and safe redirects. Existing customer/integration tests use explicit sessions and verify the new legacy-cart policy.

`tests/rbac.browser.mjs` runs real headless Chrome checks for direct guest redirects, guest cart clicks, correct/wrong-role login, refresh, logout/back, separate customer carts, seller tenant isolation, customer order isolation, invalid persisted sessions, redirect rejection, registration and keyboard focus. It checks login, registration, product, customer, seller and admin layouts at 320, 375, 430, 768, 1024, 1440 and 1920 pixels, including document overflow and mobile redirects.

Provide Playwright through your environment (or install it locally without saving) and run:

```sh
npm run dev -- --host 127.0.0.1
# In another terminal:
WEB_URL=http://127.0.0.1:5173 npm run test:browser
```

Optional environment variables: `PLAYWRIGHT_MODULE` (module path when externally installed), `CHROME_PATH` (defaults to `/usr/bin/google-chrome`), and `SCREENSHOT_DIR` (existing directory for 375px/1440px login screenshots). The browser suite is separate from the Node test command because it requires a running frontend, Playwright and Chrome.

Verification on this implementation: build, lint, all five Node test files, and 31 Chrome checks passed. Chrome reported no runtime errors and no document overflow at the seven requested widths. This is representative viewport/interaction coverage, not a full assistive-technology audit.

## Changed files

- `src/auth/model.js`, `src/auth/Routes.jsx`: session validation, redirect policy, nested guards and 403 UI.
- `src/App.jsx`: route grouping, 404, focus and transient session boundaries.
- `src/platform/persistence.js`, `src/platform/DemoControls.jsx`: restoration and session navigation.
- `src/context/CartProvider.jsx`: cart authorization and guest login handling.
- `src/customer/Pages.jsx`, `src/customer/model.js`: account selection, registration, logout and order isolation.
- `src/components/Marketplace.jsx`: role-aware public navigation.
- `src/seller/Provider.jsx`, `src/seller/UI.jsx`, `src/admin/Layout.jsx`: tenant scope and accessible workspace links.
- `tests/customer.test.js`, `tests/integration.test.js`, `tests/rbac.test.js`, `tests/rbac.browser.mjs`: regression and browser checks.
- `package.json`: browser test command.
- `DEMO_RBAC.md`: architecture, access matrix, verification and limitations.

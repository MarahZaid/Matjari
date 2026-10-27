# Testing and verification

[Documentation index](../README.md)

## Commands

Run from the repository root after installing dependencies:

```bash
npm run build --prefix apps/web
npm run lint --prefix apps/web
npm test --prefix apps/web
```

Build runs Vite and writes `apps/web/dist`. Lint runs `eslint .` inside the frontend. Test runs `node --test tests/*.test.js`. There is no root test script, backend test script, coverage script or dedicated type-check script.

## Existing automated checks

| File | Main checks |
| --- | --- |
| `seller.test.js` | Tenant/store scope, product validation, inventory, sales and order rules |
| `admin.test.js` | Platform aggregates, filters, pagination, statuses and sample events |
| `integration.test.js` | Shared graph, public visibility, cart, persistence/recovery/reset and separate currencies |
| `customer.test.js` | Contact validation, ownership, atomic checkout, duplicate references, stock and order snapshots |
| `rbac.test.js` | Access matrix, sessions, safe redirects, protected cart and tenant/customer isolation |
| `theme.test.js` | Default preference, persistence, blocked storage and independence from demo reset |

These files use Node assertions. The runner reports each file as one subtest; six passing files do not mean there are only six individual assertions. No coverage percentage is measured.

## Optional browser suites

The scripts require a running frontend, an installed Playwright module and Google Chrome. Neither Playwright nor Chrome is installed by the frontend package. Supply them through your environment. In one terminal:

```bash
npm run dev --prefix apps/web -- --host 127.0.0.1 --port 5180
```

In another terminal, use the actual URL printed by Vite:

```bash
WEB_URL=http://127.0.0.1:5180 PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs npm run test:browser --prefix apps/web
WEB_URL=http://127.0.0.1:5180 PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs npm run test:polish --prefix apps/web
```

Replace the module path with a real installation. If Playwright resolves normally, omit `PLAYWRIGHT_MODULE`. `CHROME_PATH` overrides `/usr/bin/google-chrome`. `SCREENSHOT_DIR` saves selected screenshots to an existing directory; `TRACE_QA=1` logs polish-suite navigation. Set WEB_URL explicitly: RBAC defaults to port 5173, polish to 5180.

The RBAC suite checks guest redirects, explicit cart confirmation, right/wrong-role navigation, reload, logout/back, registration, invalid sessions, safe redirects and foreign tenant/customer IDs. The polish suite checks the cross-role shopping workflow, both themes, responsive layouts, dialogs, reset/storage failures and representative token contrast. It blocks external photographs/fonts to exercise deterministic fallbacks.

## Manual end-to-end checklist

1. As a guest, browse/search/filter stores and products. Try Add to Cart: verify login occurs without changing the cart.
2. Select a customer, return to the product and add explicitly. Change bag quantities and complete shipping, review and demo checkout.
3. Check confirmation, separate store/currency orders, inventory deduction, history and current-status progress. Reload the confirmation.
4. Sign out and log in as the order store's seller. Test All Stores and one store, then search the order and advance status.
5. Log in as the original customer and verify the updated status. Try another customer's order URL and confirm it is unavailable.
6. As admin, inspect tenant/store details, analytics and sample monitoring. Suspend/restore a store and tenant and check public visibility.
7. Test wrong-role branches for 403 UI, guest deep links for login, unknown paths for 404 UI, unsafe `next` values for safe fallback, and logout followed by browser Back.
8. Check reset cancellation, confirmed reset, malformed/blocked storage and reload persistence. Confirm theme survives reset and sign-out.

Use both themes at widths **320, 375, 430, 768, 1024, 1440 and 1920px**, plus portrait/landscape tablet sizes. Check page overflow, table-region scrolling, mobile menus, dialog bounds, visible focus, Escape/focus return and readable status text. See [user flows](USER_FLOWS.md).

## Results from this documentation task

Verified on October 27, 2026 using Node 22.23.2 and npm 10.9.8:

- `npm run build --prefix apps/web`: passed.
- `npm run lint --prefix apps/web`: passed.
- `npm test --prefix apps/web`: passed, all six files, zero failures.

- `npm ci --prefix apps/web --offline`: passed using the existing npm cache with normal install scripts. Online package downloads were not tested.
- `npm run dev --prefix apps/web -- --host 127.0.0.1 --port 5180`: started at `http://127.0.0.1:5182` because 5180 and 5181 were occupied, confirming automatic port fallback.
- `npm run preview --prefix apps/web -- --host 127.0.0.1`: started at port 4173; `/` and `/admin/dashboard` returned HTTP 200. This checks local serving, not Vercel deployment.
- `test:browser` with `WEB_URL=http://127.0.0.1:5182` and the existing Playwright module at `/tmp/matjari-browser/node_modules/playwright/index.mjs`: passed all 31 checks with no runtime errors.
- `test:polish` with the same WEB_URL and Playwright module: passed 19 groups, including 336 route/theme/width checks, the full cross-role workflow, portrait/landscape tablet dashboards, reset cancellation/confirmation and unavailable storage. No uncaught runtime exceptions.
- All 77 repository Markdown relative link targets exist; the 75 internal links in the current guides also passed anchor checks. Route paths were compared with literal definitions and the five generated admin routes. The permission matrix was checked against guards and the passing RBAC tests.

The sandbox initially blocked local port binding with EPERM; development/preview servers and browser checks ran with approved local execution. Cloning, online installation and hosted Vercel behavior were not executed. No new test dependencies were added.

## Historical evidence and limits

[Phase 4](../../apps/web/PHASE4.md), [Phase 5](../../apps/web/PHASE5.md), [RBAC](../../apps/web/DEMO_RBAC.md) and [Phase 6](../../apps/web/PHASE6.md) contain prior execution reports. Phase 6 records 31 RBAC Chrome checks and 336 route/theme/width checks. Those report entries are historical evidence; the separate results above record the fresh executions during this documentation task. Earlier report behavior can be superseded: Phase 4 had unguarded roles, and Phase 5 used a demo password field that Phase 5.1 removed.

There is no API/database integration testing, payment/shipping-provider testing, cross-tab concurrency guarantee, physical-device coverage, Firefox/Safari coverage or full screen-reader/accessibility certification. Frontend guards cannot establish production security. Browser dependency paths and live hosting require verification in the target environment.

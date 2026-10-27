# Matjari frontend developer guide

The React/Vite frontend provides a completed browser demo of marketplace, customer, seller and admin workflows. The shared data graph is local; no backend, database, authentication or payment provider is connected. See the [project overview](../../README.md) and [documentation index](../../docs/README.md).

## Directory structure

```text
apps/web/
├── public/             # Favicon and icon sprite
├── src/
│   ├── admin/          # Platform layout, pages and model helpers
│   ├── auth/           # Session model and route guards
│   ├── components/     # Shared marketplace UI
│   ├── context/        # Cart context and provider
│   ├── customer/       # Demo auth, profile, checkout and orders
│   ├── data/           # Base marketplace seed
│   ├── pages/          # Public marketplace and cart pages
│   ├── platform/       # Shared state, persistence and selectors
│   ├── seller/         # Tenant-scoped workspace and mutations
│   ├── services/       # Catalog/cart helpers
│   ├── theme/          # Theme preference and toggle
│   ├── App.jsx         # Router and provider composition
│   └── index.css       # Shared tokens and theme rules
├── tests/              # Node assertions and optional Chrome suites
├── index.html          # Entry document and early theme initialization
├── vite.config.js      # Vite React plugin
└── vercel.json         # SPA deep-link rewrite
```

## Install and run

Use the [root prerequisites](../../README.md#prerequisites). Commands here run from the repository root:

```bash
npm ci --prefix apps/web
npm run dev --prefix apps/web
```

Vite normally serves `http://localhost:5173` and selects another port if occupied. Open the printed URL. To bind a specific local interface/port:

```bash
npm run dev --prefix apps/web -- --host 127.0.0.1 --port 5180
```

`npm install --prefix apps/web` is available when intentionally updating dependencies. The lockfile install is preferred for a repeatable checkout. There is no required `.env` file or API process.

## Build, lint and tests

```bash
npm run build --prefix apps/web
npm run preview --prefix apps/web -- --host 127.0.0.1
npm run lint --prefix apps/web
npm test --prefix apps/web
```

Build writes `apps/web/dist`; preview normally uses port 4173. The Node test command runs six test files. Browser scripts `test:browser` and `test:polish` require a running frontend and externally supplied Playwright/Chrome. See [testing](../../docs/frontend/TESTING.md) for exact commands, environment variables, results and limitations.

## Demo login and state reset

At `/login`, select a customer, a seller for a specific tenant, or Platform Admin Demo. No password is requested. `/register` adds a local customer using fictional contact details. Guests browse publicly, but cart/account/checkout require a customer. Seller/admin branches require their exact role; wrong-role sessions see 403 UI. A guest Add to Cart redirects without changing the bag; after customer login, add explicitly again.

Sign Out clears the session, cart and selected context while preserving orders and edits. Change seller tenants by signing out and choosing another seller. Customer order URLs/references resolve only owned orders. See [demo authentication and RBAC](../../docs/frontend/DEMO_AUTH_RBAC.md).

The `matjari-demo-v1` localStorage entry holds the versioned graph and session. **Reset Demo Data** asks for confirmation. Cancel preserves data; confirm restores the seed, removes created profiles/orders/edits and signs out. `matjari-theme` is independent and retained. Invalid saved data is preserved while a seed runs in memory; confirmed reset replaces it. Storage failures allow in-memory use with a notice. Use one active tab on one origin.

## Vercel settings

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Root Directory | `apps/web` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

[vercel.json](vercel.json) provides the SPA rewrite. Test direct visits and refreshes with each role after deployment. See the [deployment guide](../../docs/frontend/DEPLOYMENT.md) for asset checks and limitations. No live URL was verified in this documentation task.

## Troubleshooting

- **npm cannot find scripts:** run from the repository root with `--prefix apps/web`, or enter `apps/web` and omit the prefix.
- **Unsupported Node version:** match the locked tool requirements listed in the root prerequisites, then reinstall with `npm ci`.
- **Different demo records:** ports/domains are different origins and have separate storage.
- **Login redirect/403:** select the required role; admin does not inherit seller/customer tools.
- **Unexpected cart changes:** sign-out/new login clears the bag; availability and stock changes also revalidate it.
- **Saved-data notice:** reset only when replacing local edits is acceptable; blocked storage retains changes only in memory.
- **Browser tests cannot import Playwright:** supply an installed module path and Chrome as described in the testing guide.
- **Missing photos/fonts:** external HTTPS providers may be unavailable; check image and system-font fallbacks.

## Technical guides and reports

[Architecture](../../docs/frontend/ARCHITECTURE.md) · [Routes](../../docs/frontend/PAGES_AND_ROUTES.md) · [User flows](../../docs/frontend/USER_FLOWS.md) · [RBAC](../../docs/frontend/DEMO_AUTH_RBAC.md) · [Multi-tenant model](../../docs/frontend/MULTI_TENANT.md) · [Design system](../../docs/frontend/DESIGN_SYSTEM.md) · [Deployment](../../docs/frontend/DEPLOYMENT.md) · [Testing](../../docs/frontend/TESTING.md)

Preserved reports: [Phase 4](PHASE4.md), [Phase 5](PHASE5.md), [RBAC implementation](DEMO_RBAC.md), [Phase 6](PHASE6.md). They record earlier states and test executions; the current guides describe the implemented session-based policies.

Designed & Developed by Alaa Dere · Hiba Burhan · Marah Zaid · Shorouq Derieh
Advanced Database Systems — Fall 2026

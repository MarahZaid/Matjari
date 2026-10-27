# Matjari — Multi-Tenant eCommerce Platform

**[Live Demo](https://matjari-three.vercel.app/)**

Matjari is a multi-tenant, multi-store eCommerce project for **Advanced Database Systems — Fall 2026**. It demonstrates how a shared platform can serve independent businesses. Each business is a **tenant** and can own several **stores**. Stores contain products, inventory and orders.

The completed frontend demo supports three roles: **Customers** shop and view their own orders; **Sellers** manage the stores of one tenant; **Platform Admins** manage tenants and stores across the platform. Guests can browse without signing in.

All shopping and management actions use fictional browser data. The frontend is not connected to the API skeleton or a database.

## Main features

| Area | Implemented features |
| --- | --- |
| Customer | Product and store browsing, search and filters, protected shopping cart, demo checkout, order history and current-status tracking, local demo accounts and profile editing |
| Seller | Tenant-scoped dashboard, multi-store switching, store creation, product management, inventory updates, order management and sales overview |
| Admin | Platform overview, tenant and store management, analytics and sample monitoring events |
| Shared | Light/Dark themes, responsive layouts, demo role-based access control (RBAC), shared mock data and localStorage persistence |

Order tracking shows the current demo status, without shipment tracking numbers or delivery estimates. Checkout collects no payment.

## Technology stack

- **Implemented frontend:** React 19, React DOM, React Router 7, Vite 8, JavaScript/JSX, CSS, Lucide React icons, React Context and browser localStorage. ESLint and Node's built-in test runner support verification.
- **Existing backend skeleton:** Node.js, Express 5, CORS, dotenv and nodemon. The API contains an `/api/health` endpoint; it does not serve the frontend's commerce data.
- **Future course work:** backend/database integration is pending course decisions. MySQL, Redis, Elasticsearch and Kibana are not integrated. The monitoring UI names Elasticsearch/Kibana as future work; final backend and database scope remains subject to course decisions.

## Repository structure

```text
Matjari/
├── apps/
│   ├── api/                 # Express health-check skeleton
│   └── web/                 # React/Vite frontend
│       ├── public/          # Static icons
│       ├── src/             # Marketplace, customer, seller, admin and shared logic
│       ├── tests/           # Node and optional browser suites
│       ├── PHASE4.md        # Historical integration report
│       ├── PHASE5.md        # Historical customer report
│       ├── DEMO_RBAC.md     # Access-control report
│       ├── PHASE6.md        # Theme and QA report
│       └── vercel.json      # SPA rewrite
├── docs/                    # Documentation index and frontend guides
└── infrastructure/          # Placeholder; no deployment infrastructure yet
```

## Prerequisites

Install Git, Node.js and npm. Neither package declares a project-level `engines` or `packageManager` field. The locked frontend tools require Node **20.19+ on the 20.x line, 22.13+ on the 22.x line, or 24+**. This documentation task verified Node **22.23.2** and npm **10.9.8**. There is no explicit npm minimum in the project.

No database, API server or environment file is required for the frontend demo.

## Getting started

```bash
git clone https://github.com/MarahZaid/Matjari.git
cd Matjari
npm ci --prefix apps/web
npm run dev --prefix apps/web
```

Open the URL printed by Vite, normally `http://localhost:5173`. Vite chooses another port if the default is occupied. `npm install --prefix apps/web` is an alternative when intentionally updating dependencies; `npm ci` uses the committed lockfile for a repeatable install. There is no root npm workspace or root package script.

## Production build

```bash
npm run build --prefix apps/web
npm run preview --prefix apps/web
```

The build writes `apps/web/dist`. Preview normally opens at `http://localhost:4173`; use the printed URL.

## Testing

```bash
npm run lint --prefix apps/web
npm test --prefix apps/web
```

The six Node test files cover shared data, tenant/customer isolation, checkout, guards, persistence and themes. Optional browser suites require a running frontend plus externally supplied Playwright and Chrome. See [testing and verification](docs/frontend/TESTING.md) for commands, results and limits.

## Demo access

Start as a **Guest**, or open `/login` and select a **Customer Demo**, a tenant-associated **Seller Demo**, or **Platform Admin Demo**. No password is requested. `/register` creates a local customer profile using fictional details.

Customer login is required for cart, account and checkout. A guest's Add to Cart action returns to the product after customer login; press Add to Cart again. Sellers and admins receive an access-denied page for customer tools. Sign out before choosing a different role or seller tenant.

**Reset Demo Data** asks for confirmation and restores the seed, removes local edits and orders, signs out and clears the cart. Theme preference is retained. See [demo authentication and RBAC](docs/frontend/DEMO_AUTH_RBAC.md).

## Deployment

Live production URL: **[https://matjari-three.vercel.app/](https://matjari-three.vercel.app/)**. The deployed website is a frontend demo using mock data and browser localStorage; it is not connected to a backend or database.

The frontend supports Vercel deployment with `apps/web` as the Root Directory, Vite as the framework, `npm run build` as the Build Command and `dist` as the Output Directory. The repository includes a SPA rewrite for deep links. See the [deployment guide](docs/frontend/DEPLOYMENT.md).

## Project status

The frontend demo is completed. Backend/database integration is pending course decisions. Demo records and sessions are stored locally in the browser and are intended for one active tab. Frontend RBAC demonstrates access policies; it is not production authorization. There is no real authentication, payment processing, shipping integration, live telemetry or cross-device synchronization.

## Documentation

- [Documentation index](docs/README.md)
- [Frontend developer guide](apps/web/README.md)
- [Architecture](docs/frontend/ARCHITECTURE.md)
- [Pages and routes](docs/frontend/PAGES_AND_ROUTES.md)
- [User flows](docs/frontend/USER_FLOWS.md)
- [Demo authentication and RBAC](docs/frontend/DEMO_AUTH_RBAC.md)
- [Multi-tenant model](docs/frontend/MULTI_TENANT.md)
- [Design system](docs/frontend/DESIGN_SYSTEM.md)
- [Deployment](docs/frontend/DEPLOYMENT.md)
- [Testing](docs/frontend/TESTING.md)

## Team members

- Alaa Dere
- Hiba Burhan
- Marah Zaid
- Shorouq Derieh

**Advanced Database Systems — Fall 2026**

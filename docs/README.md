# Matjari documentation

These guides describe the current frontend demo, checked against the repository on October 27, 2026.

**[Live Demo](https://matjari-three.vercel.app/)** — frontend demo using mock data and browser localStorage. See the [deployment guide](frontend/DEPLOYMENT.md) for Vercel configuration and automatic redeployment.

## Frontend guides

| Guide | Contents |
| --- | --- |
| [Architecture](frontend/ARCHITECTURE.md) | Providers, state, selectors and persistence |
| [Pages and routes](frontend/PAGES_AND_ROUTES.md) | All route definitions, layouts and roles |
| [User flows](frontend/USER_FLOWS.md) | Shopping, seller operations and administration |
| [Demo authentication and RBAC](frontend/DEMO_AUTH_RBAC.md) | Session model, access matrix and isolation |
| [Multi-tenant model](frontend/MULTI_TENANT.md) | Tenant/store ownership and visibility |
| [Design system](frontend/DESIGN_SYSTEM.md) | Themes, tokens, components and accessibility |
| [Deployment](frontend/DEPLOYMENT.md) | Vercel settings, deep links and troubleshooting |
| [Testing](frontend/TESTING.md) | Commands, coverage, current results and limits |

See also the [project overview](../README.md) and [frontend developer guide](../apps/web/README.md).

## Existing implementation reports

Preserved reports record their implementation phase, not a new execution during this documentation task:

- [Phase 4: shared frontend integration](../apps/web/PHASE4.md)
- [Phase 5: customer shopping](../apps/web/PHASE5.md)
- [Phase 5.1: demo access control](../apps/web/DEMO_RBAC.md)
- [Phase 6: frontend polish and QA](../apps/web/PHASE6.md)

Phase 4's unguarded role controls, legacy cart import and customer selector were replaced by session-based guards. Phase 5's password field was removed in Phase 5.1. Use the current guides for setup and behavior; retain those older statements as historical context.

# Pages and routes

[Documentation index](../README.md)

Source of truth: [App.jsx](../../apps/web/src/App.jsx). Paths below are browser paths. `:id`, `:slug` and `:reference` are dynamic segments. “All” includes guests and every signed-in role. Customer Frame is page content inside CustomerLayout, not a separate router layout.

## Public marketplace

| Path | Component | Purpose | Role | Layout |
| --- | --- | --- | --- | --- |
| `/` | `Home` | Marketplace landing page | All | CustomerLayout |
| `/stores` | `Stores` | Store directory | All | CustomerLayout |
| `/stores/:slug` | `Storefront` → `Catalog` | Public store catalog | All | CustomerLayout |
| `/products` | `Catalog` | Search, filters and products | All | CustomerLayout |
| `/products/:id` | `ProductDetails` | Product information and cart action | All; cart action requires customer | CustomerLayout |

## Customer

| Path | Component | Purpose | Role | Layout |
| --- | --- | --- | --- | --- |
| `/account` | `Account` → `Profile` | Edit local profile, sign out | Customer | CustomerLayout + Frame |
| `/account/orders` | customer `Orders` → `OrderHistory` | Own order search/history | Customer | CustomerLayout + Frame |
| `/account/orders/:id` | customer `OrderDetails` | Own order details/progress | Customer | CustomerLayout + Frame |
| `/cart` | `Cart` | Protected bag and quantities | Customer | CustomerLayout |
| `/checkout` | `Checkout` | Shipping, review and demo submission | Customer | CustomerLayout + Frame |
| `/checkout/confirmation/:reference` | `Confirmation` | Own checkout's store/currency orders | Customer | CustomerLayout + Frame |
| `/orders` | `Navigate` | Redirect to `/account/orders` | Target requires customer | CustomerLayout |

## Seller

These pages are inside SellerProvider. Every read/mutation is limited to the seller's tenant and valid store selection.

| Path | Component | Purpose | Role | Layout |
| --- | --- | --- | --- | --- |
| `/seller` | index `Navigate` | Redirect to `/seller/dashboard` | Seller | SellerLayout |
| `/seller/dashboard` | `Dashboard` | Scoped sales and overview | Seller | SellerLayout |
| `/seller/stores` | seller `Stores` | View/create owned stores | Seller | SellerLayout |
| `/seller/products` | seller `Products` | Add/edit products | Seller | SellerLayout |
| `/seller/inventory` | `Inventory` | Stock management | Seller | SellerLayout |
| `/seller/orders` | seller `Orders` | Scoped order search/list | Seller | SellerLayout |
| `/seller/orders/:id` | seller `OrderDetails` | Order details and status updates | Seller | SellerLayout |

## Admin

`AdminPage` is the default export from `admin/Pages.jsx`, configured by its `page` prop.

| Path | Component | Purpose | Role | Layout |
| --- | --- | --- | --- | --- |
| `/admin` | index `Navigate` | Redirect to `/admin/dashboard` | Admin | AdminLayout |
| `/admin/dashboard` | `AdminPage(page="dashboard")` | Platform summary | Admin | AdminLayout |
| `/admin/tenants` | `AdminPage(page="tenants")` | Tenant details/status management | Admin | AdminLayout |
| `/admin/stores` | `AdminPage(page="stores")` | Platform store details/status management | Admin | AdminLayout |
| `/admin/analytics` | `AdminPage(page="analytics")` | Demo charts and aggregates | Admin | AdminLayout |
| `/admin/monitoring` | `AdminPage(page="monitoring")` | Filter sample events | Admin | AdminLayout |

## Authentication

| Path | Component | Purpose | Role | Layout |
| --- | --- | --- | --- | --- |
| `/login` | `Auth` | Select a demo account | Guest | CustomerLayout + Frame |
| `/register` | `Auth(register)` | Create a local customer | Guest | CustomerLayout + Frame |

Signed-in visitors are redirected by GuestOnly to a permitted `next` destination or their role home. See [redirect policy](DEMO_AUTH_RBAC.md).

## Error and fallback behavior

| Path or condition | Component/state | Access | Layout |
| --- | --- | --- | --- |
| `/seller/*` unmatched child | `NotFound` | Seller guard first | SellerLayout |
| `/admin/*` unmatched child | `NotFound` | Admin guard first | AdminLayout |
| `/account/*` unmatched child | `NotFound` | Customer guard first | CustomerLayout |
| Global `*` | `NotFound` | All | CustomerLayout |
| Missing/hidden store slug | `NotFound(store)` | All | CustomerLayout |
| Missing/hidden product ID | Product unavailable state | All | CustomerLayout |
| Foreign/missing customer order or reference | Unavailable state in details/confirmation | Customer | CustomerLayout + Frame |
| Foreign/missing seller order | Unavailable state in seller details | Seller | SellerLayout |
| Wrong role on a protected branch | `AccessDenied` (403 UI) | Any signed-in wrong role | Guard renders before branch layout; customer branch retains CustomerLayout |
| Guest on a protected branch | Redirect to `/login?next=...` | Guest | Authentication layout after redirect |

There are no dedicated `/403` or `/404` routes. Error labels are frontend UI states, not server HTTP status codes. `/orders` first redirects to customer history; that destination runs the customer guard.

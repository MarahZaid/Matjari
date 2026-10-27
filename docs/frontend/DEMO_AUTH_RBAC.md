# Demo authentication and RBAC

[Documentation index](../README.md)

This frontend demonstrates access policies. Bundled records and localStorage are inspectable and editable. Real backend identity verification and authorization are required before handling private data.

## Session model and login

[auth/model.js](../../apps/web/src/auth/model.js) defines sessions with `userId`, `role`, `displayName`, and the role-specific `customerId` or `tenantId`. `accounts(data)` builds customers from local profiles, sellers from active tenants, and one Platform Admin Demo. `sessionFor` validates identity, role, customer/tenant association, display-name type and allowed session keys. Missing or invalid sessions are guests.

`/login` selects an available fictional account; there is no password or credential check. `/register` validates fictional name/email/optional phone, rejects duplicate customer emails, creates only a local customer and signs in. A seller account belongs to one tenant. Changing tenant requires sign-out and another seller login.

## Route-permission matrix

| Route/action | Guest | Customer | Seller | Admin |
| --- | --- | --- | --- | --- |
| Marketplace, stores and products | Allow | Allow | Allow | Allow |
| Login/register | Allow | Permitted next destination or own home | Permitted next destination or own home | Permitted next destination or own home |
| Cart, checkout, account, history and confirmations | Login | Own data | 403 | 403 |
| Seller branch | Login | 403 | Own tenant/stores | 403 |
| Admin branch | Login | 403 | 403 | Platform access |
| Add to Cart | Login, no mutation | Validate and add | Navigate to cart's 403 | Navigate to cart's 403 |

`/orders` redirects to `/account/orders`, which runs the customer guard. Admin does not inherit seller or customer route access. See [route inventory](PAGES_AND_ROUTES.md) for fallback routes.

## Guards and redirects

[auth/Routes.jsx](../../apps/web/src/auth/Routes.jsx) uses RequireRole for customer, seller and admin branches. A guest is redirected to login with the original path, query and hash encoded in `next`. A signed-in wrong role sees AccessDenied with a 403 label and a link to their allowed home. There is no `/403` route or server-side 403 response. GuestOnly redirects signed-in visitors away from login/register.

`safeDestination` accepts only internal permitted paths. It rejects external/protocol-relative URLs, backslashes, whitespace/control characters, percent-encoded paths and dot segments. Public product/store destinations and role-matching protected paths are permitted; otherwise the role home is used: customer `/account`, seller `/seller/dashboard`, admin `/admin/dashboard`. This is a redirect policy, not a resource-existence check.

## Protected Cart policy

All Add to Cart buttons use CartProvider. Guest attempts do not mutate the cart and return to the product after customer login. The customer must explicitly add again. Cart mutations recheck customer role, public product availability, integer quantities and stock. Sellers/admins are sent to the cart route's access-denied UI. Each session change starts with an empty cart; carts are not separate saved bags for each customer.

## Persistence, logout and isolation

The session is saved within `matjari-demo-v1`. Restoration validates the graph and session synchronously before protected content mounts. Invalid sessions become guests, and unowned carts are discarded. A valid seller's owned store selection survives refresh. Corrupt/unsupported graph data triggers the recovery notice and an in-memory seed without overwriting the saved copy.

Sign Out clears session, cart and customer/tenant/store context and resets transient identity-bound UI. Orders remain associated with their original customer. Theme preference remains independent.

SellerProvider derives tenant identity from the validated session and scopes stores, products, orders and mutations by tenant and valid store. Suspended stores remain manageable by their seller. A suspended tenant is excluded from available seller accounts and its saved session becomes invalid.

Customer model selectors validate the active customer before filtering orders or resolving confirmation references. Foreign order IDs/references show unavailable states. These checks model isolation in the frontend only; they do not make browser data private.

See [testing](TESTING.md) for model tests and optional browser guard checks.

export const homeFor = role => ({ customer: '/account', seller: '/seller/dashboard', admin: '/admin/dashboard' })[role] || '/';
export function accounts(data) {
  return [...data.customers.map(c => ({ userId: c.id, role: 'customer', displayName: c.name, customerId: c.id })), ...data.tenants.filter(t => t.status === 'active').map((t, i) => ({ userId: `seller-${t.id}`, role: 'seller', displayName: `Seller Demo — Tenant ${String.fromCharCode(65 + i)}`, tenantId: t.id })), { userId: 'platform-admin', role: 'admin', displayName: 'Platform Admin Demo' }];
}
export function sessionFor(data) {
  const s = data.session;
  if (!s || typeof s !== 'object') return null;
  const account = accounts(data).find(a => a.userId === s.userId && a.role === s.role);
  if (!account || s.customerId !== account.customerId || s.tenantId !== account.tenantId || typeof s.displayName !== 'string' || Object.keys(s).some(k => !['userId','role','displayName','customerId','tenantId'].includes(k))) return null;
  return account;
}
export function enterSession(data, account) {
  const session = account ? sessionFor({ ...data, session: account }) : null;
  return { ...data, session, cart: [], context: { ...data.context, signedIn: !!session, role: session?.role || 'guest', customerId: session?.customerId || null, tenantId: session?.tenantId || null, storeId: 'all' } };
}
export function routeRole(path) {
  if (/^\/seller(?:\/|$)/.test(path)) return 'seller';
  if (/^\/admin(?:\/|$)/.test(path)) return 'admin';
  if (/^\/(?:cart|checkout|account|orders)(?:\/|$)/.test(path)) return 'customer';
  return null;
}
export function safeDestination(value, role) {
  // eslint-disable-next-line no-control-regex
  if (typeof value !== 'string' || !value.startsWith('/') || /[\\\s\u0000-\u001f%]/.test(value) || value.startsWith('//')) return homeFor(role);
  const path = value.split(/[?#]/)[0];
  if (path.split('/').some(segment => segment === '.' || segment === '..')) return homeFor(role);
  if (routeRole(path) === role || /^\/(?:products(?:\/[^/]+)?|stores(?:\/[^/]+)?)?$/.test(path)) return value;
  return homeFor(role);
}
export function access(data, role) {
  const session = sessionFor(data);
  return !session ? 'login' : session.role === role ? 'allow' : 'denied';
}

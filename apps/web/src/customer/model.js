import { sessionFor } from '../auth/model.js';
import { publicProducts, customerOrders } from '../platform/selectors.js';
export const sessionCustomer = d => sessionFor(d)?.role === 'customer' ? d.customers.find(c => c.id === sessionFor(d).customerId) : null;
export function validateContact(v) {
  if (!v.name?.trim() || v.name.length > 100) return 'Enter a name of up to 100 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email || '') || v.email.length > 160) return 'Enter a valid demo email.';
  if (v.phone && !/^[+\d ()-]{5,30}$/.test(v.phone)) return 'Enter a valid phone or leave it blank.';
  return '';
}
export function visibleOrders(d, id, search = '', status = '', sort = 'newest') {
  if (sessionCustomer(d)?.id !== id) return [];
  return customerOrders(d, id).filter(o => o.number.toLowerCase().includes(search.toLowerCase()) && (!status || o.status === status)).sort((a,b) => (sort === 'oldest' ? 1 : -1) * (a.date.localeCompare(b.date) || (a.createdAt || a.id).localeCompare(b.createdAt || b.id)));
}
export function confirmationOrders(d, reference) {
  const c = sessionCustomer(d);
  return c ? customerOrders(d, c.id).filter(o => o.checkoutReference === reference) : [];
}
export function placeCheckout(d, request) {
  const fail = error => ({ data: d, error });
  const customer = sessionCustomer(d);
  if (!customer) return fail('Sign in to a demo account before checkout.');
  if (!request.reference || typeof request.reference !== 'string') return fail('Missing checkout reference.');
  const existing = d.orders.filter(o => o.checkoutReference === request.reference);
  if (existing.length) return existing.every(o => o.customerId === customer.id) ? { data: d, reference: request.reference } : fail('Checkout reference unavailable.');
  const contactError = validateContact(request);
  if (contactError) return fail(contactError);
  if (!['line1','city','country'].every(k => typeof request[k] === 'string' && request[k].trim() && request[k].length <= 160)) return fail('Enter a street address, city and country (up to 160 characters each).');
  if (!d.cart.length) return fail('Your bag is empty.');
  const available = publicProducts(d), seen = new Set(), groups = new Map();
  for (const row of d.cart) {
    const p = available.find(p => p.id === row.id);
    if (!p || seen.has(row.id) || !Number.isSafeInteger(row.quantity) || row.quantity < 1 || row.quantity > p.stock) return fail('Your bag changed or an item is unavailable. Review quantities in your bag.');
    seen.add(row.id);
    const key = p.storeId + ':' + p.currency;
    if (!groups.has(key)) groups.set(key, { storeId: p.storeId, tenantId: p.tenantId, currency: p.currency, items: [] });
    groups.get(key).items.push({ productId: p.id, name: p.name, quantity: row.quantity, price: p.price });
  }
  const now = new Date().toISOString();
  const orders = [...groups.values()].map((group, i) => {
    const subtotal = Math.round(group.items.reduce((n, p) => n + p.price * p.quantity, 0) * 100) / 100;
    const id = request.reference + '-' + (i + 1);
    return { ...group, id, number: 'MT-' + id, customerId: customer.id, customer: request.name.trim(), email: request.email.trim(), phone: request.phone || '', address: [request.line1, request.city, request.country].map(s => s.trim()).join(', '), date: now.slice(0,10), createdAt: now, status: 'pending', subtotal, shipping: 0, discount: 0, total: subtotal, paymentMethod: 'Demo cash on delivery — no payment collected', checkoutReference: request.reference };
  });
  if (orders.some(o => d.orders.some(old => old.id === o.id))) return fail('Checkout reference unavailable.');
  return { reference: request.reference, data: { ...d, orders: [...orders, ...d.orders], products: d.products.map(p => ({ ...p, stock: p.stock - (d.cart.find(r => r.id === p.id)?.quantity || 0) })), cart: [] } };
}

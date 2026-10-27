import { seed, tenants, sales } from '../seller/data.js';
export const eventTypes = ['page_view', 'product_view', 'search', 'add_to_cart', 'remove_from_cart', 'checkout_started', 'order_placed'];
export function adminSeed() {
  const data = seed();
  return { ...data,
    tenants: tenants.map((t, i) => ({ ...t, plan: ['pro', 'enterprise', 'basic', 'pro'][i], country: ['Palestine', 'Jordan', 'Palestine', 'United States'][i], created: `2026-0${i + 5}-12`, status: 'active' })),
    stores: data.stores.map((s, i) => ({ ...s, created: `2026-0${i + 4}-18` })),
    events: Array.from({ length: 84 }, (_, i) => { const s = data.stores[i % data.stores.length]; return { id: `ev${i + 1}`, type: eventTypes[i % 7], tenantId: s.tenantId, storeId: s.id, timestamp: `2026-10-${String(1 + i % 27).padStart(2, '0')}T${String(8 + i % 12).padStart(2, '0')}:15:00Z`, message: ['Marketplace visit', 'Product detail opened', 'Search: everyday essentials', 'Item added to bag', 'Item removed from bag', 'Checkout opened', 'Demo order submitted'][i % 7] }; }) };
}
export const group = (rows, key) => Object.entries(rows.reduce((a, r) => ({ ...a, [r[key]]: (a[r[key]] || 0) + 1 }), {}));
export const summary = d => ({ 'Total tenants': d.tenants.length, 'Total stores': d.stores.length, 'Total products': d.products.length, 'Total orders': d.orders.length, 'Active stores': d.stores.filter(s => s.status === 'active').length, 'Suspended stores': d.stores.filter(s => s.status === 'suspended').length });
export const counts = (d, kind, id) => ({ stores: d.stores.filter(s => s.tenantId === id).length, products: d.products.filter(p => p[kind === 'tenants' ? 'tenantId' : 'storeId'] === id).length, orders: d.orders.filter(o => o[kind === 'tenants' ? 'tenantId' : 'storeId'] === id).length });
export function query(rows, { search = '', status = '', plan = '', tenantId = '', type = '', sort = 'name', direction = 'asc' } = {}) {
  return rows.filter(r => `${r.name || ''} ${r.id} ${r.message || ''} ${r.tenantId || ''} ${r.storeId || ''}`.toLowerCase().includes(search.toLowerCase().trim()) && (!status || r.status === status) && (!plan || r.plan === plan) && (!tenantId || r.tenantId === tenantId) && (!type || r.type === type)).sort((a, b) => String(a[sort] || '').localeCompare(String(b[sort] || '')) * (direction === 'asc' ? 1 : -1));
}
export function paginate(rows, page, size = 5) { return rows.slice((page - 1) * size, page * size); }
export function changeStatus(data, kind, id, status) {
  if (!['tenants', 'stores'].includes(kind) || !['active', 'suspended'].includes(status) || !data[kind].some(r => r.id === id)) throw new Error('Unable to update this demo record.');
  return { ...data, [kind]: data[kind].map(r => r.id === id ? { ...r, status } : r) };
}
export const inRange = (rows, start, end, key = 'date') => rows.filter(r => (!start || r[key].slice(0, 10) >= start) && (!end || r[key].slice(0, 10) <= end));
export const currencySales = sales;

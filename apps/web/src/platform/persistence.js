import { adminSeed } from '../admin/data.js';
import { validateCart } from '../services/catalog.js';
import { publicProducts } from './selectors.js';
import { statuses } from '../seller/data.js';
export const STORAGE_KEY = 'matjari-demo-v1';
export const VERSION = 1;
// Resolve storage inside these methods: accessing localStorage itself may throw.
export const browserStorage = {
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
export const roles = ['customer', 'seller', 'admin'];
export function createDemo() {
  const data = adminSeed();
  const customers = Array.from({ length: 5 }, (_, i) => ({ id: `c${i + 1}`, name: data.orders[i].customer, email: `demo${i + 1}@example.com` }));
  return { ...data, customers, orders: data.orders.map((o, i) => ({ ...o, customerId: customers[i % 5].id })), context: { tenantId: 't1', storeId: 'all', role: 'customer', customerId: 'c1' }, cart: [] };
}
const text = v => typeof v === 'string' && v.trim().length > 0;
const amount = v => Number.isFinite(v) && v >= 0;
const currency = v => ['USD', 'EUR', 'ILS'].includes(v);
const status = v => ['active', 'suspended'].includes(v);
export function validDemo(d) {
  try {
    if (!d || !['tenants','stores','products','customers','orders','events','cart'].every(k => Array.isArray(d[k]))) return false;
    for (const key of ['tenants','stores','products','customers','orders','events']) {
      if (!d[key].every(r => r && text(r.id)) || new Set(d[key].map(r => r.id)).size !== d[key].length) return false;
    }
    const tenant = id => d.tenants.find(t => t.id === id);
    const store = r => d.stores.find(s => s.id === r.storeId && s.tenantId === r.tenantId);
    if (!d.tenants.length || !d.customers.length || !d.tenants.every(t => text(t.name) && status(t.status))) return false;
    if (!d.stores.every(s => tenant(s.tenantId) && text(s.name) && text(s.slug) && typeof s.description === 'string' && text(s.category) && currency(s.currency) && status(s.status)) || new Set(d.stores.map(s => s.slug)).size !== d.stores.length) return false;
    if (!d.products.every(p => store(p) && text(p.name) && text(p.sku) && text(p.category) && typeof p.active === 'boolean' && currency(p.currency) && amount(p.price) && Number.isSafeInteger(p.stock) && p.stock >= 0)) return false;
    if (!d.customers.every(c => text(c.name) && text(c.email) && (c.phone === undefined || typeof c.phone === 'string'))) return false;
    if (d.context?.signedIn !== undefined && typeof d.context.signedIn !== 'boolean') return false;
    if (!d.orders.every(o => o.checkoutReference === undefined || (text(o.checkoutReference) && text(o.address) && text(o.email) && text(o.paymentMethod)))) return false;
    if (!d.orders.every(o => store(o) && d.customers.some(c => c.id === o.customerId) && text(o.number) && text(o.customer) && /^\d{4}-\d{2}-\d{2}$/.test(o.date) && statuses.includes(o.status) && currency(o.currency) && ['subtotal','shipping','discount','total'].every(k => amount(o[k])) && Array.isArray(o.items) && o.items.length && o.items.every(i => d.products.some(p => p.id === i.productId && p.storeId === o.storeId) && text(i.name) && amount(i.price) && Number.isSafeInteger(i.quantity) && i.quantity > 0) && Math.abs(o.subtotal - o.items.reduce((n,i) => n + i.price * i.quantity,0)) < 0.001 && Math.abs(o.total - o.subtotal - o.shipping + o.discount) < 0.001)) return false;
    if (!d.events.every(e => store(e) && text(e.type) && text(e.message) && Number.isFinite(Date.parse(e.timestamp)))) return false;
    return !!(d.context && tenant(d.context.tenantId) && (d.context.storeId === 'all' || d.stores.some(s => s.id === d.context.storeId && s.tenantId === d.context.tenantId)) && roles.includes(d.context.role) && d.customers.some(c => c.id === d.context.customerId) && d.cart.every(i => text(i.id) && Number.isSafeInteger(i.quantity) && i.quantity > 0));
  } catch { return false; }
}
export function loadDemo(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = createDemo();
      // Import older frontend preferences once; keep the old keys untouched.
      const oldStore = storage.getItem('matjari-seller-store');
      if (data.stores.some(s => s.id === oldStore && s.tenantId === data.context.tenantId)) data.context.storeId = oldStore;
      try { data.cart = validateCart(JSON.parse(storage.getItem('matjari-cart') || '[]'), publicProducts(data)); } catch { /* Ignore malformed legacy cart only. */ }
      return { data, writable: true, message: '' };
    }
    const saved = JSON.parse(raw);
    if (saved.version !== VERSION || !validDemo(saved.data)) throw new Error('Invalid demo');
    return { data: saved.data, writable: true, message: '' };
  } catch {
    return { data: createDemo(), writable: false, message: 'Saved demo data could not be loaded. Using the seed in memory. Reset Demo Data to replace the saved copy.' };
  }
}
export function saveDemo(storage, data) {
  if (!validDemo(data)) return false;
  try { storage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, data })); return true; } catch { return false; }
}
export function resetDemo(storage) {
  const data = createDemo();
  return { data, saved: saveDemo(storage, data) };
}

import { tenants, stores, products } from '../data/marketplace.js';
export { tenants };
export const statuses = ['pending', 'paid', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded'];
export const transitions = {
  pending: ['paid', 'cancelled'],
  paid: ['fulfilled', 'refunded'],
  fulfilled: ['shipped', 'refunded'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: []
};
export const threshold = 5;
export const storesByTenant = (all, tenantId) => all.filter(s => s.tenantId === tenantId);
export const validStore = (all, tenantId, storeId) => storeId === 'all' || storesByTenant(all, tenantId).some(s => s.id === storeId);
export const scoped = (rows, allStores, tenantId, storeId = 'all') => validStore(allStores, tenantId, storeId) ? rows.filter(r => r.tenantId === tenantId && storesByTenant(allStores, tenantId).some(s => s.id === r.storeId) && (storeId === 'all' || r.storeId === storeId)) : [];
export const inventory = rows => ({
  inStock: rows.filter(p => p.stock > threshold).length,
  low: rows.filter(p => p.stock > 0 && p.stock <= threshold).length,
  out: rows.filter(p => p.stock === 0).length
});
export const sales = orders => orders.filter(o => !['pending', 'cancelled', 'refunded'].includes(o.status)).reduce((a, o) => ({
  ...a,
  [o.currency]: (a[o.currency] || 0) + o.total
}), {});
export const filterProducts = (rows, {
  search = '',
  category = '',
  status = '',
  store = '',
  sort = 'name'
} = {}) => rows.filter(p => `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase()) && (!category || p.category === category) && (!status || String(p.active) === status) && (!store || p.storeId === store)).sort((a, b) => sort === 'stock' ? a.stock - b.stock : sort === 'price' ? a.currency.localeCompare(b.currency) || a.price - b.price : a.name.localeCompare(b.name));
export const filterOrders = (rows, search = '', status = '', store = '') => rows.filter(o => `${o.number} ${o.customer}`.toLowerCase().includes(search.toLowerCase()) && (!status || o.status === status) && (!store || o.storeId === store));
export function seed() {
  const sellerStores = stores.map(s => ({
    ...s,
    currency: s.id === 's4' || s.id === 's6' ? 'ILS' : s.id === 's5' ? 'EUR' : 'USD',
    status: 'active'
  }));
  const extra = ['Mechanical Keyboard', 'Organic Cotton T-shirt', 'Reading Light', 'Wool Scarf'].map((name, i) => ({
    ...products[i % 2],
    id: `p${27 + i}`,
    name,
    stock: i * 2,
    price: 25 + i * 12
  }));
  const sellerProducts = [...products, ...extra].map((p, i) => ({
    ...p,
    sku: `MAT-${String(i + 1).padStart(4, '0')}`,
    stock: i === 4 ? 3 : p.stock
  }));
  const orders = Array.from({
    length: 35
  }, (_, i) => {
    const p = sellerProducts[i % sellerProducts.length],
      quantity = i % 3 + 1,
      subtotal = p.price * quantity,
      shipping = 5,
      discount = i % 4 === 0 ? 5 : 0;
    return {
      id: `o${i + 1}`,
      number: `MT-${1040 + i}`,
      storeId: p.storeId,
      tenantId: p.tenantId,
      customer: ['Lina Hassan', 'Omar Khalil', 'Sara Nasser', 'Adam Saleh', 'Maya Ali'][i % 5],
      email: `customer${i + 1}@example.com`,
      address: '24 Olive Street, Ramallah',
      date: `2026-10-${String(1 + i % 27).padStart(2, '0')}`,
      status: statuses[i % 7],
      currency: p.currency,
      items: [{
        productId: p.id,
        name: p.name,
        quantity,
        price: p.price
      }],
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount
    };
  });
  return {
    stores: sellerStores,
    products: sellerProducts,
    orders
  };
}
export function validateProduct(p, all, tenantId, products) {
  if (!p.name.trim() || !p.sku.trim() || !p.category.trim()) return 'Title, SKU, and category are required.';
  if (!validStore(all, tenantId, p.storeId) || p.storeId === 'all') return 'Choose an authorized store.';
  if (p.price === '' || !Number.isFinite(Number(p.price)) || Number(p.price) < 0) return 'Enter a valid non-negative price.';
  if (p.stock === '' || !Number.isSafeInteger(Number(p.stock)) || Number(p.stock) < 0) return 'Stock must be a non-negative whole number.';
  if (products.some(x => x.id !== p.id && x.storeId === p.storeId && x.sku.toLowerCase() === p.sku.trim().toLowerCase())) return 'This SKU is already used in this store.';
  return '';
}

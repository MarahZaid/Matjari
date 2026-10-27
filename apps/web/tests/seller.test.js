import test from 'node:test';
import assert from 'node:assert/strict';
import { seed, scoped, storesByTenant, validStore, inventory, sales, filterProducts, filterOrders, validateProduct, transitions } from '../src/seller/data.js';
const data = seed();
test('seed preserves tenant relationships and required dataset sizes', () => {
  assert.ok(data.products.length >= 30);
  assert.ok(data.orders.length >= 20);
  assert.ok(data.stores.length >= 5);
  for (const row of [...data.products, ...data.orders]) assert.equal(data.stores.find(s => s.id === row.storeId).tenantId, row.tenantId);
});
test('store switching scopes products and aggregates authorized stores only', () => {
  const all = scoped(data.products, data.stores, 't1');
  assert.equal(all.length, scoped(data.products, data.stores, 't1', 's1').length + scoped(data.products, data.stores, 't1', 's2').length);
  assert.ok(all.every(p => p.tenantId === 't1'));
  assert.equal(storesByTenant(data.stores, 't1').length, 2);
});
test('unauthorized and stale store selections expose no products or orders', () => {
  assert.equal(validStore(data.stores, 't1', 's3'), false);
  assert.equal(validStore(data.stores, 't2', 's1'), false);
  for (const rows of [data.products, data.orders]) {
    assert.deepEqual(scoped(rows, data.stores, 't1', 's3'), []);
    assert.deepEqual(scoped(rows, data.stores, 't1', 'deleted'), []);
  }
});
test('inventory boundaries count zero and low stock correctly', () => {
  assert.deepEqual(inventory([0, 1, 5, 6, 20].map(stock => ({
    stock
  }))), {
    inStock: 2,
    low: 2,
    out: 1
  });
});
test('sales retain currencies and exclude pending, cancelled, and refunded orders', () => {
  assert.deepEqual(sales([{
    status: 'paid',
    currency: 'USD',
    total: 10
  }, {
    status: 'delivered',
    currency: 'EUR',
    total: 20
  }, {
    status: 'shipped',
    currency: 'USD',
    total: 15
  }, ...['pending', 'cancelled', 'refunded'].map(status => ({
    status,
    currency: 'USD',
    total: 100
  }))]), {
    USD: 25,
    EUR: 20
  });
});
test('product search, filters, and stock sort combine', () => {
  const rows = scoped(data.products, data.stores, 't1');
  const result = filterProducts(rows, {
    search: 'MAT-',
    store: 's1',
    status: 'true',
    sort: 'stock'
  });
  assert.ok(result.length > 0);
  assert.ok(result.every(p => p.storeId === 's1' && p.active));
  assert.equal(result[0].stock, 0);
});
test('order filters retain authorized store and status', () => {
  const rows = scoped(data.orders, data.stores, 't1');
  const result = filterOrders(rows, 'lina', 'pending', 's1');
  assert.ok(result.length > 0);
  assert.ok(result.every(o => o.storeId === 's1' && o.status === 'pending' && o.customer === 'Lina Hassan'));
});
test('product validation rejects foreign stores, duplicate SKUs and invalid quantities', () => {
  const p = data.products[0];
  assert.equal(validateProduct(p, data.stores, 't1', data.products), '');
  for (const update of [{
    storeId: 's3'
  }, {
    stock: -1
  }, {
    stock: 1.5
  }, {
    price: 'NaN'
  }, {
    name: ' '
  }, {
    id: 'new-id'
  }]) assert.ok(validateProduct({
    ...p,
    ...update
  }, data.stores, 't1', data.products));
});
test('order transitions cannot skip fulfillment or leave terminal states', () => {
  assert.deepEqual(transitions.pending, ['paid', 'cancelled']);
  assert.deepEqual(transitions.shipped, ['delivered']);
  assert.deepEqual(transitions.cancelled, []);
  assert.deepEqual(transitions.refunded, []);
  assert.ok(!transitions.pending.includes('delivered'));
});

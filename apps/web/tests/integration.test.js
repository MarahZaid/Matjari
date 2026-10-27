import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, validDemo, loadDemo, saveDemo, resetDemo, STORAGE_KEY, VERSION } from '../src/platform/persistence.js';
import { publicStores, publicProducts, customerOrders } from '../src/platform/selectors.js';
import { scoped, validStore } from '../src/seller/data.js';
import { changeStatus, summary } from '../src/admin/data.js';
import { validateCart, cartTotals, filterProducts } from '../src/services/catalog.js';
const memory = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
test('normalized seed and tenant-scoped multi-store relationships', () => {
  const d = createDemo();
  assert.equal(validDemo(d), true);
  assert.equal(d.stores.filter(s => s.tenantId === 't1').length, 2);
  assert.equal(scoped(d.products, d.stores, 't1').length, scoped(d.products, d.stores, 't1', 's1').length + scoped(d.products, d.stores, 't1', 's2').length);
  assert.deepEqual(scoped(d.orders, d.stores, 't1', 's3'), []);
  assert.equal(validStore(d.stores, 't1', 'deleted'), false);
  for (const o of d.orders) assert.ok(d.customers.some(c => c.id === o.customerId));
});
test('public visibility follows product, store and tenant status and reactivation', () => {
  const d = createDemo();
  assert.ok(!publicProducts(d).some(p => !p.active));
  const suspended = changeStatus(d, 'tenants', 't1', 'suspended');
  assert.ok(!publicStores(suspended).some(s => s.tenantId === 't1'));
  assert.ok(!publicProducts(suspended).some(p => p.tenantId === 't1'));
  const s = changeStatus(d, 'stores', 's1', 'suspended');
  assert.ok(!publicProducts(s).some(p => p.storeId === 's1'));
  assert.deepEqual(publicProducts(changeStatus(s, 'stores', 's1', 'active')), publicProducts(d));
});
test('cart clamps stock and rejects duplicate, malformed and unavailable products', () => {
  const d = createDemo(), rows = publicProducts(d);
  assert.deepEqual(validateCart([{ id:'p1', quantity:999 }, { id:'p1', quantity:2 }, null, { id:'p9', quantity:1 }, { id:'p26', quantity:1 }, { id:'p2', quantity:1.2 }], rows), [{ id:'p1', quantity:18 }]);
  d.products[0].stock = 2;
  assert.deepEqual(validateCart([{ id:'p1', quantity:18 }], publicProducts(d)), [{ id:'p1', quantity:2 }]);
  assert.deepEqual(validateCart([{ id:'p1', quantity:2 }], publicProducts(changeStatus(d, 'tenants', 't1', 'suspended'))), []);
});
test('seller edits and order updates reach marketplace, customer, admin, and reload', () => {
  const d = createDemo(), storage = memory();
  d.products[0] = { ...d.products[0], price:17, stock:2 };
  d.products.push({ ...d.products[0], id:'new-product', sku:'NEW-SKU', name:'New arrival' });
  d.orders[0].status = 'paid';
  d.context = { ...d.context, role:'seller', storeId:'s1' };
  d.cart = [{ id:'p1', quantity:2 }];
  assert.equal(filterProducts({search:'New arrival'}, publicProducts(d)).total, 1);
  assert.equal(publicProducts(d)[0].price, 17);
  assert.equal(summary(d)['Total products'], 31);
  assert.equal(customerOrders(d, 'c1')[0].status, 'paid');
  assert.ok(customerOrders(d, 'c1').every(o => o.customerId === 'c1'));
  assert.equal(saveDemo(storage, d), true);
  assert.deepEqual(loadDemo(storage).data, d);
});
test('corrupt, unsupported and relationally invalid saves are preserved until explicit reset', () => {
  const storage = memory();
  for (const raw of ['{broken', JSON.stringify({ version:999, data:createDemo() }), JSON.stringify({version:VERSION, data:{}})]) {
    storage.setItem(STORAGE_KEY, raw);
    const result = loadDemo(storage);
    assert.equal(result.writable, false);
    assert.ok(validDemo(result.data));
    assert.equal(storage.getItem(STORAGE_KEY), raw);
  }
  for (const mutate of [d => d.products[0].tenantId = 't2', d => d.orders[0].customerId = 'missing', d => d.context.storeId = 's3', d => d.products[0].stock = -1, d => d.orders[0].items[0].quantity = 0, d => d.products[0].currency = 'BAD']) {
    const d = createDemo(); mutate(d); assert.equal(validDemo(d), false);
  }
  const result = resetDemo(storage);
  assert.equal(result.saved, true);
  assert.deepEqual(loadDemo(storage).data, createDemo());
});
test('unavailable storage falls back safely and reports write failure', () => {
  const storage = { getItem() { throw Error('denied'); }, setItem() { throw Error('quota'); } };
  assert.equal(loadDemo(storage).writable, false);
  assert.equal(saveDemo(storage, createDemo()), false);
  assert.equal(resetDemo(storage).saved, false);
});
test('cart totals preserve each original currency and current price', () => {
  const d = createDemo();
  assert.deepEqual(cartTotals([{id:'p1', quantity:2}, {id:'p4', quantity:1}, {id:'p8', quantity:1}], publicProducts(d)), { USD:178, ILS:32, EUR:45 });
  d.products[0].price = 10;
  assert.deepEqual(cartTotals([{id:'p1', quantity:2}], publicProducts(d)), { USD:20 });
});
test('catalog clamps stale pagination after availability changes', () => {
  const result = filterProducts({page:999}, publicProducts(createDemo()));
  assert.equal(result.page, result.pages);
  assert.ok(result.items.length);
});
test('legacy cart and valid store selection import only when no versioned save exists', () => {
  const storage = memory();
  storage.setItem('matjari-cart', JSON.stringify([{id:'p1', quantity:2}]));
  storage.setItem('matjari-seller-store', 's2');
  const loaded = loadDemo(storage);
  assert.deepEqual(loaded.data.cart, [{id:'p1',quantity:2}]);
  assert.equal(loaded.data.context.storeId, 's2');
  saveDemo(storage, createDemo());
  assert.deepEqual(loadDemo(storage).data.cart, []);
});

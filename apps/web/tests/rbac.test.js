import test from 'node:test';
import assert from 'node:assert/strict';
import { accounts, enterSession, sessionFor, access, safeDestination } from '../src/auth/model.js';
import { createDemo, saveDemo, loadDemo } from '../src/platform/persistence.js';
import { visibleOrders } from '../src/customer/model.js';
import { scoped } from '../src/seller/data.js';
const seed = createDemo();
for (const role of ['customer', 'seller', 'admin']) {
  test(`${role} access matrix and guest denial`, () => {
    const d = enterSession(seed, accounts(seed).find(a => a.role === role));
    for (const target of ['customer','seller','admin']) {
      assert.equal(access(seed,target),'login');
      assert.equal(access(d,target),target === role ? 'allow' : 'denied');
    }
    assert.equal(access(enterSession(d,null),role),'login');
  });
}
test('restoration validates identities, associations and fields; cart is cleared on session change', () => {
  const d = enterSession(seed,accounts(seed)[0]);
  d.cart = [{id:'p1',quantity:1}];
  const values = new Map(), storage = { getItem:k=>values.get(k), setItem:(k,v)=>values.set(k,v) };
  assert.ok(saveDemo(storage,d));
  assert.deepEqual(loadDemo(storage).data,d);
  for (const session of [null,{}, {...d.session,customerId:'c2'}, {...d.session,userId:'missing'}, {...d.session,role:'admin'}, {...d.session,password:'secret'}, {...d.session,tenantId:'t1'}]) {
    const invalid = {...d,session};
    saveDemo(storage,invalid);
    assert.equal(sessionFor(loadDemo(storage).data),null);
    assert.deepEqual(loadDemo(storage).data.cart,[]);
  }
  assert.deepEqual(enterSession(d,accounts(seed)[1]).cart,[]);
  const seller = accounts(seed).find(a=>a.role==='seller');
  assert.equal(sessionFor({...seed,session:{...seller,tenantId:'t2'}}),null);
});
test('only safe permitted destinations are restored', () => {
  assert.equal(safeDestination('/cart','customer'),'/cart');
  assert.equal(safeDestination('/account/orders?status=paid#top','customer'),'/account/orders?status=paid#top');
  assert.equal(safeDestination('/products/p1','customer'),'/products/p1');
  for (const target of ['https://example.com','//example.com','/\\example.com','/%2fexample.com','/admin/dashboard','/seller/dashboard','/login','/account/../admin/dashboard','/cart\n']) assert.equal(safeDestination(target,'customer'),'/account');
});
test('tenant and customer data remain scoped', () => {
  const seller = accounts(seed).find(a=>a.role==='seller');
  const d = enterSession(seed,seller);
  assert.ok(scoped(d.products,d.stores,sessionFor(d).tenantId).every(p=>p.tenantId===seller.tenantId));
  assert.deepEqual(scoped(d.orders,d.stores,seller.tenantId,'s3'),[]);
  const customer = enterSession(seed,accounts(seed)[0]);
  assert.ok(visibleOrders(customer,'c1').every(o=>o.customerId==='c1'));
  assert.ok(!visibleOrders(customer,'c1').some(o=>o.id===seed.orders.find(o=>o.customerId==='c2').id));
});

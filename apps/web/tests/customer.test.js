import { accounts, enterSession } from '../src/auth/model.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemo, saveDemo, loadDemo, validDemo } from '../src/platform/persistence.js';
import { placeCheckout, visibleOrders, confirmationOrders } from '../src/customer/model.js';
import { publicProducts } from '../src/platform/selectors.js';
import { scoped } from '../src/seller/data.js';
import { summary } from '../src/admin/data.js';
const request = { reference:'test-checkout', name:'Demo Customer', email:'fiction@example.com', phone:'', line1:'Demo street', city:'Demo city', country:'Demo country' };
function fixture() {
  const seed = createDemo();
  const d = enterSession(seed, accounts(seed)[0]);
  const products = publicProducts(d).filter(p => p.stock > 2);
  const first = products[0], other = products.find(p => p.storeId !== first.storeId), currency = products.find(p => p.currency !== first.currency);
  d.cart = [...new Set([first.id,other.id,currency.id])].map(id => ({ id, quantity:2 }));
  return d;
}
test('checkout validates identity, contact, address, cart and quantities without mutations', () => {
  const d = fixture();
  for (const patch of [{name:''},{email:'bad'},{line1:''},{city:''},{country:''},{phone:'abc'}]) {
    const result = placeCheckout(d,{...request,...patch});
    assert.ok(result.error); assert.equal(result.data,d);
  }
  const signedOut = enterSession(d, null);
  assert.ok(placeCheckout(signedOut,request).error);
  for (const cart of [[],[{id:'missing',quantity:1}],[{id:d.cart[0].id,quantity:999}], [d.cart[0],d.cart[0]], [{id:d.cart[0].id,quantity:1.5}]]) assert.ok(placeCheckout({...d,cart},request).error);
});
test('multi-store and mixed-currency orders preserve ownership and deduct stock atomically', () => {
  const d = fixture(), result = placeCheckout(d,request), next = result.data;
  assert.ok(!result.error); assert.equal(validDemo(next),true);
  const orders = confirmationOrders(next,request.reference);
  assert.ok(orders.length >= 2);
  for (const o of orders) {
    assert.equal(o.shipping,0); assert.equal(o.discount,0); assert.equal(o.status,'pending');
    assert.ok(o.items.every(i => d.products.some(p => p.id === i.productId && p.storeId === o.storeId && p.tenantId === o.tenantId && p.currency === o.currency)));
    assert.equal(o.total, Math.round(o.items.reduce((n,i) => n+i.price*i.quantity,0)*100)/100);
  }
  for (const row of d.cart) assert.equal(next.products.find(p => p.id === row.id).stock,d.products.find(p => p.id === row.id).stock-2);
  assert.equal(next.cart.length,0);
  assert.equal(d.cart.length,3);
});
test('duplicate checkout reference is idempotent including after cart refill', () => {
  const next = placeCheckout(fixture(),request).data;
  assert.equal(placeCheckout(next,request).data,next);
  const refilled = {...next,cart:[{id:next.products[0].id,quantity:1}]};
  assert.equal(placeCheckout(refilled,request).data,refilled);
});
test('invalid product, suspended store and suspended tenant reject the entire batch', () => {
  for (const kind of ['products','stores','tenants']) {
    const d=fixture(), p=d.products.find(p => p.id === d.cart[1].id);
    if(kind==='products') p.active=false;
    else d[kind].find(r => r.id === (kind==='stores' ? p.storeId : p.tenantId)).status='suspended';
    const snapshot=JSON.stringify(d), result=placeCheckout(d,request);
    assert.ok(result.error); assert.equal(JSON.stringify(d),snapshot);
  }
});
test('customer history filtering, confirmation ownership and seller status synchronization', () => {
  const d=placeCheckout(fixture(),request).data, orders=confirmationOrders(d,request.reference), o=orders[0];
  assert.ok(scoped(d.orders,d.stores,o.tenantId,o.storeId).some(r=>r.id===o.id));
  o.status='shipped';
  assert.equal(visibleOrders(d,d.context.customerId,o.number,'shipped')[0].status,'shipped');
  assert.equal(visibleOrders(d,'c2',o.number).length,0);
  assert.equal(confirmationOrders(enterSession(d,accounts(d).find(a=>a.userId==='c2')),request.reference).length,0);
  assert.equal(visibleOrders(d,d.context.customerId,'','pending').some(r=>r.id===o.id),false);
  assert.equal(summary(d)['Total orders'], createDemo().orders.length + orders.length);
});
test('orders, stock, session and confirmation persist through reload', () => {
  const d=placeCheckout(fixture(),request).data, values=new Map(), storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  assert.ok(saveDemo(storage,d));
  const loaded=loadDemo(storage);
  assert.equal(loaded.writable,true); assert.deepEqual(loaded.data,d);
  assert.deepEqual(confirmationOrders(loaded.data,request.reference),confirmationOrders(d,request.reference));
});

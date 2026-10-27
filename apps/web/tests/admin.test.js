import test from 'node:test';
import assert from 'node:assert/strict';
import { adminSeed, summary, counts, query, paginate, changeStatus, currencySales, inRange, eventTypes } from '../src/admin/data.js';
const d = adminSeed();
test('admin extends existing data with stable tenant/store/event relationships', () => {
  for (const row of [...d.products,...d.orders,...d.events]) {
    const store = d.stores.find(s=>s.id===row.storeId);
    assert.ok(store);
    assert.equal(store.tenantId,row.tenantId);
    assert.ok(d.tenants.some(t=>t.id===row.tenantId));
  }
  assert.equal(counts(d,'tenants','t1').stores,2);
  assert.equal(counts(d,'stores','s1').products,d.products.filter(p=>p.storeId==='s1').length);
});
test('summary derives totals and statuses including changed state', () => {
  const s = summary(d);
  assert.equal(s['Total products'],d.products.length);
  assert.equal(s['Total orders'],d.orders.length);
  assert.equal(s['Total tenants'],d.tenants.length);
  assert.equal(s['Active stores'],d.stores.length);
  const updated=summary(changeStatus(d,'stores','s1','suspended'));
  assert.equal(updated['Suspended stores'],1);
  assert.equal(updated['Active stores'],d.stores.length-1);
});
test('tenant search, combined filters and sorting do not mutate source', () => {
  const original=d.tenants.map(t=>t.id);
  assert.equal(query(d.tenants,{search:' NORTH ',plan:'pro',status:'active'})[0].id,'t1');
  assert.deepEqual(query(d.tenants,{search:'North',plan:'basic'}),[]);
  const sorted=query(d.tenants,{sort:'created',direction:'desc'});
  assert.equal(sorted[0].id,'t4');
  assert.deepEqual(d.tenants.map(t=>t.id),original);
  assert.ok(query(d.stores,{tenantId:'t1',status:'active'}).every(s=>s.tenantId==='t1'));
});
test('pagination partitions data and handles empty and last pages', () => {
  const rows=Array.from({length:12},(_,i)=>i);
  assert.deepEqual(paginate(rows,1),[0,1,2,3,4]);
  assert.deepEqual(paginate(rows,3),[10,11]);
  assert.deepEqual(paginate([],1),[]);
});
test('store status update changes only selected ID and retains ownership', () => {
  const next=changeStatus(d,'stores','s1','suspended');
  assert.equal(next.stores.find(s=>s.id==='s1').status,'suspended');
  assert.equal(d.stores[0].status,'active');
  for (const s of next.stores) { assert.equal(s.tenantId,d.stores.find(x=>x.id===s.id).tenantId); if(s.id!=='s1') assert.equal(s,d.stores.find(x=>x.id===s.id)); }
  assert.equal(changeStatus(next,'stores','s1','active').stores[0].status,'active');
  assert.throws(()=>changeStatus(d,'stores','foreign','active'));
  assert.throws(()=>changeStatus(d,'stores','s1','deleted'));
});
test('tenant update is isolated and does not cascade to independent store statuses', () => {
  const next=changeStatus(d,'tenants','t1','suspended');
  assert.equal(next.tenants[0].status,'suspended');
  assert.equal(next.tenants[1],d.tenants[1]);
  assert.equal(next.stores,d.stores);
  assert.equal(changeStatus(next,'tenants','t1','active').tenants[0].status,'active');
});
test('analytics retain original currencies and date filters alter results', () => {
  assert.deepEqual(currencySales([{status:'paid',currency:'ILS',total:100},{status:'shipped',currency:'USD',total:20},{status:'refunded',currency:'ILS',total:90}]),{ILS:100,USD:20});
  const range=inRange(d.orders,'2026-10-01','2026-10-03');
  assert.ok(range.length>0 && range.length<d.orders.length);
  assert.ok(range.every(o=>o.date<='2026-10-03'));
  assert.deepEqual(inRange(d.orders,'2027-01-01','2027-12-31'),[]);
});
test('monitoring combines search, event type, tenant and timestamp ordering', () => {
  assert.deepEqual([...new Set(d.events.map(e=>e.type))].sort(),[...eventTypes].sort());
  const rows=query(d.events,{search:'s1',tenantId:'t1',type:'page_view',sort:'timestamp',direction:'desc'});
  assert.ok(rows.length);
  assert.ok(rows.every(e=>e.storeId==='s1'&&e.tenantId==='t1'&&e.type==='page_view'));
  assert.ok(rows.every((e,i)=>!i||rows[i-1].timestamp>=e.timestamp));
  assert.deepEqual(query(d.events,{search:'nonexistent'}),[]);
});

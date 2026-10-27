import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSeller } from './context';
import { filterOrders, statuses, transitions } from './data';
import { PageHeading, Badge, Pager, StoreFilter, Empty } from './UI';
import { money } from '../services/catalog';
export function Orders() {
  const {
      orders,
      stores
    } = useSeller(),
    [search, setSearch] = useState(''),
    [status, setStatus] = useState(''),
    [store, setStore] = useState(''),
    [page, setPage] = useState(1),
    rows = filterOrders(orders, search, status, store),
    current = Math.min(page, Math.max(1, Math.ceil(rows.length / 6)));
  return <><PageHeading title="Orders" description="From the first click to a happy delivery." /><section className="seller-card"><div className="seller-filters"><input aria-label="Search orders" placeholder="Search order or customer…" value={search} onChange={e => {
          setSearch(e.target.value);
          setPage(1);
        }} /><StoreFilter value={store} onChange={v => {
          setStore(v);
          setPage(1);
        }} /><select aria-label="Order status" value={status} onChange={e => {
          setStatus(e.target.value);
          setPage(1);
        }}><option value="">All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></div><div className="seller-table-wrap" tabIndex={0} role="region" aria-label="Scrollable data table"><table><thead><tr>{['Order', 'Store', 'Customer', 'Date', 'Status', 'Total', 'Details'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.slice((current - 1) * 6, current * 6).map(o => <tr key={o.id}><td><strong>{o.number}</strong></td><td>{stores.find(s => s.id === o.storeId)?.name}</td><td>{o.customer}</td><td>{o.date}</td><td><Badge>{o.status}</Badge></td><td>{money(o.total, o.currency)} {o.currency}</td><td><Link className="text-link" to={`/seller/orders/${o.id}`}>View details</Link></td></tr>)}</tbody></table></div>{!rows.length && <Empty />}<Pager page={current} total={rows.length} onChange={setPage} /></section></>;
}
export function OrderDetails() {
  const {
      id
    } = useParams(),
    {
      orders,
      stores,
      updateStatus
    } = useSeller(),
    order = orders.find(o => o.id === id);
  if (!order) return <><PageHeading title="Order unavailable" description="This order was not found in your current tenant and store context." /><Link className="button" to="/seller/orders">Back to orders</Link></>;
  const store = stores.find(s => s.id === order.storeId);
  return <><Link className="seller-back" to="/seller/orders"><ArrowLeft size={16} />Back to orders</Link><PageHeading title={`Order ${order.number}`} description={`Placed ${order.date} · ${store.name}`}><Badge>{order.status}</Badge></PageHeading><div className="seller-detail-grid"><section className="seller-card"><div className="seller-card-heading"><h2>Ordered items</h2><span>{order.currency}</span></div><div className="seller-table-wrap" tabIndex={0} role="region" aria-label="Scrollable data table"><table><thead><tr><th scope="col">Product</th><th scope="col">Quantity</th><th scope="col">Unit price</th><th scope="col">Amount</th></tr></thead><tbody>{order.items.map(p => <tr key={p.productId}><td>{p.name}</td><td>{p.quantity}</td><td>{money(p.price, order.currency)}</td><td>{money(p.price * p.quantity, order.currency)}</td></tr>)}</tbody></table></div><dl className="seller-totals">{[['Subtotal', order.subtotal], ['Shipping', order.shipping], ['Discount', -order.discount], ['Total', order.total]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{money(value, order.currency)} {order.currency}</dd></div>)}</dl></section><div className="seller-detail-side"><section className="seller-card"><h2>Customer</h2><strong>{order.customer}</strong><p>{order.email}</p><p>{order.address}</p></section><section className="seller-card"><h2>Store</h2><strong>{store.name}</strong><p>{store.category}</p><small>Order currency: {order.currency}</small></section><section className="seller-card"><h2>Update status</h2><p>Only valid next steps are available.</p>{transitions[order.status].length ? <div className="seller-status-actions">{transitions[order.status].map(s => <button key={s} onClick={() => {
              if (['cancelled', 'refunded'].includes(s) && !window.confirm(`Mark ${order.number} as ${s}?`)) return;
              updateStatus(order.id, s);
            }}>Mark {s}</button>)}</div> : <p>This order has reached its final state.</p>}</section></div></div></>;
}

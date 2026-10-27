import { Link } from 'react-router-dom';
import { usePlatform } from '../platform/context';
import { customerOrders } from '../platform/selectors';
import { money } from '../services/catalog';
import { EmptyState } from '../components/Marketplace';
export default function Orders() {
  const { data, setData } = usePlatform();
  const orders = customerOrders(data, data.context.customerId);
  return <div className="container page"><div className="page-heading"><h1>Your demo orders</h1><p>Seed orders for a fictional customer. Status updates from the merchant workspace appear here.</p></div><label className="field">Demo customer<select value={data.context.customerId} onChange={e => setData(d => ({ ...d, context: { ...d.context, customerId: e.target.value } }))}>{data.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>{orders.length ? <div className="demo-orders">{orders.map(o => <article key={o.id}><h2>{o.number}</h2><p>{data.stores.find(s => s.id === o.storeId)?.name} · {o.date}</p><p role="status">Status: <strong>{o.status}</strong></p><ul>{o.items.map(i => <li key={i.productId}>{i.name} × {i.quantity}</li>)}</ul><strong>{money(o.total, o.currency)} {o.currency}</strong></article>)}</div> : <EmptyState title="No demo orders" />}<Link className="back-link" to="/products">Continue shopping</Link></div>;
}

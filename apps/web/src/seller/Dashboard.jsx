import { Link } from 'react-router-dom';
import { Package, ShoppingBag, CircleDollarSign, Boxes, Plus, ArrowUpRight, Store } from 'lucide-react';
import { useSeller } from './context';
import { inventory, sales, statuses } from './data';
import { PageHeading, Stats, Badge, Empty } from './UI';
import { money } from '../services/catalog';
export default function Dashboard() {
  const {
      tenant,
      storeId,
      stores,
      products,
      orders
    } = useSeller(),
    totals = sales(orders),
    inv = inventory(products),
    active = stores.find(s => s.id === storeId);
  const currencies = [...new Set(orders.map(o => o.currency))];
  return <><PageHeading eyebrow="A LITTLE CLARITY. A LOT OF POSSIBILITY." title="Welcome back, merchant." description={`${tenant.name} · ${active?.name || 'A complete view across your stores'}`}><Link className="button" to="/seller/products?add=1"><Plus size={17} />Add product</Link></PageHeading><div className="seller-scope"><span className="seller-live" /> {active?.name || `All ${stores.length} stores`}<span>Overview for October 2026</span></div><Stats items={[{
      label: 'Total products',
      value: products.length,
      detail: 'Across your selected stores',
      icon: Package
    }, {
      label: 'Total orders',
      value: orders.length,
      detail: 'October 2026',
      icon: ShoppingBag
    }, {
      label: 'Total sales',
      value: Object.entries(totals).map(([c, v]) => <span className="seller-money" key={c}>{money(v, c)} <small>{c}</small></span>),
      detail: 'Paid through delivered · excludes refunds',
      icon: CircleDollarSign
    }, {
      label: 'Low stock products',
      value: inv.low,
      detail: `${inv.out} products out of stock`,
      icon: Boxes
    }]} /><div className="seller-chart-grid"><section className="seller-card"><div className="seller-card-heading"><div><h2>Sales overview</h2><p>Recognized sales by week · original currency</p></div><Badge tone="blue">October</Badge></div>{currencies.length ? currencies.map(currency => {
          const values = [0, 1, 2, 3].map(week => sales(orders.filter(o => Math.min(3, Math.floor((Number(o.date.slice(-2)) - 1) / 7)) === week))[currency] || 0),
            max = Math.max(...values, 1);
          return <div className="seller-chart" key={currency}><strong>{currency}</strong><div className="seller-bars" role="img" aria-label={`${currency} weekly sales: ${values.map((v, i) => `week ${i + 1}: ${money(v, currency)}`).join(', ')}`}>{values.map((v, i) => <div key={i}><span>{money(v, currency)}</span><div style={{
                  height: `${Math.max(3, v / max * 130)}px`
                }} /><small>Week {i + 1}</small></div>)}</div></div>;
        }) : <Empty text="Sales will appear when orders arrive." />}</section><section className="seller-card"><div className="seller-card-heading"><div><h2>Orders by status</h2><p>Every order, at a glance</p></div></div><div className="seller-order-total"><strong>{orders.length}</strong><span>Total orders</span></div>{statuses.map(status => {
          const count = orders.filter(o => o.status === status).length;
          return <div className="seller-status-row" key={status}><Badge>{status}</Badge><div><i style={{
                width: `${orders.length ? count / orders.length * 100 : 0}%`
              }} /></div><strong>{count}</strong></div>;
        })}</section></div><section className="seller-card"><div className="seller-card-heading"><div><h2>Recent orders</h2><p>The latest activity from your stores</p></div><Link className="text-link" to="/seller/orders">View all <ArrowUpRight size={16} /></Link></div><div className="seller-table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Store</th><th>Status</th><th>Total</th></tr></thead><tbody>{[...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(o => <tr key={o.id}><td><Link className="text-link" to={`/seller/orders/${o.id}`}>{o.number}</Link></td><td>{o.customer}</td><td>{stores.find(s => s.id === o.storeId)?.name}</td><td><Badge>{o.status}</Badge></td><td>{money(o.total, o.currency)} {o.currency}</td></tr>)}</tbody></table></div>{!orders.length && <Empty />}</section><div className="seller-quick">{[[Plus, 'Add a product', 'Bring something new to your shelves', 'products?add=1'], [ShoppingBag, 'Manage orders', 'Keep every customer moving forward', 'orders'], [Store, 'View your stores', 'Make room for your next big idea', 'stores']].map(([Icon, title, text, path]) => <Link className="seller-card" key={path} to={`/seller/${path}`}><Icon /><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={18} /></Link>)}</div></>;
}

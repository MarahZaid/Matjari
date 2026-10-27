import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePlatform } from '../platform/context';
import { money } from '../services/catalog';
import { statuses } from '../seller/data';
import { confirmationOrders, placeCheckout, sessionCustomer, validateContact, visibleOrders } from './model';
import './customer.css';

function Frame({ title, children }) {
  return <div className="container page customer-page"><span className="eyebrow">MATJARI · CUSTOMER DEMO</span><h1>{title}</h1><p>Use fictional details. This browser-only demo provides no production authentication, payment or shipping service.</p><nav className="customer-nav" aria-label="Customer"><Link to="/account">My account</Link><Link to="/account/orders">My orders</Link><Link to="/cart">Shopping bag</Link></nav>{children}</div>;
}
function Fields({ values, setValues, shipping = false }) {
  return <div className="customer-fields">{[['name','Name','text'],['email','Email','email'],['phone','Phone (optional)','tel'],...(shipping ? [['line1','Street address','text'],['city','City','text'],['country','Country','text']] : [])].map(([key,label,type]) => <label key={key}>{label}<input name={key} type={type} required={key !== 'phone'} maxLength={key === 'phone' ? 30 : key === 'name' ? 100 : 160} autoComplete="off" value={values[key] || ''} onChange={e => setValues({ ...values, [key]: e.target.value })} /></label>)}</div>;
}
function Guard({ children }) {
  const { data } = usePlatform(), location = useLocation();
  return sessionCustomer(data) ? children : <Navigate to={'/login?next=' + encodeURIComponent(location.pathname)} replace />;
}
export function Auth({ register = false }) {
  const { data, setData } = usePlatform(), navigate = useNavigate(), location = useLocation();
  const [selected, select] = useState(data.context.customerId), [values, setValues] = useState({ name: '', email: '', phone: '' }), [password, setPassword] = useState(''), [show, setShow] = useState(false), [error, setError] = useState('');
  function submit(e) {
    e.preventDefault();
    if (password.length < 6) return setError('Use any demo password of at least 6 characters. It is never saved or checked against an account.');
    if (register && validateContact(values)) return setError(validateContact(values));
    if (register && data.customers.some(c => c.email.toLowerCase() === values.email.trim().toLowerCase())) return setError('That demo email already exists. Select its demo account on the sign-in page.');
    const id = register ? 'customer-' + crypto.randomUUID() : selected;
    setData(d => ({ ...d, customers: register ? [...d.customers, { id, name: values.name.trim(), email: values.email.trim(), phone: values.phone }] : d.customers, context: { ...d.context, customerId: id, signedIn: true } }));
    setPassword('');
    const next = new URLSearchParams(location.search).get('next');
    navigate(next?.startsWith('/') && !next.startsWith('//') ? next : '/account', { replace: true });
  }
  return <Frame title={register ? 'Create a demo account' : 'Demo sign in'}><form className="customer-card auth-card" onSubmit={submit}>{register ? <Fields values={values} setValues={setValues} /> : <label>Choose a fictional demo account<select value={selected} onChange={e => select(e.target.value)}>{data.customers.map(c => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}</select></label>}<label>Demo password<input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} maxLength={100} autoComplete="off" /></label><button type="button" className="plain-button" aria-pressed={show} onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'} password</button><p>Any six-character demo password works. Passwords are never stored.</p>{error && <p role="alert" className="customer-error">{error}</p>}<button className="button">{register ? 'Create demo account' : 'Sign in to demo'}</button><Link to={(register ? '/login' : '/register') + location.search}>{register ? 'Choose an existing demo account' : 'Register a demo account'}</Link></form></Frame>;
}
export function Account() { return <Guard><Profile /></Guard>; }
function Profile() {
  const { data, setData } = usePlatform(), customer = sessionCustomer(data), navigate = useNavigate();
  const [values, setValues] = useState(customer), [message, setMessage] = useState('');
  function submit(e) {
    e.preventDefault();
    const error = validateContact(values);
    if (error) return setMessage(error);
    if (data.customers.some(c => c.id !== customer.id && c.email.toLowerCase() === values.email.trim().toLowerCase())) return setMessage('Choose a different demo email.');
    setData(d => ({ ...d, customers: d.customers.map(c => c.id === customer.id ? { ...c, name: values.name.trim(), email: values.email.trim(), phone: values.phone || '' } : c) }));
    setMessage('Demo profile saved.');
  }
  return <Frame title="Your account"><form className="customer-card auth-card" onSubmit={submit}><Fields values={values} setValues={setValues} /><p role="status">{message}</p><button className="button">Save profile</button><button type="button" className="button secondary" onClick={() => { setData(d => ({ ...d, context: { ...d.context, signedIn: false } })); navigate('/login'); }}>Sign out</button></form></Frame>;
}
export function Checkout() { return <Guard><CheckoutForm /></Guard>; }
function CheckoutForm() {
  const { data, transact } = usePlatform(), navigate = useNavigate(), customer = sessionCustomer(data);
  const [values, setValues] = useState({ name: customer.name, email: customer.email, phone: customer.phone || '', line1: '', city: '', country: '' }), [error, setError] = useState(''), [review, setReview] = useState(false), [busy, setBusy] = useState(false);
  const reference = useRef(null), lock = useRef(false);
  const groups = new Map();
  data.cart.forEach(row => {
    const p = data.products.find(p => p.id === row.id);
    if (!p) return;
    const key = p.storeId + ':' + p.currency;
    if (!groups.has(key)) groups.set(key, { store: data.stores.find(s => s.id === p.storeId), currency: p.currency, items: [] });
    groups.get(key).items.push({ ...p, quantity: row.quantity });
  });
  function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    if (!review) { setReview(true); return; }
    lock.current = true; setBusy(true);
    reference.current ||= crypto.randomUUID();
    const result = transact(d => placeCheckout(d, { ...values, reference: reference.current }));
    if (result.error) { setError(result.error); lock.current = false; setBusy(false); return; }
    navigate('/checkout/confirmation/' + result.reference, { replace: true });
  }
  return <Frame title="Demo checkout"><p>Each store and currency receives a separate order. Amounts are never converted or combined across currencies.</p>{!data.cart.length ? <div className="customer-card"><h2>Your bag is empty</h2><Link className="button" to="/products">Explore products</Link></div> : <form onSubmit={submit} className="customer-checkout"><section className="customer-card"><h2>{review ? 'Review your order' : 'Customer & shipping details'}</h2>{review ? <><p>{values.name} · {values.email} · {values.phone}</p><p>{values.line1}, {values.city}, {values.country}</p><button type="button" className="button secondary" onClick={() => setReview(false)}>Edit details</button></> : <Fields values={values} setValues={setValues} shipping />}<h3>Demo cash on delivery</h3><p>No payment is collected. Shipping: zero (demo assumption). Discounts: zero (demo assumption).</p><p>Availability and quantities are checked again when you place your order.</p>{error && <p className="customer-error" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? 'Placing order…' : review ? 'Place demo order' : 'Review order'}</button></section><aside className="customer-card"><h2>Order summary</h2>{[...groups.entries()].map(([key,g]) => <section className="order-group" key={key}><h3>{g.store?.name} · {g.currency}</h3>{g.items.map(p => <p key={p.id}>{p.name} × {p.quantity} <strong>{money(p.price * p.quantity, p.currency)}</strong></p>)}<strong>Total: {money(g.items.reduce((n,p) => n + p.price * p.quantity,0),g.currency)} {g.currency}</strong></section>)}<Link to="/cart">Edit bag quantities</Link></aside></form>}</Frame>;
}
function OrderCard({ order, detail = false }) {
  const { data } = usePlatform();
  const progress = ['pending','paid','fulfilled','shipped','delivered'];
  return <article className="customer-card"><h2>{order.number}</h2><p>{data.stores.find(s => s.id === order.storeId)?.name} · {order.date}</p><p role="status">Status: <strong>{order.status}</strong></p><ul>{order.items.map(i => <li key={i.productId}>{i.name} × {i.quantity} · {money(i.price, order.currency)} each</li>)}</ul><strong>Total: {money(order.total, order.currency)} {order.currency}</strong>{detail ? <><p>Shipping: {money(order.shipping,order.currency)} · Discount: {money(order.discount,order.currency)}</p><h3>Shipping information</h3><p>{order.customer} · {order.email}</p><p>{order.address}</p><p>{order.paymentMethod || 'Historical demo order'}</p><h3>Order progress</h3>{progress.includes(order.status) ? <ol className="order-progress">{progress.map((s,i) => <li key={s} aria-current={s === order.status ? 'step' : undefined} className={i <= progress.indexOf(order.status) ? 'reached' : ''}>{s}{s === order.status ? ' (current)' : ''}</li>)}</ol> : <p>This order is {order.status}.</p>}<p>Demo status only. No shipment tracking number or delivery estimate is available.</p></> : <p><Link to={'/account/orders/' + order.id}>View details</Link></p>}</article>;
}
export function Confirmation() { return <Guard><ConfirmationContent /></Guard>; }
function ConfirmationContent() {
  const { reference } = useParams(), { data } = usePlatform(), orders = confirmationOrders(data,reference);
  return <Frame title={orders.length ? 'Your demo order is confirmed' : 'Confirmation unavailable'}>{orders.length ? <><p role="status">Success! {orders.length} store/currency order(s) created. No payment was collected.</p><div className="customer-order-grid">{orders.map(o => <OrderCard key={o.id} order={o} />)}</div></> : <p>No confirmation belongs to this demo account.</p>}<div className="customer-nav"><Link className="button" to="/account/orders">View orders</Link><Link className="button secondary" to="/products">Continue shopping</Link></div></Frame>;
}
export function Orders() { return <Guard><OrderHistory /></Guard>; }
function OrderHistory() {
  const { data } = usePlatform(), [search,setSearch] = useState(''), [status,setStatus] = useState(''), [sort,setSort] = useState('newest'), [page,setPage] = useState(1);
  const rows = visibleOrders(data,data.context.customerId,search,status,sort), pages = Math.max(1,Math.ceil(rows.length/6)), current = Math.min(page,pages);
  return <Frame title="Your demo orders"><div className="customer-filters"><label>Search order number<input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label><label>Status<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></label><label>Date order<select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div><div className="customer-order-grid">{rows.slice((current-1)*6,current*6).map(o => <OrderCard key={o.id} order={o} />)}</div>{!rows.length && <p>No orders found. <Link to="/products">Explore products</Link></p>}<nav className="customer-nav" aria-label="Order pagination"><button disabled={current===1} onClick={() => setPage(current-1)}>Previous</button><span>Page {current} of {pages}</span><button disabled={current===pages} onClick={() => setPage(current+1)}>Next</button></nav></Frame>;
}
export function OrderDetails() { return <Guard><Details /></Guard>; }
function Details() {
  const { id } = useParams(), { data } = usePlatform(), order = visibleOrders(data,data.context.customerId).find(o => o.id === id);
  return <Frame title="Order details">{order ? <OrderCard order={order} detail /> : <p>Order unavailable for this demo account.</p>}<Link to="/account/orders">Back to orders</Link></Frame>;
}

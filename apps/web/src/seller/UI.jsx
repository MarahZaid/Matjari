import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Package, Boxes, ShoppingBag, Menu, X, ArrowUpRight, ChevronRight, ShieldCheck } from 'lucide-react';
import { Brand } from '../components/Marketplace';
import { useSeller } from './context';
import './seller.css';
export function StoreSwitcher() {
  const {
    tenant,
    stores,
    storeId,
    selectStore
  } = useSeller();
  return <label className="seller-switch"><span>{tenant.name}</span><select aria-label="Active store" value={storeId} onChange={e => selectStore(e.target.value)}><option value="all">All Stores</option>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>;
}
const navigation = [['dashboard', 'Dashboard', LayoutDashboard], ['stores', 'My Stores', Store], ['products', 'Products', Package], ['inventory', 'Inventory', Boxes], ['orders', 'Orders', ShoppingBag]];
export default function SellerLayout() {
  const [open, setOpen] = useState(false),
    {
      tenant,
      tenants,
      changeTenant,
      notice,
      setNotice,
      storeId
    } = useSeller(),
    location = useLocation();
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    sidebarRef.current.querySelector('button').focus();
    function keyboard(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const controls = [...sidebarRef.current.querySelectorAll('a,button,select')];
      const first = controls[0],
        last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', keyboard);
    return () => {
      document.removeEventListener('keydown', keyboard);
      previous?.focus();
    };
  }, [open]);
  const title = navigation.find(([path]) => location.pathname.includes(path))?.[1] || 'Dashboard';
  return <div className="seller-shell"><aside ref={sidebarRef} className={`seller-sidebar ${open ? 'is-open' : ''}`}><div className="seller-brand"><Brand /><button className="seller-mobile" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button></div><span className="seller-eyebrow">MERCHANT WORKSPACE</span><nav aria-label="Seller navigation">{navigation.map(([path, label, Icon]) => <NavLink key={path} to={`/seller/${path}`} onClick={() => setOpen(false)}><Icon size={19} />{label}<ChevronRight size={14} /></NavLink>)}</nav><div className="seller-sidebar-bottom"><div className="seller-note"><ShieldCheck size={22} /><strong>Your business, connected.</strong><p>One workspace for every store you’re building.</p></div><Link to="/">Visit marketplace <ArrowUpRight size={16} /></Link><label>Demo tenant<select aria-label="Demo tenant" value={tenant.id} onChange={e => changeTenant(e.target.value)}>{tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><small>Mock authentication · local session only<br />Backend authorization is not implemented.</small></div></aside>{open && <button className="seller-overlay" aria-label="Close navigation" onClick={() => setOpen(false)} />}
 <div className="seller-workspace" inert={open}><header className="seller-topbar"><div className="seller-crumb"><button className="seller-mobile" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(!open)}><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><strong>{title}</strong></div><div className="seller-top-right"><StoreSwitcher /><span className="seller-avatar" title="Demo merchant">MZ</span></div></header><main id="main" className="seller-main">{notice && <div role="status" className="seller-feedback">{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}><X size={16} /></button></div>}<Suspense fallback={<div className="seller-loading" role="status"><span className="sr-only">Loading merchant workspace…</span>{[1,2,3].map(i => <div className="skeleton" key={i}/>)}</div>}><Outlet key={`${tenant.id}-${storeId}`} /></Suspense></main><div className="seller-foot">Matjari Merchant <span>Demo workspace · October 2026</span></div></div></div>;
}
export function PageHeading({
  eyebrow = 'YOUR WORKSPACE',
  title,
  description,
  children
}) {
  return <div className="seller-heading"><div><span className="seller-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><div className="seller-heading-actions">{children}</div></div>;
}
export function Badge({
  children,
  tone = ''
}) {
  return <span className={`seller-badge ${tone || children}`}>{children}</span>;
}
export function Stats({
  items
}) {
  return <div className="seller-stats">{items.map(({
      label,
      value,
      detail,
      icon: Icon
    }) => <article className="seller-card seller-stat" key={label}><div><span>{label}</span>{Icon && <Icon size={19} />}</div><strong>{value}</strong><small>{detail}</small></article>)}</div>;
}
export function Modal({
  title,
  children,
  onClose
}) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog className="seller-dialog" aria-label={title} ref={ref} onCancel={onClose} onClick={e => {
    if (e.target === ref.current) onClose();
  }}><div className="seller-dialog-heading"><h2>{title}</h2><button aria-label="Close form" onClick={onClose}><X /></button></div>{children}</dialog>;
}
export function Field({
  label,
  children
}) {
  return <label className="seller-field"><span>{label}</span>{children}</label>;
}
export function Empty({
  text = 'No results match your filters.'
}) {
  return <div className="seller-empty"><Package size={30} /><h3>Nothing here yet</h3><p>{text}</p></div>;
}
export function Pager({
  page,
  total,
  onChange,
  size = 6
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return <div className="seller-pager"><span>{total} results · Page {page} of {pages}</span><div><button disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button><button disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button></div></div>;
}
export function StoreFilter({
  value,
  onChange
}) {
  const {
    stores,
    storeId
  } = useSeller();
  return <select aria-label="Filter by store" value={value} onChange={e => onChange(e.target.value)}><option value="">All authorized stores</option>{stores.filter(s => storeId === 'all' || s.id === storeId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>;
}

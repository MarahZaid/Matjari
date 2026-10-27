import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Store, ChartNoAxesCombined, Activity, Menu, X, ChevronRight, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Brand } from '../components/Marketplace';
import '../seller/seller.css';
import './admin.css';
const navigation = [['dashboard', 'Overview', LayoutDashboard], ['tenants', 'Tenants', Building2], ['stores', 'Stores', Store], ['analytics', 'Analytics', ChartNoAxesCombined], ['monitoring', 'Monitoring', Activity]];
class AdminError extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <section className="seller-card admin-error" role="alert"><h2>We couldn’t open this demo view</h2><p>Try loading the workspace again. Saved demo changes will be restored when browser storage is available.</p><button onClick={() => window.location.reload()}>Reload workspace</button></section> : this.props.children; }
}
export default function AdminLayout() {
  const [open, setOpen] = useState(false), ref = useRef(null), { pathname } = useLocation();
  const title = navigation.find(([path]) => pathname.endsWith(path))?.[1] || 'Overview';
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement, oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current.querySelector('button').focus();
    function keyboard(e) {
      if (e.key === 'Escape') setOpen(false);
      if (e.key !== 'Tab') return;
      const nodes = [...ref.current.querySelectorAll('a,button')], first = nodes[0], last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', keyboard); previous?.focus(); };
  }, [open]);
  return <div className="seller-shell admin-shell"><aside id="admin-navigation" ref={ref} className={`seller-sidebar ${open ? 'is-open' : ''}`} role={open ? 'dialog' : undefined} aria-modal={open || undefined} aria-label="Platform navigation"><div className="seller-brand"><Brand /><button className="seller-mobile" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button></div><span className="seller-eyebrow">PLATFORM CONSOLE</span><nav aria-label="Admin navigation">{navigation.map(([path, label, Icon]) => <NavLink key={path} to={`/admin/${path}`} onClick={() => setOpen(false)}><Icon size={19} />{label}<ChevronRight size={14} /></NavLink>)}</nav><div className="seller-sidebar-bottom"><div className="seller-note"><ShieldCheck size={25} /><strong>A wider perspective.</strong><p>Every company. Every store. One connected platform.</p></div><Link to="/">Visit marketplace <ArrowUpRight size={16} /></Link><small>Development demo only.<br />No backend authentication or authorization. These controls are not production security.</small></div></aside>{open && <button className="seller-overlay" aria-label="Close navigation" onClick={() => setOpen(false)} />}
  <div className="seller-workspace" inert={open}><header className="seller-topbar"><div className="seller-crumb"><button className="seller-mobile" aria-label="Open navigation" aria-controls="admin-navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={20} /></button><span>Platform</span><ChevronRight size={14} /><strong>{title}</strong></div><div className="seller-top-right"><span className="admin-demo">MOCK ADMIN</span><span className="seller-avatar" title="Demo platform administrator">PA</span></div></header><main id="main" className="seller-main"><AdminError><Suspense fallback={<div role="status" className="seller-loading"><p>Loading platform console…</p></div>}><Outlet /></Suspense></AdminError></main><div className="seller-foot">Matjari Platform <span>Demo data · October 2026</span></div></div></div>;
}

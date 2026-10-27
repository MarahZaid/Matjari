import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePlatform } from '../platform/context';
import { access, homeFor, safeDestination, sessionFor } from './model';
export function AccessDenied() {
  const { data } = usePlatform();
  return <main id="main" className="container page"><section className="empty-state"><span className="eyebrow">403 · ACCESS DENIED</span><h1>Access denied</h1><p>Your demo account does not have access to this area. Sign out to choose a different demo account.</p><Link className="button" to={homeFor(sessionFor(data)?.role)}>Go to my home</Link></section></main>;
}
export function RequireRole({ role }) {
  const { data } = usePlatform(), location = useLocation();
  const decision = access(data, role);
  if (decision === 'login') return <Navigate replace to={'/login?next=' + encodeURIComponent(location.pathname + location.search + location.hash)} state={{ required: true }} />;
  return decision === 'denied' ? <AccessDenied /> : <Outlet />;
}
export function GuestOnly() {
  const { data } = usePlatform(), session = sessionFor(data), location = useLocation();
  return session ? <Navigate replace to={safeDestination(new URLSearchParams(location.search).get("next"), session.role)} /> : <Outlet />;
}

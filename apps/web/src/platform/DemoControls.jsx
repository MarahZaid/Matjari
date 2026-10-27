import ThemeToggle from '../theme/ThemeToggle';
import { Link, useNavigate } from 'react-router-dom';
import { usePlatform } from './context';
import { enterSession, homeFor, sessionFor } from '../auth/model';
export default function DemoControls() {
  const { data, setData, reset, message } = usePlatform(), navigate = useNavigate(), session = sessionFor(data);
  return <nav className="demo-controls" aria-label="Demo session">
    <strong className="demo-mode">Demo Mode</strong><span>{session ? `${session.displayName} · ${session.role}` : 'Guest'}</span>
    <Link to="/stores">Browse Stores</Link><Link to="/products">Browse Products</Link>
    {!session ? <><Link to="/login">Login</Link><Link to="/register">Register</Link></> : <>
      <Link to={homeFor(session.role)}>{session.role === 'customer' ? 'My Account' : session.role === 'seller' ? 'Seller Dashboard' : 'Admin Dashboard'}</Link>
      {session.role === 'customer' && <><Link to="/account/orders">My Orders</Link><Link to="/cart">Cart</Link></>}
      {session.role === 'seller' && <Link to="/seller/stores">My Stores</Link>}
      {session.role === 'admin' && <><Link to="/admin/tenants">Tenants</Link><Link to="/admin/stores">Stores</Link></>}
      <button onClick={() => { setData(d => enterSession(d, null)); navigate('/login', { replace: true }); }}>Sign Out</button>
    </>}
    <ThemeToggle /><button onClick={reset}>Reset Demo Data</button><small>Frontend demo · no production security</small>{message && <span role="status">{message}</span>}
  </nav>;
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePlatform } from './context';
import { roles } from './persistence';
export default function DemoControls() {
  const { data, setData, reset, message } = usePlatform();
  const { pathname } = useLocation(), navigate = useNavigate();
  const role = pathname.startsWith('/admin') ? 'admin' : pathname.startsWith('/seller') ? 'seller' : 'customer';
  function select(value) {
    setData(d => ({ ...d, context: { ...d.context, role: value } }));
    navigate(value === 'customer' ? '/' : `/${value}/dashboard`);
  }
  return <div className="demo-controls">
    <label>Demo role <select aria-label="Demo role" value={role} onChange={e => select(e.target.value)}>{roles.map(r => <option key={r}>{r}</option>)}</select></label>
    <Link to="/orders">My demo orders</Link>
    <Link to={data.context.role === 'customer' ? '/' : `/${data.context.role}/dashboard`}>{data.context.role === 'customer' ? 'Customer view' : 'Resume selected role'}</Link>
    <button onClick={reset}>Reset Demo Data</button>
    <small>Frontend demo · role and tenant controls are not production security.</small>
    {message && <span role="status">{message}</span>}
  </div>;
}

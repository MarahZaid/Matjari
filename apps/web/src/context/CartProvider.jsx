import { useNavigate } from 'react-router-dom';
import { access, sessionFor } from '../auth/model';
import { useEffect, useState } from 'react';
import { validateCart } from '../services/catalog';
import { publicProducts } from '../platform/selectors';
import { usePlatform } from '../platform/context';
import { CartContext } from './CartContext';
export default function CartProvider({ children }) {
  const { data, setData } = usePlatform();
  const navigate = useNavigate();
  const products = publicProducts(data);
  const items = sessionFor(data)?.role === 'customer' ? validateCart(data.cart, products) : [];
  const [notice, setNotice] = useState('');
  useEffect(() => {
    setData(current => {
      const next = validateCart(current.cart, publicProducts(current));
      return JSON.stringify(next) === JSON.stringify(current.cart) ? current : { ...current, cart: next };
    });
  }, [data.products, data.stores, data.tenants, setData]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);
  const quantity = id => items.find(i => i.id === id)?.quantity || 0;
  function authorize(id) {
    const decision = access(data, 'customer');
    if (decision === 'allow') return true;
    if (decision === 'login') navigate('/login?next=' + encodeURIComponent('/products/' + id), { state: { required: true } });
    else navigate('/cart');
    return false;
  }
  function change(id, amount, adding) {
    if (!authorize(id)) return;
    setData(current => {
      if (access(current, 'customer') !== 'allow') return current;
      const rows = publicProducts(current), p = rows.find(p => p.id === id);
      if (!p || !Number.isSafeInteger(amount) || amount < 0) return current;
      const cart = validateCart(current.cart, rows);
      const next = amount + (adding ? cart.find(i => i.id === id)?.quantity || 0 : 0);
      return { ...current, cart: validateCart([...cart.filter(i => i.id !== id), { id, quantity: Math.min(next, p.stock) }], rows) };
    });
  }
  function add(id, amount = 1) {
    if (!authorize(id)) return;
    const p = products.find(p => p.id === id);
    if (!p?.stock || !Number.isSafeInteger(amount) || amount < 1 || quantity(id) >= p.stock) return;
    change(id, amount, true);
    setNotice(`${p.name} added to your cart`);
  }
  return <CartContext.Provider value={{ items, quantity, update: (id, amount) => change(id, amount, false), add }}>{children}<div className={`toast ${notice && sessionFor(data)?.role === 'customer' ? 'visible' : ''}`} role="status">{sessionFor(data)?.role === 'customer' ? notice : ''}</div></CartContext.Provider>;
}

import { useState } from 'react';
import { SellerContext } from './context';
import { usePlatform } from '../platform/context';
import { tenants, storesByTenant, validStore, scoped, validateProduct, transitions } from './data';
export default function SellerProvider({
  children
}) {
  const { data, setData } = usePlatform();
  const [tenantId, setTenantId] = useState('t1'),
    [selection, setSelection] = useState(() => {
      try {
        return localStorage.getItem('matjari-seller-store') || 'all';
      } catch {
        return 'all';
      }
    }),
    [notice, setNotice] = useState('');
  const storeId = validStore(data.stores, tenantId, selection) ? selection : 'all';
  function selectStore(id) {
    if (!validStore(data.stores, tenantId, id)) return;
    setSelection(id);
    try {
      localStorage.setItem('matjari-seller-store', id);
    } catch {/* Storage is optional. */}
  }
  function changeTenant(id) {
    if (tenants.some(t => t.id === id)) {
      setTenantId(id);
      selectStore('all');
      setNotice('Demo tenant changed. Private data is now scoped to this tenant.');
    }
  }
  const authorizedStores = storesByTenant(data.stores, tenantId);
  const products = scoped(data.products, data.stores, tenantId, storeId),
    orders = scoped(data.orders, data.stores, tenantId, storeId);
  function saveProduct(p) {
    const error = validateProduct(p, data.stores, tenantId, data.products);
    if (error) return error;
    if (p.id && !products.some(x => x.id === p.id)) return 'Product unavailable in this context.';
    if (storeId !== 'all' && p.storeId !== storeId) return 'Choose the active store.';
    const next = {
      ...p,
      id: p.id || crypto.randomUUID(),
      image: p.image || 'photo-1498049794561-7780e7231661',
      tenantId,
      name: p.name.trim(),
      sku: p.sku.trim(),
      price: Number(p.price),
      stock: Number(p.stock)
    };
    setData(d => ({
      ...d,
      products: p.id ? d.products.map(x => x.id === p.id ? next : x) : [...d.products, next]
    }));
    setNotice('Product saved successfully.');
    return '';
  }
  function adjustStock(id, value) {
    if (value === '' || !Number.isSafeInteger(Number(value)) || Number(value) < 0 || !products.some(p => p.id === id)) return 'Enter a non-negative whole number.';
    setData(d => ({
      ...d,
      products: d.products.map(p => p.id === id ? {
        ...p,
        stock: Number(value)
      } : p)
    }));
    setNotice('Inventory updated.');
    return '';
  }
  function updateStatus(id, status) {
    const order = orders.find(o => o.id === id);
    if (!order || !transitions[order.status].includes(status)) return;
    setData(d => ({
      ...d,
      orders: d.orders.map(o => o.id === id ? {
        ...o,
        status
      } : o)
    }));
    setNotice('Order status updated.');
  }
  function addStore(s) {
    if (!s.name.trim() || !s.category.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.slug)) return 'Enter a name, category, and a lowercase slug with letters, numbers, and hyphens.';
    if (data.stores.some(x => x.slug === s.slug)) return 'This store slug is already taken.';
    setData(d => ({
      ...d,
      stores: [...d.stores, {
        ...s,
        id: crypto.randomUUID(),
        tenantId,
        created: new Date().toISOString().slice(0, 10),
        status: 'active'
      }]
    }));
    setNotice('Store created successfully.');
    return '';
  }
  return <SellerContext.Provider value={{
    tenant: data.tenants.find(t => t.id === tenantId),
    tenants: data.tenants,
    changeTenant,
    storeId,
    selectStore,
    stores: authorizedStores,
    products,
    orders,
    allProducts: scoped(data.products, data.stores, tenantId),
    saveProduct,
    adjustStock,
    updateStatus,
    addStore,
    notice,
    setNotice
  }}>{children}</SellerContext.Provider>;
}

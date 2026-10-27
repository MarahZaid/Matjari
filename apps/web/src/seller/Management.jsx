import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Store, Package, Boxes } from 'lucide-react';
import { useSeller } from './context';
import { filterProducts, inventory, threshold } from './data';
import { PageHeading, Modal, Field, Badge, Pager, Empty, Stats, StoreFilter } from './UI';
import { Image } from '../components/Marketplace';
import { money } from '../services/catalog';
export function Stores() {
  const {
      stores,
      storeId,
      allProducts,
      selectStore,
      addStore
    } = useSeller(),
    navigate = useNavigate(),
    [open, setOpen] = useState(false),
    [error, setError] = useState('');
  return <><PageHeading title="Your stores. One workspace." description="Independent identities. A connected business."><button className="button" onClick={() => setOpen(true)}><Plus size={17} />Add store</button></PageHeading><div className="seller-store-grid">{stores.filter(s => storeId === 'all' || s.id === storeId).map(s => <article className="seller-card seller-store" key={s.id}><div className="seller-store-art" style={{
          background: s.color || '#eaf2ff'
        }}><Store size={38} /><span>{s.category}</span></div><div className="seller-store-body"><Badge>{s.status}</Badge><h2>{s.name}</h2><p>{s.description || s.category}</p><div className="seller-store-meta"><span>{allProducts.filter(p => p.storeId === s.id).length} products</span><strong>{s.currency}</strong></div><button className="button secondary" onClick={() => {
            selectStore(s.id);
            navigate('/seller/dashboard');
          }}>Manage store</button></div></article>)}</div>{open && <Modal title="Create a store" onClose={() => setOpen(false)}><form onSubmit={e => {
        e.preventDefault();
        const values = Object.fromEntries(new FormData(e.currentTarget));
        const error = addStore(values);
        setError(error);
        if (!error) setOpen(false);
      }}><Field label="Store name"><input name="name" required autoFocus /></Field><Field label="Unique store slug"><input name="slug" placeholder="my-new-store" required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></Field><Field label="Category"><input name="category" required /></Field><Field label="Description"><input name="description" /></Field><Field label="Currency"><select name="currency">{['USD', 'EUR', 'ILS'].map(c => <option key={c}>{c}</option>)}</select></Field>{error && <p role="alert" className="seller-error">{error}</p>}<button className="button">Create store</button></form></Modal>}</>;
}
function ProductForm({
  product,
  onClose
}) {
  const {
      stores,
      storeId,
      saveProduct
    } = useSeller(),
    [error, setError] = useState('');
  return <Modal title={product.id ? 'Edit product' : 'Add a product'} onClose={onClose}><form onSubmit={e => {
      e.preventDefault();
      const values = Object.fromEntries(new FormData(e.currentTarget));
      const error = saveProduct({
        ...product,
        ...values,
        active: values.active === 'true'
      });
      setError(error);
      if (!error) onClose();
    }}><div className="seller-form-grid"><Field label="Product title"><input name="name" required defaultValue={product.name} autoFocus /></Field><Field label="SKU"><input name="sku" required defaultValue={product.sku} /></Field><Field label="Store"><select name="storeId" defaultValue={product.storeId || (storeId === 'all' ? stores[0]?.id : storeId)} required>{stores.filter(s => storeId === 'all' || s.id === storeId).map(s => <option value={s.id} key={s.id}>{s.name}</option>)}</select></Field><Field label="Category"><input name="category" required defaultValue={product.category} /></Field><Field label="Price"><input name="price" type="number" min="0" step="0.01" required defaultValue={product.price} /></Field><Field label="Currency"><select name="currency" defaultValue={product.currency || 'USD'}>{['USD', 'EUR', 'ILS'].map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Stock quantity"><input name="stock" type="number" min="0" step="1" required defaultValue={product.stock ?? 0} /></Field><Field label="Status"><select name="active" defaultValue={String(product.active ?? true)}><option value="true">Active</option><option value="false">Inactive</option></select></Field></div>{error && <p role="alert" className="seller-error">{error}</p>}<div className="seller-form-actions"><button type="button" onClick={onClose}>Cancel</button><button className="button">Save product</button></div></form></Modal>;
}
export function Products() {
  const {
      products,
      stores,
      saveProduct
    } = useSeller(),
    [params, setParams] = useSearchParams(),
    [edit, setEdit] = useState(null),
    [filters, setFilters] = useState({}),
    [page, setPage] = useState(1);
  const rows = filterProducts(products, filters),
    pages = Math.max(1, Math.ceil(rows.length / 6)),
    current = Math.min(page, pages);
  const change = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
    setPage(1);
  };
  function close() {
    setEdit(null);
    setParams({});
  }
  return <><PageHeading title="Products" description="A thoughtfully managed collection starts here."><button className="button" onClick={() => setEdit({})}><Plus size={17} />Add product</button></PageHeading><section className="seller-card"><div className="seller-filters"><input aria-label="Search products" placeholder="Search product or SKU…" value={filters.search || ''} onChange={e => change('search', e.target.value)} /><StoreFilter value={filters.store || ''} onChange={v => change('store', v)} /><select aria-label="Category" onChange={e => change('category', e.target.value)}><option value="">All categories</option>{[...new Set(products.map(p => p.category))].map(c => <option key={c}>{c}</option>)}</select><select aria-label="Product status" onChange={e => change('status', e.target.value)}><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select><select aria-label="Sort products" onChange={e => change('sort', e.target.value)}><option value="name">Name A–Z</option><option value="price">Price by currency</option><option value="stock">Lowest stock</option></select></div><div className="seller-table-wrap"><table><thead><tr>{['Product', 'Store / category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.slice((current - 1) * 6, current * 6).map(p => <tr key={p.id}><td><div className="seller-product-cell"><Image id={p.image} alt={p.name} width={100} /><div><strong>{p.name}</strong><small>{p.sku}</small></div></div></td><td>{stores.find(s => s.id === p.storeId)?.name}<small>{p.category}</small></td><td>{money(p.price, p.currency)} {p.currency}</td><td>{p.stock}</td><td><Badge>{p.active ? 'active' : 'inactive'}</Badge></td><td><div className="seller-row-actions"><button onClick={() => setEdit(p)}>Edit</button><button onClick={() => {
                    if (p.active && !window.confirm(`Deactivate ${p.name}?`)) return;
                    saveProduct({
                      ...p,
                      active: !p.active
                    });
                  }}>{p.active ? 'Deactivate' : 'Activate'}</button></div></td></tr>)}</tbody></table></div>{!rows.length && <Empty />}<Pager page={current} total={rows.length} onChange={setPage} /></section>{(edit || params.has('add')) && <ProductForm key={edit?.id || 'new'} product={edit || {}} onClose={close} />}</>;
}
function Adjustment({
  product
}) {
  const {
      adjustStock
    } = useSeller(),
    [error, setError] = useState('');
  return <form className="seller-adjust" onSubmit={e => {
    e.preventDefault();
    setError(adjustStock(product.id, new FormData(e.currentTarget).get('stock')));
  }}><input aria-label={`Quantity for ${product.name}`} name="stock" type="number" min="0" step="1" required defaultValue={product.stock} /><button>Save</button>{error && <span role="alert" className="seller-error">{error}</span>}</form>;
}
export function Inventory() {
  const {
      products,
      stores
    } = useSeller(),
    [status, setStatus] = useState(''),
    [store, setStore] = useState(''),
    stats = inventory(products),
    rows = products.filter(p => (!store || p.storeId === store) && (!status || (status === 'out' ? p.stock === 0 : status === 'low' ? p.stock > 0 && p.stock <= threshold : p.stock > threshold)));
  return <><PageHeading title="Inventory" description={`A clear view of every shelf. Low stock threshold: ${threshold} units.`} /><Stats items={[{
      label: 'In stock',
      value: stats.inStock,
      detail: `More than ${threshold} units`,
      icon: Package
    }, {
      label: 'Low stock',
      value: stats.low,
      detail: `1–${threshold} units remaining`,
      icon: Boxes
    }, {
      label: 'Out of stock',
      value: stats.out,
      detail: 'Ready for a restock',
      icon: Store
    }]} /><section className="seller-card"><div className="seller-filters"><StoreFilter value={store} onChange={setStore} /><select aria-label="Stock status" value={status} onChange={e => setStatus(e.target.value)}><option value="">All stock levels</option><option value="in">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select></div><div className="seller-table-wrap"><table><thead><tr><th>Product / SKU</th><th>Store</th><th>Stock level</th><th>Set quantity</th></tr></thead><tbody>{rows.map(p => <tr key={p.id}><td><strong>{p.name}</strong><small>{p.sku}</small></td><td>{stores.find(s => s.id === p.storeId)?.name}</td><td><Badge tone={p.stock === 0 ? 'cancelled' : p.stock <= threshold ? 'pending' : 'active'}>{p.stock === 0 ? 'Out of stock' : p.stock <= threshold ? 'Low stock' : 'In stock'} · {p.stock}</Badge></td><td><Adjustment key={`${p.id}-${p.stock}`} product={p} /></td></tr>)}</tbody></table></div>{!rows.length && <Empty />}</section></>;
}

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  ShoppingBag,
  Menu,
  X,
  Plus,
  Minus,
  Store,
  PackageOpen,
  UserRound,
} from "lucide-react";
import { photo, stores } from "../data/marketplace";
import { money } from "../services/catalog";
import { useCart } from "../context/CartContext";
export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Matjari home">
      <span className="brand-icon">
        <ShoppingBag size={21} />
      </span>
      matjari<span className="brand-dot">.</span>
    </Link>
  );
}
export function Image({ id, alt, className = "", width = 700, eager = false }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className={`image-fallback ${className}`} role="img" aria-label={alt}>
      <ShoppingBag />
      <span>{alt}</span>
    </div>
  ) : (
    <img
      className={className}
      src={photo(id, width)}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}
export function SearchBar({
  value,
  onChange,
  placeholder = "Search products…",
  onSubmit,
}) {
  return (
    <form
      className="search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <Search size={18} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {onSubmit && (
        <button className="icon-button" aria-label="Search" type="submit">
          <ArrowRight size={17} />
        </button>
      )}
    </form>
  );
}
export function Header() {
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState("");
  const navigate = useNavigate(),
    { items } = useCart();
  return (
    <header>
      <div className="container header-inner">
        <Brand />
        <nav
          className={open ? "main-nav open" : "main-nav"}
          aria-label="Main navigation"
          onClick={() => setOpen(false)}
        >
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/stores">Stores</NavLink>
          <NavLink to="/products">Products</NavLink>
        </nav>
        <div className="header-search">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Find your next favorite…"
            onSubmit={() => {
              navigate(`/products?search=${encodeURIComponent(search)}`);
              setOpen(false);
            }}
          />
        </div>
        <span
          className="sign-in"
          title="Customer accounts are coming in a future phase"
        >
          <UserRound size={18} />
          Sign in <small>Coming soon</small>
        </span>
        <Link
          className="cart-link"
          to="/cart"
          aria-label={`Shopping cart, ${items.reduce((n, i) => n + i.quantity, 0)} items`}
        >
          <ShoppingBag size={22} />
          <span>{items.reduce((n, i) => n + i.quantity, 0)}</span>
        </Link>
        <button
          className="icon-button mobile-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-top">
        <div>
          <Brand />
          <p>
            Independent stores. Everyday discoveries.
            <br />
            Your marketplace, all in one place.
          </p>
        </div>
        <div>
          <h3>Explore Matjari</h3>
          <Link to="/seller/dashboard">Merchant dashboard · Demo</Link>
          <Link to="/products">All products</Link>
          <Link to="/stores">Our stores</Link>
          <Link to="/products?category=Home+%26+Living">Home & Living</Link>
        </div>
        <div>
          <h3>Make yourself at home.</h3>
          <p>
            A little inspiration. A new favorite.
            <br />
            There’s always something to discover.
          </p>
          <Link className="text-link" to="/products">
            Find your next favorite <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Matjari. A marketplace of possibilities.
        </span>
        <span>
          Made for discovery <span className="brand-dot">✳</span>
        </span>
      </div>
      <div className="container footer-credits">
        <p className="footer-credits-label">Designed &amp; Developed by</p>
        <p className="footer-credits-names">
          Alaa Dere · Hiba Burhan · Marah Zaid · Shorouq Derieh
        </p>
        <p className="footer-credits-project">
          Matjari | Advanced Database Systems Project — Fall 2026
        </p>
      </div>
    </footer>
  );
}
export function SectionHeading({ eyebrow, title, subtitle, to, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {action || "View all"}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function StockBadge({ product }) {
  return (
    <span
      className={`stock ${product.active && product.stock ? "" : "unavailable"}`}
    >
      <i />
      {!product.active
        ? "Unavailable"
        : product.stock
          ? "In stock"
          : "Out of stock"}
    </span>
  );
}
export function ProductCard({ product: p }) {
  const store = stores.find((s) => s.id === p.storeId),
    { add, quantity } = useCart();
  return (
    <article className="product-card">
      <Link className="product-image" to={`/products/${p.id}`}>
        <Image id={p.image} alt={p.name} />
        {!p.stock && <span className="image-label">Out of stock</span>}
      </Link>
      <div className="product-body">
        <Link className="product-store" to={`/stores/${store.slug}`}>
          {store.name}
        </Link>
        <Link className="product-name" to={`/products/${p.id}`}>
          {p.name}
        </Link>
        <StockBadge product={p} />
        <div className="product-bottom">
          <strong>
            {money(p.price, p.currency)} <small>{p.currency}</small>
          </strong>
          <button
            className="add-button"
            disabled={!p.active || !p.stock || quantity(p.id) >= p.stock}
            onClick={() => add(p.id)}
            aria-label={`Add ${p.name} to cart`}
          >
            <Plus size={17} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
export function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
export function StoreCard({ store: s }) {
  return (
    <article className="store-card">
      <Link to={`/stores/${s.slug}`} className="store-image">
        <Image id={s.image} alt={`${s.name} collection`} />
      </Link>
      <div className="store-body">
        <span className="store-logo" style={{ background: s.color }}>
          {s.initials}
        </span>
        <span className="category-label">{s.category}</span>
        <h3>
          <Link to={`/stores/${s.slug}`}>{s.name}</Link>
        </h3>
        <p>{s.description}</p>
        <Link to={`/stores/${s.slug}`} className="text-link">
          Visit store <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
export function EmptyState({
  title = "Nothing here just yet",
  message = "Try a different search or clear your filters.",
  children,
  error = false,
}) {
  const Icon = error ? Store : PackageOpen;
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={32} />
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
    </div>
  );
}
export function Quantity({ value, max, onChange }) {
  return (
    <div className="quantity">
      <button
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={15} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
export function Pagination({ page, pages, onChange }) {
  return (
    pages > 1 && (
      <nav className="pagination" aria-label="Pagination">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            aria-label={`Page ${i + 1}`}
            aria-current={page === i + 1 ? "page" : undefined}
            className={page === i + 1 ? "selected" : ""}
            onClick={() => onChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </nav>
    )
  );
}
export function LoadingSkeleton() {
  return (
    <div
      className="container product-grid loading"
      role="status"
      aria-label="Loading products"
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton" />
      ))}
      <span className="sr-only">Loading products…</span>
    </div>
  );
}

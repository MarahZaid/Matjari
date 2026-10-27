import { useMarketplace } from "../platform/useMarketplace";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShoppingBag, Store } from "lucide-react";
import { money, getRelatedProducts } from "../services/catalog";
import { useCart } from "../context/CartContext";
import {
  Image,
  StockBadge,
  Quantity,
  EmptyState,
  SectionHeading,
  ProductGrid,
} from "../components/Marketplace";
export default function ProductDetails() {
  const { products } = useMarketplace();
  const { id } = useParams(),
    product = products.find((p) => p.id === id);
  return product ? (
    <Details key={id} product={product} />
  ) : (
    <div className="container page">
      <EmptyState
        error
        title="Product not found"
        message="This product may have moved or is no longer listed."
      >
        <Link className="button" to="/products">
          Explore products
        </Link>
      </EmptyState>
    </div>
  );
}
function Details({ product: p }) {
  const { stores, products } = useMarketplace();
  const [count, setCount] = useState(1),
    { add, quantity } = useCart(),
    store = stores.find((s) => s.id === p.storeId),
    remaining = p.stock - quantity(p.id),
    purchasable = p.active && remaining > 0;
  return (
    <div className="container page">
      <Link className="back-link" to="/products">
        <ArrowLeft size={16} />
        Back to products
      </Link>
      <div className="product-detail">
        <div className="detail-image">
          <Image eager id={p.image} alt={p.name} />
        </div>
        <div className="detail-copy">
          <Link
            className="eyebrow"
            to={`/products?category=${encodeURIComponent(p.category)}`}
          >
            {p.category}
          </Link>
          <h1>{p.name}</h1>
          <Link className="text-link" to={`/stores/${store.slug}`}>
            <Store size={17} />
            {store.name}
            <ArrowRight size={15} />
          </Link>
          <div className="detail-price">
            {money(p.price, p.currency)} <small>{p.currency}</small>
          </div>
          <StockBadge product={p} />
          <p className="description">{p.description}</p>
          <div className="purchase-row">
            <Quantity
              value={count}
              max={Math.max(1, remaining)}
              onChange={setCount}
            />
            <button
              className="button"
              disabled={!purchasable}
              onClick={() => {
                add(p.id, Math.min(count, remaining));
                setCount(1);
              }}
            >
              <ShoppingBag size={18} />
              {!p.active
                ? "Unavailable"
                : !p.stock
                  ? "Out of stock"
                  : !remaining
                    ? "Stock limit reached"
                    : "Add to cart"}
            </button>
          </div>
          <p className="muted">
            {p.active && p.stock > 0
              ? `${p.stock} available · ${quantity(p.id)} in your cart`
              : "This product is currently unavailable."}
          </p>
          <div className="store-callout">
            <span className="store-logo" style={{ background: store.color }}>
              {store.initials}
            </span>
            <div>
              <strong>Discover {store.name}</strong>
              <p>{store.description}</p>
              <Link className="text-link" to={`/stores/${store.slug}`}>
                Visit the store <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <section className="section">
        <SectionHeading
          title="More from the same store"
          subtitle={`Keep exploring ${store.name}.`}
          to={`/stores/${store.slug}`}
          action="Visit store"
        />
        <ProductGrid products={getRelatedProducts(p, products)} />
      </section>
    </div>
  );
}

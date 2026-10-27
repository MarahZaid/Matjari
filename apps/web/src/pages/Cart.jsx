import { useMarketplace } from "../platform/useMarketplace";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Info, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { cartTotals, money } from "../services/catalog";
import { Image, Quantity, EmptyState } from "../components/Marketplace";
export default function Cart() {
  const { stores, products } = useMarketplace();
  const { items, update } = useCart(),
    totals = cartTotals(items, products),
    count = items.reduce((n, i) => n + i.quantity, 0);
  return (
    <div className="container page">
      <div className="page-heading">
        <span className="eyebrow">YOUR GOOD FINDS</span>
        <h1>
          Your shopping bag<span className="heading-count">{count}</span>
        </h1>
        <p>A little closer to your next everyday favorites.</p>
      </div>
      {!items.length ? (
        <EmptyState
          title="Your next favorite is out there."
          message="Your bag is empty. Explore our independent stores and find something that feels like you."
        >
          <Link className="button" to="/products">
            Start exploring <ShoppingBag size={18} />
          </Link>
        </EmptyState>
      ) : (
        <div className="cart-layout">
          <div>
            <div className="cart-items">
              {items.map((item) => {
                const p = products.find((p) => p.id === item.id),
                  store = stores.find((s) => s.id === p.storeId);
                return (
                  <article className="cart-item" key={p.id}>
                    <Link to={`/products/${p.id}`} className="cart-image">
                      <Image id={p.image} alt={p.name} width={300} />
                    </Link>
                    <div className="cart-item-copy">
                      <Link
                        className="product-store"
                        to={`/stores/${store.slug}`}
                      >
                        {store.name}
                      </Link>
                      <h3>
                        <Link to={`/products/${p.id}`}>{p.name}</Link>
                      </h3>
                      <p>
                        {money(p.price, p.currency)}{" "}
                        <small>{p.currency} each</small>
                      </p>
                      <Quantity
                        value={item.quantity}
                        max={p.stock}
                        onChange={(n) => update(p.id, n)}
                      />
                    </div>
                    <div className="cart-item-end">
                      <strong>
                        {money(p.price * item.quantity, p.currency)}{" "}
                        <small>{p.currency}</small>
                      </strong>
                      <button
                        className="plain-button remove"
                        onClick={() => update(p.id, 0)}
                        aria-label={`Remove ${p.name}`}
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <Link className="back-link" to="/products">
              <ArrowLeft size={17} />
              Continue shopping
            </Link>
          </div>
          <aside className="cart-summary">
            <h2>Your bag at a glance</h2>
            <p>
              {count} {count === 1 ? "item" : "items"} from independent stores
            </p>
            <div className="totals">
              {Object.entries(totals).map(([currency, total]) => (
                <div key={currency}>
                  <span>Subtotal ({currency})</span>
                  <strong>{money(total, currency)}</strong>
                </div>
              ))}
            </div>
            <div className="checkout-info">
              <Info size={19} />
              <p>
                {Object.keys(totals).length > 1
                  ? "Checkout creates separate orders for each store and currency. No currency conversion."
                  : "Demo checkout creates a separate order for each store. No real payment is collected."}
              </p>
            </div>
            <Link className="button" to="/checkout" aria-describedby="checkout-note">Continue to demo checkout</Link>
            <small id="checkout-note">
              No payment will be collected. Your bag is saved on this device
              when browser storage is available.
            </small>
          </aside>
        </div>
      )}
    </div>
  );
}

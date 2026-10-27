import { useState, useEffect } from "react";
import { products } from "../data/marketplace";
import { validateCart } from "../services/catalog";
import { CartContext } from "./CartContext";
export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return validateCart(
        JSON.parse(localStorage.getItem("matjari-cart") || "[]"),
      );
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem("matjari-cart", JSON.stringify(items));
    } catch {
      /* Storage may be unavailable. */
    }
  }, [items]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);
  const quantity = (id) => items.find((i) => i.id === id)?.quantity || 0;
  function update(id, amount) {
    const p = products.find((p) => p.id === id);
    if (!p?.active) return;
    setItems((current) =>
      validateCart([
        ...current.filter((i) => i.id !== id),
        { id, quantity: Math.min(amount, p.stock) },
      ]),
    );
  }
  function add(id, amount = 1) {
    const p = products.find((p) => p.id === id);
    if (!p?.active || !p.stock) return;
    setItems((current) =>
      validateCart([
        ...current.filter((i) => i.id !== id),
        {
          id,
          quantity: Math.min(
            (current.find((i) => i.id === id)?.quantity || 0) + amount,
            p.stock,
          ),
        },
      ]),
    );
    setNotice(`${p.name} added to your cart`);
  }
  return (
    <CartContext.Provider value={{ items, quantity, update, add }}>
      {children}
      <div className={`toast ${notice ? "visible" : ""}`} role="status">
        {notice}
      </div>
    </CartContext.Provider>
  );
}

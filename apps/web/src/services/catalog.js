import { products, stores } from "../data/marketplace.js";
export const money = (value, currency) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
export const getStoreBySlug = (slug, rows = stores) => rows.find((s) => s.slug === slug);
export const getProductsByStore = (id, rows = products) =>
  rows.filter((p) => p.storeId === id);
export const getProductsByCategory = (category, rows = products) =>
  rows.filter((p) => p.category === category);
export const getRelatedProducts = (product, rows = products) =>
  getProductsByStore(product.storeId, rows)
    .filter((p) => p.id !== product.id && p.active)
    .slice(0, 4);
export function filterProducts({
  search = "",
  category = "",
  store = "",
  currency = "",
  min = "",
  max = "",
  available = false,
  sort = "featured",
  page = 1,
  pageSize = 8,
} = {}, rows = products) {
  const result = rows.filter(
    (p) =>
      p.active &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
      (!category || p.category === category) &&
      (!store || p.storeId === store) &&
      (!currency || p.currency === currency) &&
      (min === "" || p.price >= Number(min)) &&
      (max === "" || p.price <= Number(max)) &&
      (!available || p.stock > 0),
  );
  pageSize = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 8;
  page = Math.min(Math.max(1, Number.isSafeInteger(page) ? page : 1), Math.max(1, Math.ceil(result.length / pageSize)));
  if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
  if (sort.startsWith("price"))
    result.sort(
      (a, b) =>
        a.currency.localeCompare(b.currency) ||
        (sort === "price-desc" ? b.price - a.price : a.price - b.price),
    );
  return {
    page,
    items: result.slice((page - 1) * pageSize, page * pageSize),
    total: result.length,
    pages: Math.ceil(result.length / pageSize),
  };
}
export function validateCart(raw, rows = products) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  return raw.flatMap((item) => {
    const p = rows.find((p) => p.id === item?.id);
    if (
      !p?.active ||
      !p.stock ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      seen.has(p.id)
    )
      return [];
    seen.add(p.id);
    return [{ id: p.id, quantity: Math.min(item.quantity, p.stock) }];
  });
}
export function cartTotals(items, rows = products) {
  return items.reduce((totals, item) => {
    const p = rows.find((p) => p.id === item.id);
    if (p)
      totals[p.currency] = (totals[p.currency] || 0) + p.price * item.quantity;
    return totals;
  }, {});
}

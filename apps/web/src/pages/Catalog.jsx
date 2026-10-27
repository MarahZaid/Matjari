import { useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { categories, stores } from "../data/marketplace";
import { filterProducts } from "../services/catalog";
import {
  Image,
  ProductGrid,
  SearchBar,
  EmptyState,
  Pagination,
} from "../components/Marketplace";
export default function Catalog({ store }) {
  const [params, setParams] = useSearchParams();
  const get = (k) => params.get(k) || "";
  const requestedPage = Number(get("page"));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const query = {
    search: get("search"),
    category: get("category"),
    store: store?.id || get("store"),
    currency: get("currency"),
    min: get("min"),
    max: get("max"),
    available: get("available") === "true",
    sort: get("sort") || "featured",
    page,
  };
  const { items, total, pages } = filterProducts(query);
  function set(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  }
  const storeCategories = store
    ? categories.filter(
        (c) => filterProducts({ store: store.id, category: c }).total,
      )
    : categories;
  return (
    <div className="container page">
      {store ? (
        <>
          <div className="breadcrumb">
            <Link to="/stores">Stores</Link>
            <span>/</span>
            {store.name}
          </div>
          <section className="store-banner">
            <Image
              id={store.image}
              width={1600}
              alt={`${store.name} collection`}
              eager
            />
            <div>
              <span className="store-logo" style={{ background: store.color }}>
                {store.initials}
              </span>
              <span className="eyebrow">
                INDEPENDENT STORE · {store.category}
              </span>
              <h1>{store.name}</h1>
              <p>{store.description}</p>
            </div>
          </section>
        </>
      ) : (
        <div className="page-heading">
          <span className="eyebrow">THE MARKETPLACE</span>
          <h1>Find your next favorite.</h1>
          <p>Thoughtful finds from independent stores. All in one place.</p>
        </div>
      )}
      <div className="catalog-layout">
        <details className="filter-panel" open>
          <summary>
            <SlidersHorizontal size={18} /> Filters
          </summary>
          <div className="filter-content">
            <div className="filter-title">
              <strong>Refine your discoveries</strong>
              <button className="plain-button" onClick={() => setParams({})}>
                Clear filters
              </button>
            </div>
            <fieldset>
              <legend>Category</legend>
              <label className="radio-label">
                <input
                  type="radio"
                  name="category"
                  checked={!query.category}
                  onChange={() => set("category", "")}
                />
                All categories
              </label>
              {storeCategories.map((c) => (
                <label className="radio-label" key={c}>
                  <input
                    type="radio"
                    name="category"
                    checked={query.category === c}
                    onChange={() => set("category", c)}
                  />
                  {c}
                </label>
              ))}
            </fieldset>
            {!store && (
              <label className="field">
                Store
                <select
                  value={query.store}
                  onChange={(e) => set("store", e.target.value)}
                >
                  <option value="">All stores</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="field">
              Currency
              <select
                value={query.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                <option value="">All currencies</option>
                {["USD", "EUR", "ILS"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend>Price range</legend>
              <div className="price-inputs">
                <label>
                  Min
                  <input
                    aria-label="Minimum price"
                    type="number"
                    min="0"
                    value={query.min}
                    onChange={(e) => set("min", e.target.value)}
                    placeholder="0"
                  />
                </label>
                <span>–</span>
                <label>
                  Max
                  <input
                    aria-label="Maximum price"
                    type="number"
                    min="0"
                    value={query.max}
                    onChange={(e) => set("max", e.target.value)}
                    placeholder="Any"
                  />
                </label>
              </div>
              <small>
                Prices use each product’s original currency. Select a currency
                for direct comparisons.
              </small>
            </fieldset>
            <label className="radio-label">
              <input
                type="checkbox"
                checked={query.available}
                onChange={(e) =>
                  set("available", e.target.checked ? "true" : "")
                }
              />
              In stock only
            </label>
          </div>
        </details>
        <section className="catalog-results" aria-label="Products">
          <div className="catalog-toolbar">
            <SearchBar
              value={query.search}
              onChange={(v) => set("search", v)}
              placeholder={store ? "Search this store…" : "Search products…"}
            />
            <label className="sort-label">
              Sort by
              <select
                aria-label="Sort products"
                value={query.sort}
                onChange={(e) => set("sort", e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="name">Name: A to Z</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
          <div className="results-count">
            <span>
              <strong>{total}</strong> products to discover
              {store ? ` at ${store.name}` : ""}
            </span>
            <span>
              Page {page} of {Math.max(1, pages)}
            </span>
          </div>
          {query.sort.startsWith("price") && !query.currency && (
            <p className="filter-note">
              Prices sorted within each currency: EUR, ILS, USD.
            </p>
          )}
          {items.length ? (
            <ProductGrid products={items} />
          ) : (
            <EmptyState
              title={
                store
                  ? "No finds in this corner of the store"
                  : "No matching products"
              }
            >
              <button
                className="button secondary"
                onClick={() => setParams({})}
              >
                Clear filters
              </button>
            </EmptyState>
          )}
          <Pagination
            page={page}
            pages={Math.max(1, pages)}
            onChange={(p) => set("page", String(p))}
          />
        </section>
      </div>
    </div>
  );
}

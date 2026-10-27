import { useSearchParams } from "react-router-dom";
import { stores, categories } from "../data/marketplace";
import { SearchBar, StoreCard, EmptyState } from "../components/Marketplace";
export default function Stores() {
  const [params, setParams] = useSearchParams(),
    search = params.get("search") || "",
    category = params.get("category") || "",
    limit = Number(params.get("limit")) || 4;
  const result = stores.filter(
    (s) =>
      (s.name + " " + s.description)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!category || s.category === category),
  );
  function set(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "limit") next.delete("limit");
    setParams(next, { replace: true });
  }
  return (
    <div className="container page">
      <div className="page-heading">
        <span className="eyebrow">INDEPENDENT SPIRIT. ENDLESS DISCOVERY.</span>
        <h1>Find your kind of store.</h1>
        <p>
          Meet the people and collections that make our marketplace special.
        </p>
      </div>
      <div className="directory-toolbar">
        <SearchBar
          value={search}
          onChange={(v) => set("search", v)}
          placeholder="Search stores…"
        />
        <label className="sort-label">
          Category
          <select
            value={category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="results-count">{result.length} independent stores</p>
      {result.length ? (
        <div className="store-grid directory-grid">
          {result.slice(0, limit).map((s) => (
            <StoreCard key={s.id} store={s} />
          ))}
        </div>
      ) : (
        <EmptyState title="No stores found">
          <button className="button secondary" onClick={() => setParams({})}>
            Clear filters
          </button>
        </EmptyState>
      )}
      {limit < result.length && (
        <div className="load-more">
          <button
            className="button secondary"
            onClick={() => set("limit", String(limit + 4))}
          >
            Discover more stores
          </button>
        </div>
      )}
    </div>
  );
}

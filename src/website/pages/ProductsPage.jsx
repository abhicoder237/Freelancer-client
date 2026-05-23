import { useState }              from "react";
import { Link }                  from "react-router-dom";
import { useQuery }              from "@tanstack/react-query";
import productService            from "@services/productService.js";
import { useClient }             from "@context/ClientContext.jsx";
import { QUERY_KEYS }            from "@constants/api.js";
import { formatCurrency, getDiscountPercent, debounce } from "@utils/helpers.js";
import { SkeletonCard }          from "@components/Loader.jsx";
import { Badge }                 from "@components/index.js";

// ─────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────

const ProductCard = ({ product }) => {
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const discount     = getDiscountPercent(product.price, product.compareAtPrice);
  const isOutOfStock = product.trackInventory && product.stock === 0;

  return (
    <Link
      to={"/products/" + product.slug}
      style={{ textDecoration: "none", display: "block", background: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflow: "hidden", transition: "all 0.25s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.10)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Image */}
      <div style={{ aspectRatio: "1", overflow: "hidden", position: "relative", background: "var(--color-border)" }}>
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.06)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", color: "var(--color-text-secondary)" }}>
            📦
          </div>
        )}

        {/* Badges */}
        <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {discount > 0 && (
            <span style={{ background: "var(--color-error)", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700" }}>
              -{discount}%
            </span>
          )}
          {isOutOfStock && (
            <span style={{ background: "rgba(0,0,0,0.7)", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "600" }}>
              Out of Stock
            </span>
          )}
        </div>

        {product.isFeatured && (
          <span style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "var(--color-accent)", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700" }}>
            ⭐ Featured
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "1rem" }}>
        <p style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", textTransform: "capitalize", marginBottom: "0.375rem", letterSpacing: "0.03em" }}>
          {product.category}
        </p>

        <h3 style={{ fontSize: "0.925rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.75rem", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.name}
        </h3>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-primary)" }}>
              {formatCurrency(product.price, product.currency)}
            </p>
            {product.compareAtPrice && (
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", textDecoration: "line-through", marginTop: "1px" }}>
                {formatCurrency(product.compareAtPrice, product.currency)}
              </p>
            )}
          </div>

          <button
            style={{ padding: "0.4rem 0.875rem", background: isOutOfStock ? "var(--color-surface)" : "var(--color-primary)", color: isOutOfStock ? "var(--color-text-secondary)" : "#fff", border: isOutOfStock ? "1px solid var(--color-border)" : "none", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", cursor: isOutOfStock ? "not-allowed" : "pointer", transition: "opacity 0.2s" }}
          >
            {isOutOfStock ? "Sold Out" : "View"}
          </button>
        </div>
      </div>
    </Link>
  );
};

// ─────────────────────────────────────────
// PRODUCTS PAGE
// ─────────────────────────────────────────

const ProductsPage = () => {
  const { clientSlug } = useClient();

  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort,     setSort]     = useState("-createdAt");
  const [page,     setPage]     = useState(1);
  const [inStock,  setInStock]  = useState(false);
  const limit = 12;

  // ── Fetch categories ─────────────────────
  const { data: catData } = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES(clientSlug),
    queryFn:  productService.getCategories,
    enabled:  !!clientSlug,
  });

  const categories = catData?.data || [];

  // ── Fetch products ───────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_PRODUCTS(clientSlug, { search, category, minPrice, maxPrice, sort, page, inStock }),
    queryFn:  () => productService.getPublicProducts({ search, category, minPrice, maxPrice, sort, page, limit, inStock: inStock ? "true" : undefined }),
    enabled:  !!clientSlug,
    keepPreviousData: true,
  });

  const products = data?.data || [];
  const meta     = data?.meta || {};

  const handleSearch = debounce((val) => {
    setSearch(val);
    setPage(1);
  }, 400);

  return (
    <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>
          Our Products
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          {meta.total ? meta.total + " products found" : "Explore our collection"}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem", alignItems: "start" }}>

        {/* ── Sidebar Filters ─────────────── */}
        <aside style={{ background: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", padding: "1.25rem", position: "sticky", top: "5rem" }}>

          <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
            Filters
          </h2>

          {/* Search */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search products..."
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
                Category
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <button
                  onClick={() => { setCategory(""); setPage(1); }}
                  style={{ textAlign: "left", padding: "0.375rem 0.625rem", borderRadius: "6px", border: "none", background: !category ? "color-mix(in srgb, var(--color-primary) 15%, transparent)" : "transparent", color: !category ? "var(--color-primary)" : "var(--color-text-secondary)", fontWeight: !category ? "600" : "400", cursor: "pointer", fontSize: "0.875rem" }}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => { setCategory(cat.category); setPage(1); }}
                    style={{ textAlign: "left", padding: "0.375rem 0.625rem", borderRadius: "6px", border: "none", background: category === cat.category ? "color-mix(in srgb, var(--color-primary) 15%, transparent)" : "transparent", color: category === cat.category ? "var(--color-primary)" : "var(--color-text-secondary)", fontWeight: category === cat.category ? "600" : "400", cursor: "pointer", fontSize: "0.875rem", display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ textTransform: "capitalize" }}>{cat.category}</span>
                    <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
              Price Range
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                style={{ width: "50%", padding: "0.4rem 0.5rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.8rem", outline: "none" }}
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                style={{ width: "50%", padding: "0.4rem 0.5rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.8rem", outline: "none" }}
              />
            </div>
          </div>

          {/* In Stock */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => { setInStock(e.target.checked); setPage(1); }}
              />
              In Stock Only
            </label>
          </div>

          {/* Clear filters */}
          {(category || search || minPrice || maxPrice || inStock) && (
            <button
              onClick={() => { setCategory(""); setSearch(""); setMinPrice(""); setMaxPrice(""); setInStock(false); setPage(1); }}
              style={{ width: "100%", padding: "0.5rem", background: "var(--color-error)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer" }}
            >
              Clear Filters
            </button>
          )}
        </aside>

        {/* ── Products Grid ────────────────── */}
        <div>

          {/* Sort + count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              {isLoading ? "Loading..." : meta.total + " results"}
            </p>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              style={{ padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A–Z</option>
              <option value="-name">Name: Z–A</option>
            </select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "1.25rem" }}>
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--color-text-secondary)" }}>
              <p style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🔍</p>
              <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                No products found
              </p>
              <p style={{ fontSize: "0.875rem" }}>
                Try adjusting your filters or search term.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "1.25rem", opacity: isFetching ? 0.6 : 1, transition: "opacity 0.2s" }}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ padding: "0.5rem 1rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1, fontSize: "0.875rem" }}
              >
                ← Prev
              </button>

              {[...Array(meta.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  style={{ padding: "0.5rem 0.875rem", border: "1.5px solid", borderColor: page === i + 1 ? "var(--color-primary)" : "var(--color-border)", borderRadius: "8px", background: page === i + 1 ? "var(--color-primary)" : "var(--color-background)", color: page === i + 1 ? "#fff" : "var(--color-text-primary)", cursor: "pointer", fontSize: "0.875rem", fontWeight: page === i + 1 ? "600" : "400" }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: "0.5rem 1rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", cursor: page >= meta.totalPages ? "not-allowed" : "pointer", opacity: page >= meta.totalPages ? 0.5 : 1, fontSize: "0.875rem" }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
import { useState }              from "react";
import { useParams, Link }       from "react-router-dom";
import { useProduct }            from "@hooks/useProducts.js";
import { formatCurrency, getDiscountPercent, getStockLabel } from "@utils/helpers.js";
import { Badge }                 from "@components/index.js";
import { SkeletonBox }           from "@components/Loader.jsx";

const ProductDetail = () => {
  const { slug }              = useParams();
  const { data, isLoading }   = useProduct(slug);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity,    setQuantity]    = useState(1);

  const product = data?.data || null;

  if (isLoading) {
    return (
      <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          <SkeletonBox style={{ aspectRatio: "1", borderRadius: "16px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[...Array(5)].map((_, i) => (
              <SkeletonBox key={i} style={{ height: i === 0 ? "2.5rem" : "1rem", width: i === 2 ? "60%" : "100%", borderRadius: "6px" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div>
          <p style={{ fontSize: "4rem", marginBottom: "1rem" }}>😕</p>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
            Product Not Found
          </h2>
          <Link to="/products" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: "500" }}>
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discount     = getDiscountPercent(product.price, product.compareAtPrice);
  const stockInfo    = getStockLabel(product);
  const isOutOfStock = product.trackInventory && product.stock === 0;
  const images       = product.images || [];
  const primaryIndex = images.findIndex((i) => i.isPrimary);

  return (
    <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
        <Link to="/" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Home</Link>
        <span>›</span>
        <Link to="/products" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Products</Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)", fontWeight: "500" }}>{product.name}</span>
      </nav>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start", marginBottom: "4rem" }}>

        {/* ── Images ──────────────────────── */}
        <div>
          {/* Main image */}
          <div style={{ aspectRatio: "1", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--color-border)", background: "var(--color-surface)", marginBottom: "0.75rem" }}>
            {images.length > 0 ? (
              <img
                src={images[activeImage]?.url || images[0]?.url}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>
                📦
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{ width: "4.5rem", height: "4.5rem", borderRadius: "8px", overflow: "hidden", border: activeImage === i ? "2.5px solid var(--color-primary)" : "1.5px solid var(--color-border)", cursor: "pointer", padding: 0, background: "none", transition: "border-color 0.15s" }}
                >
                  <img src={img.url} alt={product.name + " " + (i + 1)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ─────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Category + badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", textTransform: "capitalize", letterSpacing: "0.05em" }}>
              {product.category}
            </span>
            {product.subcategory && (
              <>
                <span style={{ color: "var(--color-border)" }}>›</span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", textTransform: "capitalize" }}>
                  {product.subcategory}
                </span>
              </>
            )}
            {product.isFeatured && <Badge variant="warning">⭐ Featured</Badge>}
          </div>

          {/* Name */}
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)", lineHeight: "1.2" }}>
            {product.name}
          </h1>

          {/* Short description */}
          {product.shortDescription && (
            <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", lineHeight: "1.7" }}>
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
            <p style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-primary)" }}>
              {formatCurrency(product.price, product.currency)}
            </p>
            {product.compareAtPrice && (
              <p style={{ fontSize: "1.1rem", color: "var(--color-text-secondary)", textDecoration: "line-through", marginBottom: "0.25rem" }}>
                {formatCurrency(product.compareAtPrice, product.currency)}
              </p>
            )}
            {discount > 0 && (
              <Badge variant="error">{discount}% OFF</Badge>
            )}
          </div>

          {/* Stock status */}
          <div>
            <Badge variant={stockInfo.color === "success" ? "success" : stockInfo.color === "error" ? "error" : "warning"}>
              {stockInfo.label}
            </Badge>
            {product.trackInventory && product.stock > 0 && product.stock <= 10 && (
              <p style={{ fontSize: "0.8rem", color: "var(--color-error)", marginTop: "0.375rem" }}>
                Only {product.stock} left in stock!
              </p>
            )}
          </div>

          {/* SKU */}
          {product.sku && (
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
              SKU: <span style={{ fontFamily: "monospace", color: "var(--color-text-primary)" }}>{product.sku}</span>
            </p>
          )}

          {/* Variants */}
          {product.variants?.map((variant) => (
            <div key={variant.name}>
              <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-text-primary)", display: "block", marginBottom: "0.5rem" }}>
                {variant.name}
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {variant.options.map((opt) => (
                  <button
                    key={opt}
                    style={{ padding: "0.375rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", background: "var(--color-background)", color: "var(--color-text-primary)", cursor: "pointer", fontSize: "0.875rem", fontWeight: "500" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.color = "var(--color-primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity + Add to cart */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            {/* Quantity */}
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--color-border)", borderRadius: "8px", overflow: "hidden" }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: "2.5rem", height: "2.5rem", background: "var(--color-surface)", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--color-text-primary)" }}
              >
                −
              </button>
              <span style={{ width: "3rem", textAlign: "center", fontWeight: "600", fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                style={{ width: "2.5rem", height: "2.5rem", background: "var(--color-surface)", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--color-text-primary)" }}
              >
                +
              </button>
            </div>

            {/* CTA */}
            <button
              disabled={isOutOfStock}
              style={{ flex: 1, padding: "0.75rem 1.5rem", background: isOutOfStock ? "var(--color-surface)" : "var(--color-primary)", color: isOutOfStock ? "var(--color-text-secondary)" : "#fff", border: isOutOfStock ? "1.5px solid var(--color-border)" : "none", borderRadius: "10px", fontWeight: "700", fontSize: "1rem", cursor: isOutOfStock ? "not-allowed" : "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { if (!isOutOfStock) e.currentTarget.style.filter = "brightness(0.9)"; }}
              onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
            >
              {isOutOfStock ? "Out of Stock" : "🛒 Add to Cart"}
            </button>
          </div>

          {/* Shipping */}
          {product.isFreeShipping && (
            <p style={{ fontSize: "0.875rem", color: "var(--color-success)", fontWeight: "500" }}>
              🚚 Free Shipping Available
            </p>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
              {product.tags.map((tag) => (
                <span key={tag} style={{ padding: "0.2rem 0.6rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "9999px", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div style={{ background: "var(--color-surface)", borderRadius: "14px", padding: "2rem", border: "1px solid var(--color-border)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>
            Description
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
            {product.description}
          </p>
        </div>
      )}

      {/* Back link */}
      <div style={{ marginTop: "2rem" }}>
        <Link
          to="/products"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: "500", fontSize: "0.9rem" }}
        >
          ← Back to Products
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;
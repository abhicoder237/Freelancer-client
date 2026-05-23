import { Link }                  from "react-router-dom";
import { useFeaturedProducts }   from "@hooks/useProducts.js";
import { formatCurrency, getDiscountPercent } from "@utils/helpers.js";
import { SkeletonCard }          from "@components/Loader.jsx";

const ProductCard = ({ product }) => {
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const discount     = getDiscountPercent(product.price, product.compareAtPrice);

  return (
    <Link
      to={"/products/" + product.slug}
      style={{ textDecoration: "none", display: "block", background: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", overflow: "hidden", transition: "all 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Image */}
      <div style={{ aspectRatio: "1", overflow: "hidden", position: "relative", background: "var(--color-border)" }}>
        {primaryImage ? (
          <img src={primaryImage.url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>📦</div>
        )}

        {discount > 0 && (
          <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: "var(--color-error)", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
            -{discount}%
          </div>
        )}

        {product.isFeatured && (
          <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "var(--color-accent)", color: "#fff", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
            ⭐ Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "1rem" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", textTransform: "capitalize", marginBottom: "0.375rem" }}>
          {product.category}
        </p>
        <h3 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.625rem", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.name}
        </h3>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-primary)" }}>
              {formatCurrency(product.price, product.currency)}
            </p>
            {product.compareAtPrice && (
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", textDecoration: "line-through" }}>
                {formatCurrency(product.compareAtPrice, product.currency)}
              </p>
            )}
          </div>

          <button style={{ padding: "0.4rem 0.875rem", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer" }}>
            View
          </button>
        </div>
      </div>
    </Link>
  );
};

const ProductsSection = () => {
  const { data, isLoading } = useFeaturedProducts(8);
  const products = data?.data || [];

  return (
    <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "0 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
          Our Products
        </p>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)" }}>
          Featured Products
        </h2>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</p>
          <p>No products available yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {products.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            to="/products"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.75rem", border: "2px solid var(--color-primary)", color: "var(--color-primary)", borderRadius: "10px", fontWeight: "600", textDecoration: "none", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-primary)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-primary)"; }}
          >
            View All Products →
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
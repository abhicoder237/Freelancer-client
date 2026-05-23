const FeaturesSection = ({ data }) => {
  if (!data) return null;

  const { heading, subheading, description, items = [], layout = "grid-3" } = data;

  const cols = layout === "grid-2" ? 2 : layout === "grid-4" ? 4 : 3;

  return (
    <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "0 1.5rem" }}>

      {/* Header */}
      {(heading || subheading) && (
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          {subheading && (
            <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {subheading}
            </p>
          )}
          {heading && (
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)", lineHeight: "1.2" }}>
              {heading}
            </h2>
          )}
          {description && (
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginTop: "0.75rem", maxWidth: "600px", margin: "0.75rem auto 0" }}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {items.sort((a, b) => a.order - b.order).map((item, i) => (
            <div
              key={i}
              style={{ padding: "1.75rem", background: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)", textAlign: "center", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* Icon */}
              {item.icon && (
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                  {item.icon}
                </div>
              )}

              {/* Image */}
              {item.image?.url && !item.icon && (
                <img src={item.image.url} alt={item.title} style={{ width: "3.5rem", height: "3.5rem", objectFit: "contain", margin: "0 auto 1rem", borderRadius: "10px" }} />
              )}

              {/* Title */}
              {item.title && (
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "0.625rem", fontFamily: "var(--font-heading)" }}>
                  {item.title}
                </h3>
              )}

              {/* Description */}
              {item.description && (
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: "1.7" }}>
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturesSection;
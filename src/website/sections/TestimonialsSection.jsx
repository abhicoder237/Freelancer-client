const TestimonialsSection = ({ data }) => {
  if (!data) return null;

  const { heading, subheading, items = [] } = data;

  return (
    <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "0 1.5rem" }}>
      {(heading || subheading) && (
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          {subheading && <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{subheading}</p>}
          {heading && <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)" }}>{heading}</h2>}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
        {items.sort((a, b) => a.order - b.order).map((item, i) => (
          <div key={i} style={{ padding: "1.5rem", background: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
            {/* Stars */}
            <div style={{ display: "flex", gap: "2px", marginBottom: "0.75rem" }}>
              {[...Array(5)].map((_, j) => (
                <span key={j} style={{ color: j < (item.rating || 5) ? "#F59E0B" : "var(--color-border)", fontSize: "1rem" }}>★</span>
              ))}
            </div>

            {/* Content */}
            <p style={{ fontSize: "0.95rem", color: "var(--color-text-primary)", lineHeight: "1.7", marginBottom: "1.25rem", fontStyle: "italic" }}>
              "{item.content}"
            </p>

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {item.avatar?.url ? (
                <img src={item.avatar.url} alt={item.name} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "0.875rem" }}>
                  {item.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>{item.name}</p>
                {item.role && <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "1px" }}>{item.role}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
const StatsSection = ({ data }) => {
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1.5rem" }}>
        {items.sort((a, b) => a.order - b.order).map((stat, i) => (
          <div key={i} style={{ textAlign: "center", padding: "1.5rem 1rem", background: "var(--color-surface)", borderRadius: "14px", border: "1px solid var(--color-border)" }}>
            {stat.icon && <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{stat.icon}</p>}
            <p style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--color-primary)", fontFamily: "var(--font-heading)", lineHeight: "1" }}>
              {stat.value}
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "0.5rem", fontWeight: "500" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
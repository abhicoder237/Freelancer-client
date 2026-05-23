import { useState } from "react";

const FaqSection = ({ data }) => {
  if (!data) return null;

  const { heading, subheading, items = [] } = data;
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 1.5rem" }}>
      {(heading || subheading) && (
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          {subheading && <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{subheading}</p>}
          {heading && <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)" }}>{heading}</h2>}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.sort((a, b) => a.order - b.order).map((item, i) => (
          <div key={i} style={{ border: "1px solid var(--color-border)", borderRadius: "10px", overflow: "hidden" }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", background: openIndex === i ? "var(--color-surface)" : "var(--color-background)", border: "none", cursor: "pointer", textAlign: "left", gap: "1rem" }}
            >
              <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
                {item.question}
              </p>
              <span style={{ color: "var(--color-primary)", fontSize: "1.25rem", flexShrink: 0, transition: "transform 0.2s", transform: openIndex === i ? "rotate(45deg)" : "rotate(0)" }}>
                +
              </span>
            </button>

            {openIndex === i && (
              <div style={{ padding: "0 1.25rem 1rem", background: "var(--color-surface)" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: "1.7" }}>
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
import { Link } from "react-router-dom";

const BannerSection = ({ data }) => {
  if (!data) return null;

  const {
    heading,
    subheading,
    backgroundImage,
    backgroundColor = "var(--color-primary)",
    textColor       = "#ffffff",
    cta,
    badgeText,
    badgeColor      = "var(--color-accent)",
  } = data;

  return (
    <div style={{ position: "relative", background: backgroundImage?.url ? "transparent" : backgroundColor, overflow: "hidden", borderRadius: "0" }}>

      {backgroundImage?.url && (
        <>
          <img src={backgroundImage.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1 }} />
        </>
      )}

      <div style={{ position: "relative", zIndex: 2, maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "3rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>

        <div style={{ flex: 1 }}>
          {badgeText && (
            <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", background: badgeColor, color: "#fff", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "700", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {badgeText}
            </span>
          )}

          {heading && (
            <h2 style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", fontWeight: "800", color: textColor, fontFamily: "var(--font-heading)", marginBottom: "0.5rem" }}>
              {heading}
            </h2>
          )}

          {subheading && (
            <p style={{ fontSize: "1rem", color: textColor, opacity: 0.85 }}>
              {subheading}
            </p>
          )}
        </div>

        {cta?.label && (
          <Link
            to={cta.href || "/"}
            style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.75rem", background: "#ffffff", color: backgroundColor, borderRadius: "10px", fontWeight: "700", fontSize: "0.95rem", textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.2s", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
};

export default BannerSection;
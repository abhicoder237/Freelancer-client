import { Link } from "react-router-dom";

const HeroSection = ({ data }) => {
  if (!data) return null;

  const {
    heading,
    subheading,
    description,
    backgroundImage,
    overlayColor   = "#000000",
    overlayOpacity = 0.4,
    alignment      = "center",
    primaryCta,
    secondaryCta,
    variant        = "fullscreen",
  } = data;

  const alignStyle = {
    textAlign:       alignment,
    alignItems:      alignment === "left" ? "flex-start" : alignment === "right" ? "flex-end" : "center",
    justifyContent:  "center",
  };

  const isSplit = variant === "split";

  return (
    <div style={{ position: "relative", minHeight: isSplit ? "auto" : "85vh", display: "flex", alignItems: "center", overflow: "hidden", background: backgroundImage?.url ? "transparent" : "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}>

      {/* Background image */}
      {backgroundImage?.url && (
        <>
          <img
            src={backgroundImage.url}
            alt={backgroundImage.altText || "Hero background"}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          />
          {/* Overlay */}
          <div style={{ position: "absolute", inset: 0, background: overlayColor, opacity: overlayOpacity, zIndex: 1 }} />
        </>
      )}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "4rem 1.5rem", display: "flex", flexDirection: isSplit ? "row" : "column", ...alignStyle, gap: "2rem" }}>

        <div style={{ maxWidth: isSplit ? "50%" : "700px", display: "flex", flexDirection: "column", ...alignStyle, gap: "1.25rem" }}>

          {/* Subheading */}
          {subheading && (
            <p style={{ fontSize: "0.95rem", fontWeight: "600", color: backgroundImage?.url ? "rgba(255,255,255,0.85)" : "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {subheading}
            </p>
          )}

          {/* Heading */}
          {heading && (
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "800", color: backgroundImage?.url ? "#ffffff" : "#ffffff", lineHeight: "1.1", fontFamily: "var(--font-heading)" }}>
              {heading}
            </h1>
          )}

          {/* Description */}
          {description && (
            <p style={{ fontSize: "1.1rem", color: backgroundImage?.url ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.9)", lineHeight: "1.7", maxWidth: "560px" }}>
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          {(primaryCta?.label || secondaryCta?.label) && (
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: alignment === "center" ? "center" : "flex-start" }}>

              {primaryCta?.label && (
                <Link
                  to={primaryCta.href || "/"}
                  style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.75rem", background: "#ffffff", color: "var(--color-primary)", borderRadius: "10px", fontWeight: "700", fontSize: "0.95rem", textDecoration: "none", transition: "all 0.2s", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)"; }}
                >
                  {primaryCta.label}
                </Link>
              )}

              {secondaryCta?.label && (
                <Link
                  to={secondaryCta.href || "/"}
                  style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.75rem", background: "rgba(255,255,255,0.15)", color: "#ffffff", borderRadius: "10px", fontWeight: "600", fontSize: "0.95rem", textDecoration: "none", border: "2px solid rgba(255,255,255,0.5)", transition: "all 0.2s", backdropFilter: "blur(10px)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
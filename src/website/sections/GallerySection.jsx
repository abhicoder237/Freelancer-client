import { useState } from "react";

const GallerySection = ({ data }) => {
  if (!data) return null;

  const { heading, subheading, images = [], columns = 3 } = data;
  const [lightbox, setLightbox] = useState(null);

  return (
    <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "0 1.5rem" }}>
      {(heading || subheading) && (
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          {subheading && <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{subheading}</p>}
          {heading && <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: "800", color: "var(--color-text-primary)", fontFamily: "var(--font-heading)" }}>{heading}</h2>}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(" + columns + ", 1fr)", gap: "0.75rem" }}>
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setLightbox(img)}
            style={{ aspectRatio: "1", borderRadius: "10px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <img src={img.url} alt={img.altText || "Gallery image " + (i + 1)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}
        >
          <img src={lightbox.url} alt={lightbox.altText} style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "8px" }} />
          <button
            onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontSize: "1.5rem", width: "2.5rem", height: "2.5rem", borderRadius: "50%", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default GallerySection;
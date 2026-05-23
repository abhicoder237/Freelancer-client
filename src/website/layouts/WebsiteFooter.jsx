import { Link }      from "react-router-dom";
import { useClient } from "@context/ClientContext.jsx";

const WebsiteFooter = () => {
  const { client, logo, social, contact } = useClient();
  const year = new Date().getFullYear();

  const socialLinks = [
    { key: "facebook",  icon: "📘", label: "Facebook" },
    { key: "instagram", icon: "📸", label: "Instagram" },
    { key: "twitter",   icon: "🐦", label: "Twitter" },
    { key: "linkedin",  icon: "💼", label: "LinkedIn" },
    { key: "youtube",   icon: "▶️", label: "YouTube" },
  ].filter((s) => social?.[s.key]);

  return (
    <footer style={{ background: "var(--color-footer)", color: "#fff", padding: "3rem 1.5rem 1.5rem" }}>
      <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto" }}>

        {/* Top section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>

          {/* Brand */}
          <div>
            {logo?.url ? (
              <img src={logo.url} alt={client?.name} style={{ height: "2rem", objectFit: "contain", marginBottom: "0.75rem", filter: "brightness(0) invert(1)" }} />
            ) : (
              <p style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem" }}>
                {client?.name}
              </p>
            )}

            {client?.tagline && (
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", lineHeight: "1.6", marginBottom: "1rem" }}>
                {client.tagline}
              </p>
            )}

            {/* Social links */}
{socialLinks.length > 0 && (
  <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
    {socialLinks.map((s) => (
      <button
        key={s.key}
        onClick={() => window.open(social[s.key], "_blank")}
        title={s.label}
        style={{ width: "2rem", height: "2rem", borderRadius: "6px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", fontSize: "0.9rem" }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
      >
        {s.icon}
      </button>
    ))}
  </div>
)}
          </div>

          {/* Quick Links */}
          <div>
            <p style={{ fontWeight: "600", marginBottom: "1rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quick Links
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "Home",     to: "/" },
                { label: "Products", to: "/products" },
                { label: "About",    to: "/about" },
                { label: "Contact",  to: "/contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          {(contact?.email || contact?.phone || contact?.address?.city) && (
            <div>
              <p style={{ fontWeight: "600", marginBottom: "1rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Contact
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {contact?.email && (
                  <a href={"mailto:" + contact.email} style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.875rem" }}>
                    📧 {contact.email}
                  </a>
                )}
                {contact?.phone && (
                  <a href={"tel:" + contact.phone} style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.875rem" }}>
                    📞 {contact.phone}
                  </a>
                )}
                {contact?.whatsapp && (
                  <a href={"https://wa.me/" + contact.whatsapp.replace(/\D/g, "")} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.875rem" }}>
                    💬 WhatsApp
                  </a>
                )}
                {contact?.address?.city && (
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>
                    📍 {contact.address.city}{contact.address.state ? ", " + contact.address.state : ""}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
            © {year} {client?.name}. All rights reserved.
          </p>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
            Powered by SaaS Platform
          </p>
        </div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;
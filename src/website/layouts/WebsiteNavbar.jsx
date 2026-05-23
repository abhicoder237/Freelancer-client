import { useState }      from "react";
import { Link, useLocation } from "react-router-dom";
import { useClient }     from "@context/ClientContext.jsx";

const WebsiteNavbar = () => {
  const { client, logo, theme } = useClient();
  const location                = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = theme?.navbar?.links?.length > 0
    ? theme.navbar.links
    : [
        { label: "Home",     href: "/" },
        { label: "Products", href: "/products" },
        { label: "About",    href: "/about" },
        { label: "Contact",  href: "/contact" },
      ];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      <nav style={{ background: "var(--color-navbar)", borderBottom: "1px solid var(--color-border)", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "var(--container-max-width, 1280px)", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "4rem" }}>

          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            {logo?.url ? (
              <img src={logo.url} alt={logo.altText || client?.name} style={{ height: "2.25rem", maxWidth: "8rem", objectFit: "contain" }} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "2rem", height: "2rem", borderRadius: "8px", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "1rem" }}>
                  {client?.name?.[0] || "S"}
                </div>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: "700", fontSize: "1.1rem", color: "var(--color-text-primary)" }}>
                  {client?.name || "Website"}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                style={{ padding: "0.5rem 0.875rem", borderRadius: "8px", textDecoration: "none", fontSize: "0.9rem", fontWeight: isActive(link.href) ? "600" : "500", color: isActive(link.href) ? "var(--color-primary)" : "var(--color-text-secondary)", background: isActive(link.href) ? "color-mix(in srgb, var(--color-primary) 10%, transparent)" : "transparent", transition: "all 0.15s" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ padding: "0.5rem", background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "var(--color-text-primary)" }}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position: "fixed", top: "4rem", left: 0, right: 0, background: "var(--color-background)", borderBottom: "1px solid var(--color-border)", zIndex: 99, padding: "1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              style={{ display: "block", padding: "0.75rem 1rem", textDecoration: "none", fontSize: "0.95rem", fontWeight: "500", color: isActive(link.href) ? "var(--color-primary)" : "var(--color-text-primary)", borderRadius: "8px", marginBottom: "0.25rem", background: isActive(link.href) ? "color-mix(in srgb, var(--color-primary) 10%, transparent)" : "transparent" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default WebsiteNavbar;
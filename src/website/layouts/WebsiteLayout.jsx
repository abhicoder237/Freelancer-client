import { Outlet }        from "react-router-dom";
import { useClient }     from "@context/ClientContext.jsx";
import { PageLoader }    from "@components/Loader.jsx";
import WebsiteNavbar     from "./WebsiteNavbar.jsx";
import WebsiteFooter     from "./WebsiteFooter.jsx";

// ─────────────────────────────────────────
// WEBSITE LAYOUT
// Wraps all public-facing pages
// ─────────────────────────────────────────

const WebsiteLayout = () => {
  const { client, isLoading, error } = useClient();

  // Loading state
  if (isLoading) return <PageLoader message="Loading website..." />;

  // No client found
  if (error || !client) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "4rem", marginBottom: "1rem" }}>🌐</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
            Website Not Found
          </h1>
          <p style={{ color: "#6B7280", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Please provide a valid client slug to load the website.
          </p>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>
            Add <code style={{ background: "#F3F4F6", padding: "2px 8px", borderRadius: "4px" }}>?client=your-slug</code> to the URL
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-background)", color: "var(--color-text-primary)", fontFamily: "var(--font-body)" }}>

      {/* Navbar */}
      <WebsiteNavbar />

      {/* Main content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <WebsiteFooter />
    </div>
  );
};

export default WebsiteLayout;
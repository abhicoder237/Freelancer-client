 import { useState } from "react";
import { useAuth }  from "@context/AuthContext.jsx";
import { useClient } from "@context/ClientContext.jsx";

const AdminTopbar = ({ onMenuClick, sidebarOpen }) => {
  const { user, logout }       = useAuth();
  const { client, clientSlug } = useClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header style={{ height: "4rem", background: "var(--color-background)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 20 }}>

      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

        {/* Menu toggle */}
        <button
          onClick={onMenuClick}
          style={{ padding: "0.5rem", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", fontSize: "1rem", color: "var(--color-text-secondary)" }}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>

        {/* Client info */}
        {client && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--color-primary)", fontWeight: "600", fontSize: "0.9rem" }}>
              {client.name}
            </span>
            <span style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>
              • {client.plan} plan
            </span>
          </div>
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>

        {/* View Site */}
        {clientSlug && (
          <button
            onClick={() => window.open("/?client=" + clientSlug, "_blank")}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", borderRadius: "8px", background: "transparent", cursor: "pointer" }}
          >
            <span>🌐</span>
            <span>View Site</span>
          </button>
        )}

        {/* User dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer" }}
          >
            {/* Avatar */}
            <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "0.875rem" }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--color-text-primary)", lineHeight: 1 }}>
                {user?.name}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px", textTransform: "capitalize" }}>
                {user?.role}
              </p>
            </div>

            <span style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>▾</span>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              {/* Overlay */}
              <div
                onClick={() => setDropdownOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 10 }}
              />

              {/* Menu */}
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "12rem", background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 20, overflow: "hidden" }}>

                {/* User info */}
                <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-border)" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <div style={{ padding: "0.25rem 0" }}>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    style={{ width: "100%", textAlign: "left", padding: "0.5rem 1rem", fontSize: "0.875rem", color: "var(--color-text-secondary)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span>👤</span> Profile
                  </button>

                  <button
                    onClick={() => setDropdownOpen(false)}
                    style={{ width: "100%", textAlign: "left", padding: "0.5rem 1rem", fontSize: "0.875rem", color: "var(--color-text-secondary)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span>⚙️</span> Settings
                  </button>

                  {/* Divider */}
                  <div style={{ borderTop: "1px solid var(--color-border)", margin: "0.25rem 0" }} />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    style={{ width: "100%", textAlign: "left", padding: "0.5rem 1rem", fontSize: "0.875rem", color: "var(--color-error)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
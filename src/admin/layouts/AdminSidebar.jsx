 import { NavLink }   from "react-router-dom";
import { useAuth }   from "@context/AuthContext.jsx";
import { useClient } from "@context/ClientContext.jsx";
import { cn }        from "@utils/helpers.js";
import { ROUTES }    from "@constants/api.js";

// ─────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────

const getNavItems = (role) => {
  const items = [
    {
      label: "Dashboard",
      to:    ROUTES.ADMIN_DASHBOARD,
      icon:  "📊",
      roles: ["superadmin", "admin", "clientadmin"],
    },
    {
      label: "Clients",
      to:    ROUTES.ADMIN_CLIENTS,
      icon:  "🏢",
      roles: ["superadmin", "admin"],
    },
    {
      label: "Products",
      to:    ROUTES.ADMIN_PRODUCTS,
      icon:  "📦",
      roles: ["superadmin", "admin", "clientadmin"],
    },
    {
      label: "Themes",
      to:    ROUTES.ADMIN_THEMES,
      icon:  "🎨",
      roles: ["superadmin", "admin", "clientadmin"],
    },
    {
      label: "Sections",
      to:    ROUTES.ADMIN_SECTIONS,
      icon:  "🧩",
      roles: ["superadmin", "admin", "clientadmin"],
    },
    {
      label: "Users",
      to:    ROUTES.ADMIN_USERS,
      icon:  "👥",
      roles: ["superadmin"],
    },
    {
      label: "Settings",
      to:    ROUTES.ADMIN_SETTINGS,
      icon:  "⚙️",
      roles: ["superadmin", "admin", "clientadmin"],
    },
  ];

  return items.filter((item) => item.roles.includes(role));
};

// ─────────────────────────────────────────
// GET VIEW SITE URL
// ─────────────────────────────────────────

const getViewSiteUrl = (client, clientSlug, user) => {
  const slug =
    clientSlug           ||
    client?.slug         ||
    (typeof user?.client === "object" ? user?.client?.slug : null) ||
    null;

  if (!slug) return null;

  const baseUrl =
    import.meta.env.VITE_SITE_URL ||
    window.location.origin;

  return `${baseUrl}/?client=${slug}`;
};

// ─────────────────────────────────────────
// ADMIN SIDEBAR
// ─────────────────────────────────────────

const AdminSidebar = ({ isOpen, mobileOpen, onMobileClose }) => {
  const { user }               = useAuth();
  const { client, logo, clientSlug } = useClient();
  const navItems               = getNavItems(user?.role);

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-background border-r border-border",
          "flex-col transition-all duration-300 z-30",
          "hidden lg:flex",
          isOpen ? "w-64" : "w-20"
        )}
      >
        <SidebarContent
          isOpen={isOpen}
          navItems={navItems}
          user={user}
          client={client}
          clientSlug={clientSlug}
          logo={logo}
        />
      </aside>

      {/* Mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-background border-r border-border",
          "flex flex-col z-50 lg:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          isOpen={true}
          navItems={navItems}
          user={user}
          client={client}
          clientSlug={clientSlug}
          logo={logo}
          onClose={onMobileClose}
        />
      </aside>
    </>
  );
};

// ─────────────────────────────────────────
// SIDEBAR CONTENT
// ─────────────────────────────────────────

const SidebarContent = ({
  isOpen,
  navItems,
  user,
  client,
  clientSlug,
  logo,
  onClose,
}) => {
  const viewSiteUrl = getViewSiteUrl(client, clientSlug, user);

  return (
    <>
      {/* Logo / Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderBottom: "1px solid var(--color-border)", height: "4rem", flexShrink: 0, justifyContent: !isOpen ? "center" : "flex-start" }}>

        {logo?.url ? (
          <img
            src={logo.url}
            alt={logo.altText || "Logo"}
            style={{ width: "2rem", height: "2rem", objectFit: "contain", borderRadius: "4px" }}
          />
        ) : (
          <div style={{ width: "2rem", height: "2rem", background: "var(--color-primary)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "0.875rem", flexShrink: 0 }}>
            {client?.name?.[0] || "S"}
          </div>
        )}

        {isOpen && (
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontWeight: "bold", color: "var(--color-text-primary)", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {client?.name || "SaaS Platform"}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "0.75rem 0.5rem" }}>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                title={!isOpen ? item.label : ""}
                style={({ isActive }) => ({
                  display:        "flex",
                  alignItems:     "center",
                  gap:            "0.75rem",
                  padding:        "0.625rem 0.75rem",
                  borderRadius:   "8px",
                  textDecoration: "none",
                  transition:     "all 0.15s",
                  justifyContent: !isOpen ? "center" : "flex-start",
                  background:     isActive
                    ? "var(--color-primary)"
                    : "transparent",
                  color: isActive
                    ? "#ffffff"
                    : "var(--color-text-secondary)",
                })}
              >
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
                  {item.icon}
                </span>
                {isOpen && (
                  <span style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* View Site in sidebar */}
        {isOpen && viewSiteUrl && (
          <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--color-border)" }}>
            <button
              onClick={() => window.open(viewSiteUrl, "_blank")}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "transparent", cursor: "pointer", width: "100%", color: "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: "500" }}
            >
              <span>🌐</span>
              <span>View Website</span>
            </button>
          </div>
        )}
      </nav>

      {/* User info */}
      <div style={{ padding: "0.75rem", borderTop: "1px solid var(--color-border)", flexShrink: 0, display: "flex", justifyContent: !isOpen ? "center" : "flex-start" }}>
        {isOpen ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "0.75rem", flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ fontSize: "0.8rem", fontWeight: "500", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name}
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", textTransform: "capitalize" }}>
                {user?.role}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "0.75rem" }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;
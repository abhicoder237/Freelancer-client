import { NavLink }   from "react-router-dom";
import { useAuth }   from "@context/AuthContext.jsx";
import { useClient } from "@context/ClientContext.jsx";
import { cn }        from "@utils/helpers.js";
import { ROUTES }    from "@constants/api.js";

// ─────────────────────────────────────────
// NAV ITEMS CONFIG
// ─────────────────────────────────────────

const getNavItems = (role) => {
  const items = [
    {
      label:  "Dashboard",
      to:     ROUTES.ADMIN_DASHBOARD,
      icon:   "📊",
      roles:  ["superadmin", "admin", "clientadmin"],
    },
    {
      label:  "Clients",
      to:     ROUTES.ADMIN_CLIENTS,
      icon:   "🏢",
      roles:  ["superadmin", "admin"],
    },
    {
      label:  "Products",
      to:     ROUTES.ADMIN_PRODUCTS,
      icon:   "📦",
      roles:  ["superadmin", "admin", "clientadmin"],
    },
    {
      label:  "Themes",
      to:     ROUTES.ADMIN_THEMES,
      icon:   "🎨",
      roles:  ["superadmin", "admin", "clientadmin"],
    },
    {
      label:  "Sections",
      to:     ROUTES.ADMIN_SECTIONS,
      icon:   "🧩",
      roles:  ["superadmin", "admin", "clientadmin"],
    },
    {
      label:  "Users",
      to:     ROUTES.ADMIN_USERS,
      icon:   "👥",
      roles:  ["superadmin"],
    },
    {
      label:  "Settings",
      to:     ROUTES.ADMIN_SETTINGS,
      icon:   "⚙️",
      roles:  ["superadmin", "admin", "clientadmin"],
    },
  ];

  return items.filter((item) => item.roles.includes(role));
};

// ─────────────────────────────────────────
// ADMIN SIDEBAR
// ─────────────────────────────────────────

const AdminSidebar = ({ isOpen, mobileOpen, onMobileClose }) => {
  const { user, isSuperAdmin } = useAuth();
  const { client, logo }       = useClient();

  const navItems = getNavItems(user?.role);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-background border-r border-border",
          "flex flex-col transition-all duration-300 z-30",
          "hidden lg:flex",
          isOpen ? "w-64" : "w-20"
        )}
      >
        <SidebarContent
          isOpen={isOpen}
          navItems={navItems}
          user={user}
          client={client}
          logo={logo}
        />
      </aside>

      {/* Mobile Sidebar */}
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
  logo,
  onClose,
}) => {
  return (
    <>
      {/* Logo / Brand */}
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-border",
        "h-16 shrink-0",
        !isOpen && "justify-center"
      )}>

        {/* Logo */}
        {logo?.url ? (
          <img
            src={logo.url}
            alt={logo.altText || "Logo"}
            className="w-8 h-8 object-contain rounded"
          />
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex
                          items-center justify-center text-white
                          font-bold text-sm shrink-0">
            {client?.name?.[0] || "S"}
          </div>
        )}

        {isOpen && (
          <div className="overflow-hidden">
            <p className="font-bold text-text-primary text-sm truncate">
              {client?.name || "SaaS Platform"}
            </p>
            <p className="text-xs text-text-secondary truncate">
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "transition-colors duration-150 group",
                    !isOpen && "justify-center",
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-surface hover:text-text-primary"
                  )
                }
                title={!isOpen ? item.label : ""}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {isOpen && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info at bottom */}
      <div className={cn(
        "p-4 border-t border-border shrink-0",
        !isOpen && "flex justify-center"
      )}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary flex
                            items-center justify-center text-white
                            text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.name}
              </p>
              <p className="text-xs text-text-secondary capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex
                          items-center justify-center text-white
                          text-xs font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;
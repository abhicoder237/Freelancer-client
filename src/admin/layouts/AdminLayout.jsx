import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar             from "./AdminSidebar.jsx";
import AdminTopbar              from "./AdminTopbar.jsx";

// ─────────────────────────────────────────
// ADMIN LAYOUT
// Sidebar + Topbar + Content area
// ─────────────────────────────────────────

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface flex">

      {/* ── Sidebar ─────────────────────── */}
      <AdminSidebar
        isOpen={sidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* ── Mobile overlay ──────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Main content ────────────────── */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen transition-all duration-300
          ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}
        `}
      >
        {/* Topbar */}
        <AdminTopbar
          onMenuClick={() => {
            if (window.innerWidth < 1024) {
              setMobileSidebarOpen(true);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
          sidebarOpen={sidebarOpen}
        />

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
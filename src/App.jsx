import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth }        from "@context/AuthContext.jsx";
import { ROUTES }         from "@constants/api.js";

// ── Admin imports ─────────────────────────
import AdminLogin         from "@admin/pages/AdminLogin.jsx";
import AdminLayout        from "@admin/layouts/AdminLayout.jsx";
import Dashboard          from "@admin/pages/Dashboard.jsx";
import ProductsList       from "@admin/pages/products/ProductsList.jsx";
import ProductForm        from "@admin/pages/products/ProductForm.jsx";
import ClientsList        from "@admin/pages/clients/ClientsList.jsx";
import ClientForm         from "@admin/pages/clients/ClientForm.jsx";
import ThemeManager       from "@admin/pages/themes/ThemeManager.jsx";
import SectionManager     from "@admin/pages/sections/SectionManager.jsx";
import UsersList          from "@admin/pages/users/UsersList.jsx";
import AdminSettings      from "@admin/pages/AdminSettings.jsx";

// ── Website imports ───────────────────────
import WebsiteLayout      from "@website/layouts/WebsiteLayout.jsx";
import HomePage           from "@website/pages/HomePage.jsx";
import ProductsPage       from "@website/pages/ProductsPage.jsx";
import ProductDetail      from "@website/pages/ProductDetail.jsx";
import AboutPage          from "@website/pages/AboutPage.jsx";
import ContactPage        from "@website/pages/ContactPage.jsx";

// ─────────────────────────────────────────
// 404 PAGE
// ─────────────────────────────────────────

const NotFoundPage = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background)" }}>
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: "6rem", fontWeight: "bold", color: "var(--color-primary)" }}>
        404
      </p>
      <p style={{ color: "var(--color-text-secondary)", marginTop: "1rem", fontSize: "1.1rem" }}>
        Page not found
      </p>
      <button
        onClick={() => window.location.href = "/"}
        style={{ marginTop: "1.5rem", padding: "0.625rem 1.5rem", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.95rem" }}
      >
        Go Home
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────
// PAGE LOADER
// ─────────────────────────────────────────

const PageLoader = () => (
  <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background, #fff)" }}>
    <div style={{ width: "2.5rem", height: "2.5rem", border: "4px solid var(--color-primary, #3B82F6)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
  </div>
);

// ─────────────────────────────────────────
// PROTECTED ROUTE
// ─────────────────────────────────────────

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  return children;
};

// ─────────────────────────────────────────
// PUBLIC ROUTE
// ─────────────────────────────────────────

const PublicRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  if (isLoggedIn) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  return children;
};

// ─────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────

const App = () => {
  return (
    <Routes>

      {/* ── Admin Login ───────────────────── */}
      <Route
        path={ROUTES.ADMIN_LOGIN}
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />

      {/* ── Admin Panel ───────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />}
        />

        <Route path="dashboard" element={<Dashboard />} />

        <Route
          path="clients"
          element={
            <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
              <ClientsList />
            </ProtectedRoute>
          }
        />
        <Route path="clients/new"       element={<ClientForm />} />
        <Route path="clients/:id/edit"  element={<ClientForm />} />

        <Route path="products"          element={<ProductsList />} />
        <Route path="products/new"      element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />

        <Route path="themes"   element={<ThemeManager />} />
        <Route path="sections" element={<SectionManager />} />

        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <UsersList />
            </ProtectedRoute>
          }
        />

        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ── Website ───────────────────────── */}
      <Route path="/" element={<WebsiteLayout />}>
        <Route index                 element={<HomePage />} />
        <Route path="products"       element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="about"          element={<AboutPage />} />
        <Route path="contact"        element={<ContactPage />} />
        <Route path="*"              element={<NotFoundPage />} />
      </Route>

    </Routes>
  );
};

export default App;
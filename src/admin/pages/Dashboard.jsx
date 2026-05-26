import { useQuery }          from "@tanstack/react-query";
import { useAuth }           from "@context/AuthContext.jsx";
import { useClient }         from "@context/ClientContext.jsx";
import { SkeletonBox }       from "@components/Loader.jsx";
import { Badge }             from "@components/index.js";
import clientService         from "@services/clientService.js";
import { QUERY_KEYS }        from "@constants/api.js";
import {
  formatCurrency,
  formatDate,
  getPlanLabel,
}                            from "@utils/helpers.js";

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const getViewSiteUrl = (client, clientSlug, user) => {
  const slug =
    clientSlug          ||
    client?.slug        ||
    (typeof user?.client === "object" ? user?.client?.slug : null) ||
    null;

  if (!slug) return null;

  const baseUrl =
    import.meta.env.VITE_SITE_URL ||
    window.location.origin;

  return `${baseUrl}/?client=${slug}`;
};

// ─────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "primary",
}) => {
  const colors = {
    primary: "background: #EFF6FF; color: #2563EB;",
    success: "background: #F0FDF4; color: #16A34A;",
    warning: "background: #FFFBEB; color: #D97706;",
    error:   "background: #FEF2F2; color: #DC2626;",
    purple:  "background: #F5F3FF; color: #7C3AED;",
  };

  const colorStyle = colors[color] || colors.primary;

  return (
    <div
      style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.25rem", transition: "box-shadow 0.2s" }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ width: "3rem", height: "3rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", cssText: colorStyle }}>
          <div style={{ width: "3rem", height: "3rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", ...(color === "primary" ? { background: "#EFF6FF" } : color === "success" ? { background: "#F0FDF4" } : color === "warning" ? { background: "#FFFBEB" } : color === "error" ? { background: "#FEF2F2" } : { background: "#F5F3FF" }) }}>
            {icon}
          </div>
        </div>

        {trend !== undefined && (
          <Badge variant={trend >= 0 ? "success" : "error"}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </Badge>
        )}
      </div>

      <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
        {value}
      </p>
      <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// STAT CARD SKELETON
// ─────────────────────────────────────────

const StatCardSkeleton = () => (
  <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.25rem" }}>
    <SkeletonBox style={{ width: "3rem", height: "3rem", borderRadius: "10px", marginBottom: "1rem" }} />
    <SkeletonBox style={{ height: "2rem", width: "6rem", marginBottom: "0.5rem", borderRadius: "4px" }} />
    <SkeletonBox style={{ height: "1rem", width: "8rem", marginBottom: "0.25rem", borderRadius: "4px" }} />
    <SkeletonBox style={{ height: "0.75rem", width: "5rem", borderRadius: "4px" }} />
  </div>
);

// ─────────────────────────────────────────
// QUICK ACTION CARD
// ─────────────────────────────────────────

const QuickAction = ({ icon, label, description, onClick, color }) => {
  const hoverColors = {
    blue:   { borderColor: "#93C5FD", background: "#EFF6FF" },
    green:  { borderColor: "#86EFAC", background: "#F0FDF4" },
    purple: { borderColor: "#C4B5FD", background: "#F5F3FF" },
    orange: { borderColor: "#FCA5A5", background: "#FFF1F2" },
  };

  const hoverStyle = hoverColors[color] || hoverColors.blue;

  return (
    <button
      onClick={onClick}
      style={{ width: "100%", textAlign: "left", padding: "1rem", borderRadius: "10px", border: "1px solid var(--color-border)", background: "transparent", cursor: "pointer", transition: "all 0.2s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor  = hoverStyle.borderColor;
        e.currentTarget.style.background   = hoverStyle.background;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor  = "var(--color-border)";
        e.currentTarget.style.background   = "transparent";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.125rem" }}>
            {label}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            {description}
          </p>
        </div>
        <span style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>→</span>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────
// CATEGORY BAR
// ─────────────────────────────────────────

const CategoryBar = ({ category, count, total }) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div style={{ marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)", textTransform: "capitalize" }}>
          {category}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
          {count} ({percent}%)
        </span>
      </div>
      <div style={{ height: "0.5rem", background: "var(--color-surface)", borderRadius: "999px", overflow: "hidden" }}>
        <div
          style={{ height: "100%", background: "var(--color-primary)", borderRadius: "999px", width: percent + "%", transition: "width 0.5s ease" }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────

const Dashboard = () => {
  const { user, isAdminOrAbove }               = useAuth();
  const { client, clientId, clientSlug }       = useClient();

  // ── View site URL ─────────────────────────
  const viewSiteUrl = getViewSiteUrl(client, clientSlug, user);

  // ── Fetch stats ──────────────────────────
  const {
    data:      statsResponse,
    isLoading: isStatsLoading,
    error:     statsError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.CLIENT_STATS(clientId),
    queryFn:  () => clientService.getStats(clientId),
    enabled:  !!clientId,
    refetchInterval: 5 * 60 * 1000,
  });

  const stats = statsResponse?.data || null;

  // ── Greeting ─────────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* ── Header ──────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
            {client ? `Managing ${client.name}` : "Welcome to your dashboard"}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          style={{ padding: "0.5rem", color: "var(--color-text-secondary)", background: "transparent", border: "none", cursor: "pointer", borderRadius: "8px", fontSize: "1.1rem" }}
          title="Refresh stats"
        >
          🔄
        </button>
      </div>

      {/* ── Client Info Banner ───────────── */}
      {client && (
        <div style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 10%, transparent), color-mix(in srgb, var(--color-secondary) 10%, transparent))", border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)", borderRadius: "16px", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Logo */}
              {client.logo?.url ? (
                <img
                  src={client.logo.url}
                  alt={client.name}
                  style={{ width: "3rem", height: "3rem", borderRadius: "10px", objectFit: "contain", background: "#fff", padding: "4px", border: "1px solid var(--color-border)" }}
                />
              ) : (
                <div style={{ width: "3rem", height: "3rem", borderRadius: "10px", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "1.25rem" }}>
                  {client.name?.[0]}
                </div>
              )}

              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--color-text-primary)", marginBottom: "0.375rem" }}>
                  {client.name}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Badge variant="primary">{getPlanLabel(client.plan)}</Badge>
                  <Badge variant={client.isActive ? "success" : "error"}>
                    {client.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {client.isUnderMaintenance && (
                    <Badge variant="warning">Maintenance</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* View Website button */}
            {viewSiteUrl && (
              <button
                onClick={() => window.open(viewSiteUrl, "_blank")}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", transition: "filter 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(0.9)"}
                onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
              >
                <span>🌐</span>
                <span>View Website</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Stats Grid ──────────────────── */}
      <div>
        <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1rem" }}>
          Overview
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {isStatsLoading ? (
            [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          ) : statsError ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
              <p style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>😕</p>
              <p>Failed to load stats.</p>
              <button
                onClick={() => refetch()}
                style={{ marginTop: "0.75rem", padding: "0.4rem 1rem", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <StatCard
                icon="📦"
                title="Total Products"
                value={stats?.products?.total ?? 0}
                subtitle={(stats?.products?.active ?? 0) + " active"}
                color="primary"
              />
              <StatCard
                icon="✅"
                title="Active Products"
                value={stats?.products?.active ?? 0}
                subtitle={(stats?.products?.draft ?? 0) + " drafts"}
                color="success"
              />
              <StatCard
                icon="🧩"
                title="Page Sections"
                value={stats?.sections?.total ?? 0}
                subtitle={(stats?.sections?.visible ?? 0) + " visible"}
                color="purple"
              />
              <StatCard
                icon="👁️"
                title="Page Views"
                value={stats?.pageViews ? stats.pageViews.toLocaleString() : "0"}
                subtitle="Total all time"
                color="warning"
              />
            </>
          )}
        </div>
      </div>

      {/* ── Secondary Stats ──────────────── */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <StatCard
            icon="⭐"
            title="Featured Products"
            value={stats.products?.featured ?? 0}
            color="warning"
          />
          <StatCard
            icon="⚠️"
            title="Out of Stock"
            value={stats.products?.outOfStock ?? 0}
            subtitle="Needs attention"
            color="error"
          />
          <StatCard
            icon="🙈"
            title="Hidden Sections"
            value={stats.sections?.hidden ?? 0}
            subtitle="Not visible on site"
            color="purple"
          />
        </div>
      )}

      {/* ── Bottom Grid ─────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* Quick Actions */}
        <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1rem" }}>
            Quick Actions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <QuickAction
              icon="📦"
              label="Add New Product"
              description="Create and publish a product"
              color="blue"
              onClick={() => window.location.href = "/admin/products/new"}
            />
            <QuickAction
              icon="🧩"
              label="Manage Sections"
              description="Edit homepage sections"
              color="purple"
              onClick={() => window.location.href = "/admin/sections"}
            />
            <QuickAction
              icon="🎨"
              label="Change Theme"
              description="Switch or customize theme"
              color="green"
              onClick={() => window.location.href = "/admin/themes"}
            />
            {isAdminOrAbove && (
              <QuickAction
                icon="🏢"
                label="Add New Client"
                description="Onboard a new client"
                color="orange"
                onClick={() => window.location.href = "/admin/clients/new"}
              />
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1rem" }}>
            Products by Category
          </h3>

          {isStatsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <SkeletonBox style={{ height: "0.875rem", width: "100%", marginBottom: "0.375rem", borderRadius: "4px" }} />
                  <SkeletonBox style={{ height: "0.5rem", width: "100%", borderRadius: "999px" }} />
                </div>
              ))}
            </div>
          ) : stats?.topCategories?.length > 0 ? (
            <div>
              {stats.topCategories.map((cat) => (
                <CategoryBar
                  key={cat.category}
                  category={cat.category}
                  count={cat.count}
                  total={stats.products?.total || 1}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)" }}>
              <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</p>
              <p style={{ fontSize: "0.875rem" }}>
                No products yet. Add products to see breakdown.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Client Details — admin+ ──────── */}
      {isAdminOrAbove && client && (
        <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "1rem" }}>
            Client Details
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>

            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                Business Type
              </p>
              <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)", textTransform: "capitalize" }}>
                {client.businessType || "—"}
              </p>
            </div>

            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                Slug
              </p>
              <p style={{ fontSize: "0.8rem", fontWeight: "500", color: "var(--color-text-primary)", fontFamily: "monospace", background: "var(--color-surface)", padding: "2px 8px", borderRadius: "4px", display: "inline-block" }}>
                {client.slug}
              </p>
            </div>

            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                Custom Domain
              </p>
              <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
                {client.customDomain || "Not set"}
              </p>
            </div>

            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                Created
              </p>
              <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
                {client.createdAt ? formatDate(client.createdAt) : "—"}
              </p>
            </div>

            {client.contact?.email && (
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                  Contact Email
                </p>
                <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
                  {client.contact.email}
                </p>
              </div>
            )}

            {client.contact?.phone && (
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                  Phone
                </p>
                <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
                  {client.contact.phone}
                </p>
              </div>
            )}

            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                Plan Expiry
              </p>
              <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
                {client.planExpiry ? formatDate(client.planExpiry) : "No expiry"}
              </p>
            </div>

            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                Maintenance
              </p>
              <Badge variant={client.isUnderMaintenance ? "warning" : "success"}>
                {client.isUnderMaintenance ? "ON" : "OFF"}
              </Badge>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
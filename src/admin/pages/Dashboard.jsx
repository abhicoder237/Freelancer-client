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
    primary: "bg-blue-50   text-blue-600",
    success: "bg-green-50  text-green-600",
    warning: "bg-yellow-50 text-yellow-600",
    error:   "bg-red-50    text-red-600",
    purple:  "bg-purple-50 text-purple-600",
  };

  return (
    <div className="card hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-xl flex items-center
          justify-center text-2xl ${colors[color]}
        `}>
          {icon}
        </div>

        {/* Trend badge */}
        {trend !== undefined && (
          <Badge variant={trend >= 0 ? "success" : "error"}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </Badge>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-text-primary mb-1">
        {value}
      </p>

      {/* Title */}
      <p className="text-sm font-medium text-text-primary">
        {title}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-text-secondary mt-1">
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
  <div className="card space-y-3">
    <SkeletonBox className="w-12 h-12 rounded-xl" />
    <SkeletonBox className="h-8 w-24" />
    <SkeletonBox className="h-4 w-32" />
    <SkeletonBox className="h-3 w-24" />
  </div>
);

// ─────────────────────────────────────────
// QUICK ACTION CARD
// ─────────────────────────────────────────

const QuickAction = ({ icon, label, description, onClick, color }) => {
  const colors = {
    blue:   "hover:border-blue-300   hover:bg-blue-50",
    green:  "hover:border-green-300  hover:bg-green-50",
    purple: "hover:border-purple-300 hover:bg-purple-50",
    orange: "hover:border-orange-300 hover:bg-orange-50",
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-xl border border-border
        transition-all duration-200 group
        ${colors[color] || colors.blue}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-text-primary
                        group-hover:text-primary transition-colors">
            {label}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {description}
          </p>
        </div>
        <span className="ml-auto text-text-secondary
                         group-hover:text-primary transition-colors">
          →
        </span>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────
// CATEGORY BREAKDOWN
// ─────────────────────────────────────────

const CategoryBar = ({ category, count, total }) => {
  const percent = total > 0
    ? Math.round((count / total) * 100)
    : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-text-primary font-medium capitalize">
          {category}
        </span>
        <span className="text-text-secondary">
          {count} ({percent}%)
        </span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full
                     transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────

const Dashboard = () => {
  const { user, isSuperAdmin, isAdminOrAbove } = useAuth();
  const { client, clientId, clientSlug }       = useClient();

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
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const stats = statsResponse?.data || null;

  // ── Current time greeting ────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 animate-fade-up">

      {/* ── Header ──────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-text-secondary mt-1">
            {client
              ? `Managing ${client.name}`
              : "Welcome to your dashboard"
            }
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refetch()}
          className="p-2 text-text-secondary hover:text-primary
                     hover:bg-surface rounded-lg transition-colors"
          title="Refresh stats"
        >
          🔄
        </button>
      </div>

      {/* ── Client Info Banner ───────────── */}
      {client && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10
                        border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              {client.logo?.url ? (
                <img
                  src={client.logo.url}
                  alt={client.name}
                  className="w-12 h-12 rounded-xl object-contain
                             bg-white p-1 border border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary
                                flex items-center justify-center
                                text-white text-xl font-bold">
                  {client.name?.[0]}
                </div>
              )}

              <div>
                <h2 className="font-bold text-text-primary text-lg">
                  {client.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary">
                    {getPlanLabel(client.plan)}
                  </Badge>
                  <Badge variant={client.isActive ? "success" : "error"}>
                    {client.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {client.isUnderMaintenance && (
                    <Badge variant="warning">Maintenance</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* View site link */}
            
              
          </div>
        </div>
      )}

      {/* ── Stats Grid ──────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2
                        lg:grid-cols-4 gap-4">
          {isStatsLoading ? (
            // Skeleton loading
            [...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          ) : statsError ? (
            // Error state
            <div className="col-span-4 text-center py-8
                            text-text-secondary">
              <p className="text-4xl mb-2">😕</p>
              <p>Failed to load stats. Please refresh.</p>
            </div>
          ) : (
            <>
              <StatCard
                icon="📦"
                title="Total Products"
                value={stats?.products?.total ?? 0}
                subtitle={`${stats?.products?.active ?? 0} active`}
                color="primary"
              />

              <StatCard
                icon="✅"
                title="Active Products"
                value={stats?.products?.active ?? 0}
                subtitle={`${stats?.products?.draft ?? 0} drafts`}
                color="success"
              />

              <StatCard
                icon="🧩"
                title="Page Sections"
                value={stats?.sections?.total ?? 0}
                subtitle={`${stats?.sections?.visible ?? 0} visible`}
                color="purple"
              />

              <StatCard
                icon="👁️"
                title="Page Views"
                value={
                  stats?.pageViews
                    ? stats.pageViews.toLocaleString()
                    : "0"
                }
                subtitle="Total all time"
                color="warning"
              />
            </>
          )}
        </div>
      </div>

      {/* ── Secondary Stats ──────────────── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <QuickAction
              icon="📦"
              label="Add New Product"
              description="Create and publish a product"
              color="blue"
              onClick={() =>
                window.location.href = "/admin/products/new"
              }
            />

            <QuickAction
              icon="🧩"
              label="Manage Sections"
              description="Edit homepage sections"
              color="purple"
              onClick={() =>
                window.location.href = "/admin/sections"
              }
            />

            <QuickAction
              icon="🎨"
              label="Change Theme"
              description="Switch or customize theme"
              color="green"
              onClick={() =>
                window.location.href = "/admin/themes"
              }
            />

            {isAdminOrAbove && (
              <QuickAction
                icon="🏢"
                label="Add New Client"
                description="Onboard a new client"
                color="orange"
                onClick={() =>
                  window.location.href = "/admin/clients/new"
                }
              />
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">
            Products by Category
          </h3>

          {isStatsLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonBox className="h-4 w-full" />
                  <SkeletonBox className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : stats?.topCategories?.length > 0 ? (
            <div className="space-y-4">
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
            <div className="text-center py-8 text-text-secondary">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">
                No products yet. Add products to see breakdown.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Client Details (admin+) ──────── */}
      {isAdminOrAbove && client && (
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">
            Client Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-4 gap-4 text-sm">

            <div>
              <p className="text-text-secondary mb-1">Business Type</p>
              <p className="font-medium text-text-primary capitalize">
                {client.businessType || "—"}
              </p>
            </div>

            <div>
              <p className="text-text-secondary mb-1">Slug</p>
              <p className="font-medium text-text-primary font-mono
                            text-xs bg-surface px-2 py-1 rounded">
                {client.slug}
              </p>
            </div>

            <div>
              <p className="text-text-secondary mb-1">Custom Domain</p>
              <p className="font-medium text-text-primary">
                {client.customDomain || "Not set"}
              </p>
            </div>

            <div>
              <p className="text-text-secondary mb-1">Created</p>
              <p className="font-medium text-text-primary">
                {client.createdAt
                  ? formatDate(client.createdAt)
                  : "—"
                }
              </p>
            </div>

            {client.contact?.email && (
              <div>
                <p className="text-text-secondary mb-1">Contact Email</p>
                <p className="font-medium text-text-primary">
                  {client.contact.email}
                </p>
              </div>
            )}

            {client.contact?.phone && (
              <div>
                <p className="text-text-secondary mb-1">Phone</p>
                <p className="font-medium text-text-primary">
                  {client.contact.phone}
                </p>
              </div>
            )}

            <div>
              <p className="text-text-secondary mb-1">Plan Expiry</p>
              <p className="font-medium text-text-primary">
                {client.planExpiry
                  ? formatDate(client.planExpiry)
                  : "No expiry"
                }
              </p>
            </div>

            <div>
              <p className="text-text-secondary mb-1">Maintenance</p>
              <Badge variant={
                client.isUnderMaintenance ? "warning" : "success"
              }>
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

// test update

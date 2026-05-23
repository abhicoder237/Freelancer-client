import { useState }              from "react";
import { useNavigate }           from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast                     from "react-hot-toast";
import clientService             from "@services/clientService.js";
import { QUERY_KEYS, ROUTES }    from "@constants/api.js";
import { formatDate, getPlanLabel } from "@utils/helpers.js";
import { Badge, Button, ConfirmDialog, EmptyState } from "@components/index.js";
import { SkeletonTable }         from "@components/Loader.jsx";

// ─────────────────────────────────────────
// CLIENTS LIST PAGE
// ─────────────────────────────────────────

const ClientsList = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [search,   setSearch]   = useState("");
  const [plan,     setPlan]     = useState("");
  const [page,     setPage]     = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [maintenanceId, setMaintenanceId] = useState(null);
  const limit = 10;

  // ── Fetch clients ────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CLIENTS,
    queryFn:  () => clientService.getAllClients({ search, plan, page, limit }),
    keepPreviousData: true,
  });

  const clients = data?.data || [];
  const meta    = data?.meta || {};

  // ── Delete mutation ──────────────────────
  const deleteMutation = useMutation({
    mutationFn: clientService.deleteClient,
    onSuccess: () => {
      toast.success("Client deleted successfully!");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLIENTS });
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete client.");
    },
  });

  // ── Maintenance toggle ───────────────────
  const maintenanceMutation = useMutation({
    mutationFn: (id) => clientService.toggleMaintenance(id, {}),
    onSuccess: () => {
      toast.success("Maintenance mode toggled!");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLIENTS });
      setMaintenanceId(null);
    },
  });

  // ── Plan badge color ─────────────────────
  const getPlanVariant = (plan) => {
    const map = {
      free:         "default",
      basic:        "info",
      professional: "primary",
      enterprise:   "purple",
    };
    return map[plan] || "default";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)" }}>
            Clients
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {meta.total || 0} total clients
          </p>
        </div>

        <Button
          onClick={() => navigate(ROUTES.ADMIN_CLIENT_NEW)}
          leftIcon="+"
        >
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", padding: "1rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>

        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: "200px", padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
        />

        <select
          value={plan}
          onChange={(e) => { setPlan(e.target.value); setPage(1); }}
          style={{ padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>

        {(search || plan) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setPlan(""); setPage(1); }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "var(--color-background)", borderRadius: "12px", border: "1px solid var(--color-border)", overflow: "hidden" }}>

        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : clients.length === 0 ? (
          <EmptyState
            icon="🏢"
            title="No clients found"
            message={search ? "Try a different search term." : "Start by adding your first client."}
            action={() => navigate(ROUTES.ADMIN_CLIENT_NEW)}
            actionLabel="Add Client"
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
                  {["Client", "Slug", "Plan", "Status", "Products", "Created", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{ padding: "0.75rem 1rem", textAlign: h === "Actions" ? "right" : "left", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {clients.map((client, index) => (
                  <tr
                    key={client._id}
                    style={{ borderBottom: index < clients.length - 1 ? "1px solid var(--color-border)" : "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Client info */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {/* Logo */}
                        <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {client.logo?.url ? (
                            <img
                              src={client.logo.url}
                              alt={client.name}
                              style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                            />
                          ) : (
                            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--color-primary)" }}>
                              {client.name?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
                            {client.name}
                          </p>
                          {client.businessType && (
                            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", textTransform: "capitalize", marginTop: "2px" }}>
                              {client.businessType}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <code style={{ fontSize: "0.8rem", background: "var(--color-surface)", padding: "2px 8px", borderRadius: "4px", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                        {client.slug}
                      </code>
                    </td>

                    {/* Plan */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <Badge variant={getPlanVariant(client.plan)}>
                        {getPlanLabel(client.plan)}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <Badge variant={client.isActive ? "success" : "error"}>
                          {client.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {client.isUnderMaintenance && (
                          <Badge variant="warning">Maintenance</Badge>
                        )}
                      </div>
                    </td>

                    {/* Products */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ fontSize: "0.875rem", color: "var(--color-text-primary)", fontWeight: "500" }}>
                        {client.totalProducts || 0}
                      </span>
                    </td>

                    {/* Created */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                        {client.createdAt ? formatDate(client.createdAt) : "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>

                        {/* View site */}
                        <button
                          onClick={() => window.open("/?client=" + client.slug, "_blank")}
                          title="View website"
                          style={{ padding: "0.375rem", background: "none", border: "1px solid var(--color-border)", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}
                        >
                          🌐
                        </button>

                        {/* Maintenance toggle */}
                        <button
                          onClick={() => setMaintenanceId(client._id)}
                          title={client.isUnderMaintenance ? "Disable maintenance" : "Enable maintenance"}
                          style={{ padding: "0.375rem", background: "none", border: "1px solid var(--color-border)", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}
                        >
                          🔧
                        </button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(ROUTES.ADMIN_CLIENT_EDIT(client._id))}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteId(client._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            Page {page} of {meta.totalPages}
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </Button>
            <Button size="sm" variant="outline" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
        title="Delete Client"
        message="This will permanently delete the client and ALL associated data — products, themes, sections, and images. This cannot be undone."
        confirmText="Delete Client"
      />

      {/* Maintenance confirm */}
      <ConfirmDialog
        isOpen={!!maintenanceId}
        onClose={() => setMaintenanceId(null)}
        onConfirm={() => maintenanceMutation.mutate(maintenanceId)}
        isLoading={maintenanceMutation.isPending}
        title="Toggle Maintenance Mode"
        message="This will toggle the maintenance mode for this client's website. Visitors will see a maintenance message."
        confirmText="Toggle"
        variant="warning"
      />
    </div>
  );
};

export default ClientsList;
import { useState }              from "react";
import { useNavigate }           from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast                     from "react-hot-toast";
import productService            from "@services/productService.js";
import { useClient }             from "@context/ClientContext.jsx";
import { useAuth }               from "@context/AuthContext.jsx";
import { QUERY_KEYS, ROUTES }    from "@constants/api.js";
import { formatCurrency, getStockLabel, truncate } from "@utils/helpers.js";
import { Badge, Button, ConfirmDialog, EmptyState } from "@components/index.js";
import { SkeletonTable }         from "@components/Loader.jsx";

// ─────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const variants = {
    active:   "success",
    draft:    "default",
    archived: "error",
  };
  return (
    <Badge variant={variants[status] || "default"}>
      {status}
    </Badge>
  );
};

// ─────────────────────────────────────────
// PRODUCTS LIST PAGE
// ─────────────────────────────────────────

const ProductsList = () => {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const { clientId }  = useClient();
  const { isAdminOrAbove } = useAuth();

  // ── State ────────────────────────────────
  const [search,     setSearch]     = useState("");
  const [status,     setStatus]     = useState("");
  const [category,   setCategory]   = useState("");
  const [page,       setPage]       = useState(1);
  const [deleteId,   setDeleteId]   = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const limit = 10;

  // ── Fetch products ───────────────────────
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS({ search, status, category, page, limit }),
    queryFn:  () => productService.getAllProducts({
      search, status, category, page, limit,
    }),
    keepPreviousData: true,
  });

  const products = data?.data || [];
  const meta     = data?.meta || {};

  // ── Delete mutation ──────────────────────
  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete product.");
    },
  });

  // ── Toggle featured ──────────────────────
  const toggleFeaturedMutation = useMutation({
    mutationFn: productService.toggleFeatured,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // ── Bulk status ──────────────────────────
  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }) =>
      productService.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      toast.success("Products updated!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds([]);
    },
  });

  // ── Select all ───────────────────────────
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map((p) => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // ── Search debounce ──────────────────────
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)" }}>
            Products
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {meta.total || 0} total products
          </p>
        </div>

        <Button
          onClick={() => navigate(ROUTES.ADMIN_PRODUCT_NEW)}
          leftIcon="+"
        >
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", padding: "1rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>

        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearch}
          style={{ flex: 1, minWidth: "200px", padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
        />

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        {/* Clear filters */}
        {(search || status || category) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setStatus(""); setCategory(""); setPage(1); }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-primary)" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--color-text-primary)", fontWeight: "500" }}>
            {selectedIds.length} selected
          </span>

          <Button
            size="sm"
            variant="success"
            onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "active" })}
            isLoading={bulkStatusMutation.isPending}
          >
            Activate
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "draft" })}
          >
            Draft
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "archived" })}
          >
            Archive
          </Button>

          <button
            onClick={() => setSelectedIds([])}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "var(--color-background)", borderRadius: "12px", border: "1px solid var(--color-border)", overflow: "hidden" }}>

        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No products found"
            message={search ? "Try a different search term." : "Start by adding your first product."}
            action={() => navigate(ROUTES.ADMIN_PRODUCT_NEW)}
            actionLabel="Add Product"
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", width: "2.5rem" }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Product
                  </th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Category
                  </th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Price
                  </th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Stock
                  </th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Status
                  </th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Featured
                  </th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product, index) => {
                  const stockInfo    = getStockLabel(product);
                  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];

                  return (
                    <tr
                      key={product._id}
                      style={{ borderBottom: index < products.length - 1 ? "1px solid var(--color-border)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product._id)}
                          onChange={() => handleSelect(product._id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>

                      {/* Product info */}
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          {/* Image */}
                          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", overflow: "hidden", flexShrink: 0 }}>
                            {primaryImage ? (
                              <img
                                src={primaryImage.url}
                                alt={product.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                                📦
                              </div>
                            )}
                          </div>

                          {/* Name + SKU */}
                          <div>
                            <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {product.name}
                            </p>
                            {product.sku && (
                              <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", textTransform: "capitalize" }}>
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
                            {formatCurrency(product.price, product.currency)}
                          </p>
                          {product.compareAtPrice && (
                            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", textDecoration: "line-through" }}>
                              {formatCurrency(product.compareAtPrice, product.currency)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <Badge variant={
                          stockInfo.color === "success" ? "success" :
                          stockInfo.color === "error"   ? "error"   : "warning"
                        }>
                          {product.trackInventory ? product.stock : "∞"}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <StatusBadge status={product.status} />
                      </td>

                      {/* Featured */}
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <button
                          onClick={() => toggleFeaturedMutation.mutate(product._id)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}
                          title={product.isFeatured ? "Remove from featured" : "Add to featured"}
                        >
                          {product.isFeatured ? "⭐" : "☆"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(ROUTES.ADMIN_PRODUCT_EDIT(product._id))}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDeleteId(product._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, meta.total)} of {meta.total}
          </p>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </Button>

            {[...Array(meta.totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                size="sm"
                variant={page === i + 1 ? "primary" : "ghost"}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              size="sm"
              variant="outline"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
        title="Delete Product"
        message="Are you sure you want to delete this product? This will also remove all product images from Cloudinary. This action cannot be undone."
        confirmText="Delete Product"
      />
    </div>
  );
};

export default ProductsList;
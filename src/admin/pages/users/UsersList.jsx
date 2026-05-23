import { useState }              from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast                     from "react-hot-toast";
import authService               from "@services/authService.js";
import clientService             from "@services/clientService.js";
import { QUERY_KEYS }            from "@constants/api.js";
import { formatDate, getRoleLabel, getInitials } from "@utils/helpers.js";
import { Badge, Button, ConfirmDialog, Modal, ModalFooter } from "@components/index.js";
import { SkeletonTable }         from "@components/Loader.jsx";
import Input                     from "@components/Input.jsx";
import Select                    from "@components/Select.jsx";
import { useAuth }               from "@context/AuthContext.jsx";
import { useForm }               from "react-hook-form";

// ─────────────────────────────────────────
// ROLE BADGE
// ─────────────────────────────────────────

const RoleBadge = ({ role }) => {
  const variants = {
    superadmin:  "purple",
    admin:       "primary",
    clientadmin: "info",
  };
  return (
    <Badge variant={variants[role] || "default"}>
      {getRoleLabel(role)}
    </Badge>
  );
};

// ─────────────────────────────────────────
// CREATE USER MODAL
// ─────────────────────────────────────────

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name:     "",
      email:    "",
      password: "",
      role:     "clientadmin",
      client:   "",
    },
  });

  const role = watch("role");

  // Fetch clients for clientadmin assignment
  const { data: clientsRes } = useQuery({
    queryKey: QUERY_KEYS.CLIENTS,
    queryFn:  () => clientService.getAllClients({ limit: 100 }),
    enabled:  isOpen,
  });

  const clients = clientsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success("User created successfully!");
      reset();
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create user.");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      name:     data.name,
      email:    data.email,
      password: data.password,
      role:     data.role,
      ...(data.role === "clientadmin" && data.client && {
        client: data.client,
      }),
    };
    createMutation.mutate(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User" size="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <Input
            label="Full Name"
            placeholder="John Doe"
            required
            error={errors.name?.message}
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "Min 2 characters" },
            })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            required
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min 8 characters"
            required
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            }
            {...register("password", {
              required:  "Password is required",
              minLength: { value: 8, message: "Min 8 characters" },
              pattern: {
                value:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                message: "Must include uppercase, lowercase, number, and special character",
              },
            })}
          />

          <Select
            label="Role"
            required
            options={[
              { value: "admin",       label: "Admin" },
              { value: "clientadmin", label: "Client Admin" },
            ]}
            {...register("role", { required: "Role is required" })}
          />

          {role === "clientadmin" && (
            <Select
              label="Assign to Client"
              hint="Select client for this admin"
              placeholder="-- Select Client --"
              options={clients.map((c) => ({
                value: c._id,
                label: c.name + " (" + c.slug + ")",
              }))}
              {...register("client")}
            />
          )}

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create User
            </Button>
          </ModalFooter>
        </div>
      </form>
    </Modal>
  );
};

// ─────────────────────────────────────────
// USERS LIST PAGE
// ─────────────────────────────────────────

const UsersList = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [search,        setSearch]        = useState("");
  const [roleFilter,    setRoleFilter]    = useState("");
  const [page,          setPage]          = useState(1);
  const [toggleId,      setToggleId]      = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const limit = 10;

  // ── Fetch users ──────────────────────────
  const { data, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn:  () => authService.getAllUsers({
      search, role: roleFilter, page, limit,
    }),
    keepPreviousData: true,
  });

  const users = data?.data || [];
  const meta  = data?.meta || {};

  // ── Toggle status mutation ───────────────
  const toggleMutation = useMutation({
    mutationFn: authService.toggleUserStatus,
    onSuccess: (res) => {
      toast.success(
        "User " + (res?.data?.isActive ? "activated" : "deactivated") + " successfully!"
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      setToggleId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update user status.");
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)" }}>
            Users
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {meta.total || 0} total users
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} leftIcon="+">
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", padding: "1rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: "200px", padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
        />

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{ padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
        >
          <option value="">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="clientadmin">Client Admin</option>
        </select>

        {(search || roleFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setRoleFilter(""); setPage(1); }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "var(--color-background)", borderRadius: "12px", border: "1px solid var(--color-border)", overflow: "hidden" }}>

        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-secondary)" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</p>
            <p style={{ fontWeight: "500" }}>No users found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
                  {["User", "Role", "Client", "Status", "Last Login", "Created", "Actions"].map((h) => (
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
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    style={{ borderBottom: index < users.length - 1 ? "1px solid var(--color-border)" : "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {/* User info */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {/* Avatar */}
                        <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.8rem", fontWeight: "bold", flexShrink: 0, overflow: "hidden" }}>
                          {user.avatar?.url ? (
                            <img src={user.avatar.url} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>

                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
                            {user.name}
                            {user._id === currentUser?._id && (
                              <span style={{ marginLeft: "0.4rem", fontSize: "0.7rem", color: "var(--color-primary)", fontWeight: "600" }}>
                                (You)
                              </span>
                            )}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Client */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      {user.client ? (
                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-primary)" }}>
                          {user.client?.name || "Linked"}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <Badge variant={user.isActive ? "success" : "error"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    {/* Last login */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                        {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                      </span>
                    </td>

                    {/* Created */}
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                        {user.createdAt ? formatDate(user.createdAt) : "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.875rem 1rem", textAlign: "right" }}>
                      {user._id !== currentUser?._id ? (
                        <Button
                          size="sm"
                          variant={user.isActive ? "danger" : "success"}
                          onClick={() => setToggleId(user._id)}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                          Current user
                        </span>
                      )}
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

      {/* Create user modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })}
      />

      {/* Toggle status confirm */}
      <ConfirmDialog
        isOpen={!!toggleId}
        onClose={() => setToggleId(null)}
        onConfirm={() => toggleMutation.mutate(toggleId)}
        isLoading={toggleMutation.isPending}
        title="Change User Status"
        message="Are you sure you want to change this user's active status?"
        confirmText="Confirm"
        variant="warning"
      />
    </div>
  );
};

export default UsersList;
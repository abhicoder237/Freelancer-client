import { useState }              from "react";
import { useMutation }           from "@tanstack/react-query";
import { useForm }               from "react-hook-form";
import toast                     from "react-hot-toast";
import authService               from "@services/authService.js";
import uploadService             from "@services/uploadService.js";
import clientService             from "@services/clientService.js";
import { useAuth }               from "@context/AuthContext.jsx";
import { useClient }             from "@context/ClientContext.jsx";
import { Button, Input }         from "@components/index.js";
import { Spinner }               from "@components/Loader.jsx";

// ─────────────────────────────────────────
// SETTINGS SECTION WRAPPER
// ─────────────────────────────────────────

const SettingsSection = ({ title, description, children }) => (
  <div style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden" }}>
    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          {description}
        </p>
      )}
    </div>
    <div style={{ padding: "1.5rem" }}>
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────
// PROFILE SETTINGS
// ─────────────────────────────────────────

const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [avatarUploading, setAvatarUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: { name: user?.name || "" },
  });

  const updateMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (res) => {
      if (res?.data) updateUser(res.data);
      toast.success("Profile updated!");
    },
    onError: (err) => toast.error(err.message || "Update failed."),
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const res = await uploadService.uploadAvatar(file);
      if (res?.data?.avatar) {
        updateUser({ ...user, avatar: res.data.avatar });
        toast.success("Avatar updated!");
      }
    } catch {
      toast.error("Failed to upload avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <SettingsSection
      title="Profile"
      description="Update your personal information and avatar"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.5rem", fontWeight: "bold", overflow: "hidden", border: "3px solid var(--color-border)" }}>
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user?.name?.[0]?.toUpperCase()
              )}
            </div>

            {avatarUploading && (
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spinner size="sm" />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: "inline-block", padding: "0.4rem 0.875rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-text-primary)", fontWeight: "500" }}>
              Change Avatar
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
            </label>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.375rem" }}>
              JPG, PNG, WEBP — Max 5MB
            </p>
          </div>
        </div>

        {/* Name */}
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Input
              label="Full Name"
              placeholder="Your full name"
              error={errors.name?.message}
              {...register("name", {
                required:  "Name is required",
                minLength: { value: 2, message: "Min 2 characters" },
              })}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ flex: 1, padding: "0.625rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-surface)", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                {user?.email}
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                Email cannot be changed
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Role:
              </span>
              <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)", textTransform: "capitalize" }}>
                {user?.role}
              </span>
            </div>

            <Button
              type="submit"
              isLoading={updateMutation.isPending}
              disabled={!isDirty}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </SettingsSection>
  );
};

// ─────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────

const ChangePassword = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword:     "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const changeMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success("Password changed! Please log in again.");
      reset();
    },
    onError: (err) => toast.error(err.message || "Failed to change password."),
  });

  return (
    <SettingsSection
      title="Change Password"
      description="Use a strong password with uppercase, lowercase, numbers, and symbols"
    >
      <form onSubmit={handleSubmit((data) => changeMutation.mutate(data))}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>

          <Input
            label="Current Password"
            type={showCurrent ? "text" : "password"}
            placeholder="••••••••"
            required
            error={errors.currentPassword?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
              >
                {showCurrent ? "🙈" : "👁️"}
              </button>
            }
            {...register("currentPassword", {
              required: "Current password is required",
            })}
          />

          <Input
            label="New Password"
            type={showNew ? "text" : "password"}
            placeholder="Min 8 characters"
            required
            error={errors.newPassword?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
              >
                {showNew ? "🙈" : "👁️"}
              </button>
            }
            {...register("newPassword", {
              required:  "New password is required",
              minLength: { value: 8, message: "Min 8 characters" },
              pattern: {
                value:   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                message: "Must include uppercase, lowercase, number, and special character",
              },
            })}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) =>
                val === newPassword || "Passwords do not match",
            })}
          />

          <Button type="submit" isLoading={changeMutation.isPending}>
            Change Password
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
};

// ─────────────────────────────────────────
// CLIENT BRANDING
// ─────────────────────────────────────────

const ClientBranding = () => {
  const { clientId, client, refreshClient } = useClient();
  const [logoUploading,    setLogoUploading]    = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;

    setLogoUploading(true);
    try {
      await uploadService.uploadLogo(file, client?.name + " Logo");
      toast.success("Logo updated!");
      refreshClient();
    } catch {
      toast.error("Logo upload failed.");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;

    setFaviconUploading(true);
    try {
      await uploadService.uploadFavicon(file);
      toast.success("Favicon updated!");
      refreshClient();
    } catch {
      toast.error("Favicon upload failed.");
    } finally {
      setFaviconUploading(false);
    }
  };

  if (!clientId) return null;

  return (
    <SettingsSection
      title="Branding"
      description="Upload your client logo and favicon"
    >
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
            Logo
          </p>

          <div style={{ width: "8rem", height: "4rem", borderRadius: "8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {logoUploading ? (
              <Spinner size="sm" />
            ) : client?.logo?.url ? (
              <img src={client.logo.url} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: "0.5rem" }} />
            ) : (
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>No logo</span>
            )}
          </div>

          <label style={{ display: "inline-block", padding: "0.4rem 0.875rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", color: "var(--color-text-primary)", fontWeight: "500", textAlign: "center" }}>
            Upload Logo
            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
          </label>
          <p style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
            PNG, SVG recommended
          </p>
        </div>

        {/* Favicon */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
            Favicon
          </p>

          <div style={{ width: "3rem", height: "3rem", borderRadius: "8px", background: "var(--color-surface)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {faviconUploading ? (
              <Spinner size="sm" />
            ) : client?.favicon?.url ? (
              <img src={client.favicon.url} alt="Favicon" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: "1.25rem" }}>🌐</span>
            )}
          </div>

          <label style={{ display: "inline-block", padding: "0.4rem 0.875rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", color: "var(--color-text-primary)", fontWeight: "500", textAlign: "center" }}>
            Upload Favicon
            <input type="file" accept="image/*" onChange={handleFaviconUpload} style={{ display: "none" }} />
          </label>
          <p style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
            32×32 or 64×64 px
          </p>
        </div>
      </div>
    </SettingsSection>
  );
};

// ─────────────────────────────────────────
// DANGER ZONE
// ─────────────────────────────────────────

const DangerZone = () => {
  const { client, clientId } = useClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const maintenanceMutation = useMutation({
    mutationFn: () => clientService.toggleMaintenance(clientId, {}),
    onSuccess: () => {
      toast.success("Maintenance mode toggled!");
    },
    onError: (err) => toast.error(err.message || "Failed."),
  });

  if (!clientId) return null;

  return (
    <SettingsSection
      title="Danger Zone"
      description="Irreversible actions — proceed with caution"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Maintenance toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-border)", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
              Maintenance Mode
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
              {client?.isUnderMaintenance
                ? "Site is currently under maintenance"
                : "Site is live and accessible"}
            </p>
          </div>

          <Button
            variant={client?.isUnderMaintenance ? "success" : "danger"}
            size="sm"
            onClick={() => setShowConfirm(true)}
            isLoading={maintenanceMutation.isPending}
          >
            {client?.isUnderMaintenance ? "Disable Maintenance" : "Enable Maintenance"}
          </Button>
        </div>

        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => { maintenanceMutation.mutate(); setShowConfirm(false); }}
          title="Toggle Maintenance Mode"
          message={client?.isUnderMaintenance
            ? "This will make your website accessible to visitors again."
            : "This will show a maintenance page to all website visitors."}
          confirmText="Confirm"
          variant="warning"
        />
      </div>
    </SettingsSection>
  );
};

// ─────────────────────────────────────────
// ADMIN SETTINGS MAIN PAGE
// ─────────────────────────────────────────

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile",  label: "👤 Profile" },
    { id: "password", label: "🔐 Password" },
    { id: "branding", label: "🎨 Branding" },
    { id: "danger",   label: "⚠️ Danger Zone" },
  ];

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)" }}>
          Settings
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Manage your account and platform settings
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--color-border)", marginBottom: "1.5rem", overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ padding: "0.625rem 1rem", background: "none", border: "none", borderBottom: activeTab === tab.id ? "2px solid var(--color-primary)" : "2px solid transparent", color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-text-secondary)", fontWeight: activeTab === tab.id ? "600" : "400", cursor: "pointer", fontSize: "0.875rem", whiteSpace: "nowrap", transition: "all 0.2s" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profile"  && <ProfileSettings />}
      {activeTab === "password" && <ChangePassword />}
      {activeTab === "branding" && <ClientBranding />}
      {activeTab === "danger"   && <DangerZone />}

    </div>
  );
};

export default AdminSettings;
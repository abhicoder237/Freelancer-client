 import { useState }              from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast                     from "react-hot-toast";
import themeService              from "@services/themeService.js";
import clientService             from "@services/clientService.js";
import { useClient }             from "@context/ClientContext.jsx";
import { useAuth }               from "@context/AuthContext.jsx";
import { QUERY_KEYS }            from "@constants/api.js";
import { Badge, Button, ConfirmDialog, Modal, ModalFooter } from "@components/index.js";
import { Spinner, SkeletonCard } from "@components/Loader.jsx";
import Input                     from "@components/Input.jsx";
import Select                    from "@components/Select.jsx";

// ─────────────────────────────────────────
// COLOR PICKER FIELD
// ─────────────────────────────────────────

const ColorField = ({ label, value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
    <label style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", fontWeight: "500" }}>
      {label}
    </label>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "2.5rem", height: "2.5rem", padding: "2px", border: "1px solid var(--color-border)", borderRadius: "6px", cursor: "pointer", background: "none" }}
      />
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        style={{ flex: 1, padding: "0.4rem 0.625rem", border: "1.5px solid var(--color-border)", borderRadius: "6px", fontSize: "0.8rem", color: "var(--color-text-primary)", background: "var(--color-background)", outline: "none", fontFamily: "monospace" }}
      />
    </div>
  </div>
);

// ─────────────────────────────────────────
// THEME CARD
// ─────────────────────────────────────────

const ThemeCard = ({ theme, onActivate, onEdit, onDuplicate, onDelete, isActivating }) => (
  <div
    style={{ background: "var(--color-background)", border: theme.isActive ? "2px solid var(--color-primary)" : "1px solid var(--color-border)", borderRadius: "14px", overflow: "hidden", transition: "box-shadow 0.2s" }}
    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
  >
    <div style={{ height: "0.5rem", background: "linear-gradient(to right, " + (theme.colors?.primary || "#3B82F6") + ", " + (theme.colors?.secondary || "#8B5CF6") + ", " + (theme.colors?.accent || "#F59E0B") + ")" }} />

    <div style={{ padding: "1rem", borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {["background", "surface", "primary", "secondary", "accent", "navbar", "footer"].map((key) => (
          <div
            key={key}
            title={key + ": " + theme.colors?.[key]}
            style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: theme.colors?.[key] || "#ccc", border: "2px solid var(--color-border)", flexShrink: 0 }}
          />
        ))}
      </div>
      <div style={{ marginTop: "0.75rem" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
          Fonts: {theme.typography?.headingFont || "Inter"} / {theme.typography?.bodyFont || "Inter"}
        </p>
      </div>
    </div>

    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
          {theme.name}
        </h3>
        {theme.isActive && <Badge variant="success">Active</Badge>}
      </div>

      <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", textTransform: "capitalize", marginBottom: "1rem" }}>
        Preset: {theme.preset}
      </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {!theme.isActive && (
          <Button size="sm" variant="primary" onClick={() => onActivate(theme._id)} isLoading={isActivating}>
            Activate
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => onEdit(theme)}>Edit</Button>
        <Button size="sm" variant="ghost" onClick={() => onDuplicate(theme._id)}>Copy</Button>
        {!theme.isActive && (
          <Button size="sm" variant="danger" onClick={() => onDelete(theme._id)}>Delete</Button>
        )}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────
// THEME EDITOR MODAL
// ─────────────────────────────────────────

const ThemeEditorModal = ({ theme, isOpen, onClose, onSave, isSaving }) => {
  const [colors,      setColors]      = useState(theme?.colors || {});
  const [name,        setName]        = useState(theme?.name || "");
  const [buttonStyle, setButtonStyle] = useState(theme?.buttonStyle || "filled");
  const [headingFont, setHeadingFont] = useState(theme?.typography?.headingFont || "Inter");
  const [bodyFont,    setBodyFont]    = useState(theme?.typography?.bodyFont || "Inter");

  const updateColor = (key, val) => setColors((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    onSave(theme._id, {
      name,
      colors,
      buttonStyle,
      typography: {
        ...theme.typography,
        headingFont,
        bodyFont,
      },
    });
  };

  const colorFields = [
    { key: "primary",       label: "Primary" },
    { key: "secondary",     label: "Secondary" },
    { key: "accent",        label: "Accent" },
    { key: "background",    label: "Background" },
    { key: "surface",       label: "Surface" },
    { key: "textPrimary",   label: "Text Primary" },
    { key: "textSecondary", label: "Text Secondary" },
    { key: "border",        label: "Border" },
    { key: "navbar",        label: "Navbar" },
    { key: "footer",        label: "Footer" },
    { key: "success",       label: "Success" },
    { key: "error",         label: "Error" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"Edit Theme — " + (theme?.name || "")} size="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        <Input label="Theme Name" value={name} onChange={(e) => setName(e.target.value)} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Input
            label="Heading Font (Google Fonts)"
            placeholder="e.g. Montserrat"
            value={headingFont}
            onChange={(e) => setHeadingFont(e.target.value)}
            hint="Playfair Display, Montserrat, Roboto..."
          />
          <Input
            label="Body Font (Google Fonts)"
            placeholder="e.g. Open Sans"
            value={bodyFont}
            onChange={(e) => setBodyFont(e.target.value)}
            hint="Open Sans, Lora, Inter..."
          />
        </div>

        <Select
          label="Button Style"
          value={buttonStyle}
          onChange={(e) => setButtonStyle(e.target.value)}
          options={[
            { value: "filled",   label: "Filled" },
            { value: "outlined", label: "Outlined" },
            { value: "ghost",    label: "Ghost" },
            { value: "soft",     label: "Soft" },
          ]}
        />

        <div>
          <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
            Colors
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {colorFields.map(({ key, label }) => (
              <ColorField
                key={key}
                label={label}
                value={colors[key]}
                onChange={(val) => updateColor(key, val)}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: "1rem", borderRadius: "10px", border: "1px solid var(--color-border)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Live Preview</p>
          <div style={{ height: "0.5rem", borderRadius: "999px", background: "linear-gradient(to right, " + (colors.primary || "#3B82F6") + ", " + (colors.secondary || "#8B5CF6") + ", " + (colors.accent || "#F59E0B") + ")", marginBottom: "0.75rem" }} />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["primary", "secondary", "accent", "background", "surface", "navbar", "footer"].map((key) => (
              <div key={key} title={key} style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: colors[key] || "#ccc", border: "2px solid var(--color-border)" }} />
            ))}
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} isLoading={isSaving}>Save Theme</Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────
// PRESET SELECTOR MODAL
// ─────────────────────────────────────────

const PresetModal = ({ isOpen, onClose, onApply, themeId, isApplying }) => {
  const [selected, setSelected] = useState("");

  const { data: presetsRes } = useQuery({
    queryKey: QUERY_KEYS.PRESETS,
    queryFn:  themeService.getPresets,
    enabled:  isOpen,
  });

  const presets = presetsRes?.data || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Preset" size="lg">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        {presets.map((preset) => (
          <div
            key={preset.id}
            onClick={() => setSelected(preset.id)}
            style={{ padding: "1rem", borderRadius: "10px", border: selected === preset.id ? "2px solid var(--color-primary)" : "1px solid var(--color-border)", cursor: "pointer", transition: "all 0.15s" }}
          >
            <div style={{ display: "flex", gap: "0.375rem", marginBottom: "0.5rem" }}>
              {["primary", "secondary", "accent", "background", "navbar"].map((key) => (
                <div key={key} style={{ width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: preset.colors?.[key] || "#ccc", border: "1px solid rgba(0,0,0,0.1)" }} />
              ))}
            </div>
            <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--color-text-primary)" }}>{preset.name}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>{preset.typography?.headingFont}</p>
          </div>
        ))}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={!selected} isLoading={isApplying} onClick={() => onApply(themeId, selected)}>
          Apply Preset
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// ─────────────────────────────────────────
// THEME MANAGER MAIN
// ─────────────────────────────────────────

const ThemeManager = () => {
  const queryClient                    = useQueryClient();
  const { clientId, updateTheme }      = useClient();
  const { user, isAdminOrAbove }       = useAuth();

  // ── For superadmin/admin — client selector ─
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");

  // Active client ID — clientadmin uses own, admin selects
  const activeClientId = user.role === "clientadmin"
    ? clientId
    : selectedClientId || clientId;

  const [editingTheme,  setEditingTheme]  = useState(null);
  const [presetThemeId, setPresetThemeId] = useState(null);
  const [deleteId,      setDeleteId]      = useState(null);
  const [newThemeName,  setNewThemeName]  = useState("");
  const [showNewForm,   setShowNewForm]   = useState(false);

  // ── Fetch all clients for selector (admin only) ──
  const { data: clientsRes } = useQuery({
    queryKey: ["clients-list"],
    queryFn:  () => clientService.getAllClients({ limit: 100 }),
    enabled:  isAdminOrAbove,
  });

  const allClients = clientsRes?.data || [];

  // ── Fetch themes ─────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.THEMES(activeClientId),
    queryFn:  () => themeService.getAllThemes({ client: activeClientId }),
    enabled:  !!activeClientId,
  });

  const themes = data?.data || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.THEMES(activeClientId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_THEME(activeClientId) });
  };

  // ── Mutations ────────────────────────────
  const activateMutation = useMutation({
    mutationFn: themeService.activateTheme,
    onSuccess: (res) => {
      toast.success("Theme activated!");
      if (res?.data) updateTheme(res.data);
      invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to activate."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => themeService.updateTheme(id, data),
    onSuccess: (res) => {
      toast.success("Theme updated!");
      if (res?.data?.isActive) updateTheme(res.data);
      invalidate();
      setEditingTheme(null);
    },
    onError: (err) => toast.error(err.message || "Failed to update."),
  });

  const createMutation = useMutation({
    mutationFn: themeService.createTheme,
    onSuccess: () => {
      toast.success("Theme created!");
      invalidate();
      setShowNewForm(false);
      setNewThemeName("");
    },
    onError: (err) => toast.error(err.message || "Failed to create."),
  });

  const duplicateMutation = useMutation({
    mutationFn: themeService.duplicateTheme,
    onSuccess: () => {
      toast.success("Theme duplicated!");
      invalidate();
    },
  });

  const presetMutation = useMutation({
    mutationFn: ({ id, preset }) => themeService.applyPreset(id, preset),
    onSuccess: (res) => {
      toast.success("Preset applied!");
      if (res?.data?.isActive) updateTheme(res.data);
      invalidate();
      setPresetThemeId(null);
    },
    onError: (err) => toast.error(err.message || "Failed to apply preset."),
  });

  const deleteMutation = useMutation({
    mutationFn: themeService.deleteTheme,
    onSuccess: () => {
      toast.success("Theme deleted!");
      invalidate();
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message || "Failed to delete."),
  });

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-text-primary)" }}>
            Theme Manager
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {themes.length} theme{themes.length !== 1 ? "s" : ""} — click Activate to apply
          </p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)} leftIcon="+">
          New Theme
        </Button>
      </div>

      {/* ── Client Selector — admin/superadmin only ── */}
      {isAdminOrAbove && (
        <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
          <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Select Client
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            style={{ width: "100%", maxWidth: "350px", padding: "0.5rem 0.875rem", border: "1.5px solid var(--color-border)", borderRadius: "8px", background: "var(--color-background)", color: "var(--color-text-primary)", fontSize: "0.875rem", outline: "none" }}
          >
            <option value="">-- Select a client to manage themes --</option>
            {allClients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
          {!activeClientId && (
            <p style={{ fontSize: "0.8rem", color: "var(--color-error)", marginTop: "0.5rem" }}>
              Please select a client to view and manage themes.
            </p>
          )}
        </div>
      )}

      {/* No client selected state */}
      {!activeClientId && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-secondary)" }}>
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎨</p>
          <p style={{ fontSize: "1rem", fontWeight: "500" }}>Select a client above</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Choose a client to view and manage their themes.
          </p>
        </div>
      )}

      {/* New theme form */}
      {showNewForm && activeClientId && (
        <div style={{ padding: "1.25rem", background: "var(--color-surface)", borderRadius: "12px", border: "1px solid var(--color-border)", display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <Input
            label="Theme Name"
            placeholder="e.g. SportZone Dark Red"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            containerClass="flex-1"
          />
          <Button
            onClick={() => createMutation.mutate({
              name:   newThemeName,
              client: activeClientId,
            })}
            isLoading={createMutation.isPending}
            disabled={!newThemeName.trim()}
          >
            Create
          </Button>
          <Button variant="ghost" onClick={() => setShowNewForm(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Themes grid */}
      {activeClientId && (
        isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : themes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-secondary)" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎨</p>
            <p style={{ fontSize: "1rem", fontWeight: "500" }}>No themes yet</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Click "+ New Theme" to create the first theme.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {themes.map((theme) => (
              <ThemeCard
                key={theme._id}
                theme={theme}
                onActivate={(id) => activateMutation.mutate(id)}
                onEdit={(t) => setEditingTheme(t)}
                onDuplicate={(id) => duplicateMutation.mutate(id)}
                onDelete={(id) => setDeleteId(id)}
                isActivating={activateMutation.isPending}
              />
            ))}
          </div>
        )
      )}

      {/* Preset button for active theme */}
      {activeClientId && themes.find((t) => t.isActive) && (
        <div style={{ padding: "1rem", background: "var(--color-surface)", borderRadius: "10px", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-primary)" }}>
              Quick Preset
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
              Apply a preset to the active theme
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setPresetThemeId(themes.find((t) => t.isActive)?._id)}
          >
            Browse Presets
          </Button>
        </div>
      )}

      {/* Edit modal */}
      {editingTheme && (
        <ThemeEditorModal
          theme={editingTheme}
          isOpen={!!editingTheme}
          onClose={() => setEditingTheme(null)}
          onSave={(id, data) => updateMutation.mutate({ id, data })}
          isSaving={updateMutation.isPending}
        />
      )}

      {/* Preset modal */}
      <PresetModal
        isOpen={!!presetThemeId}
        onClose={() => setPresetThemeId(null)}
        themeId={presetThemeId}
        onApply={(id, preset) => presetMutation.mutate({ id, preset })}
        isApplying={presetMutation.isPending}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
        title="Delete Theme"
        message="Are you sure you want to delete this theme? This cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default ThemeManager;
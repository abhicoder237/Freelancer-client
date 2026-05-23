import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import clientService  from "@services/clientService.js";
import themeService   from "@services/themeService.js";
import { setClientSlug } from "@services/apiClient.js";

// ─────────────────────────────────────────
// CONTEXT CREATION
// ─────────────────────────────────────────

const ClientContext = createContext(null);

// ─────────────────────────────────────────
// HELPER — Detect client slug
// Priority:
// 1. Subdomain (acme.youragency.com)
// 2. Query param (?client=acme)
// 3. localStorage (last used)
// ─────────────────────────────────────────

const detectClientSlug = () => {
  const hostname        = window.location.hostname;
  const platformDomain  = import.meta.env.VITE_PLATFORM_DOMAIN
    || "youragency.com";

  // ── Strategy 1: Subdomain ─────────────
  if (hostname.endsWith(`.${platformDomain}`)) {
    const subdomain = hostname
      .replace(`.${platformDomain}`, "")
      .toLowerCase();

    if (subdomain && subdomain !== "www" && subdomain !== "admin") {
      return subdomain;
    }
  }

  // ── Strategy 2: Query param ───────────
  const params = new URLSearchParams(window.location.search);
  const clientParam = params.get("client");
  if (clientParam) return clientParam;

  // ── Strategy 3: localStorage ──────────
  const stored = localStorage.getItem("clientSlug");
  if (stored) return stored;

  return null;
};

// ─────────────────────────────────────────
// CLIENT PROVIDER
// ─────────────────────────────────────────

export const ClientProvider = ({ children }) => {

  // ── State ────────────────────────────────
  const [client,       setClient]       = useState(null);
  const [theme,        setTheme]        = useState(null);
  const [clientSlug,   setClientSlugState] = useState(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState(null);
  const [themeApplied, setThemeApplied] = useState(false);

  // ─────────────────────────────────────────
  // LOAD CLIENT CONFIG
  // Fetches client + theme from backend
  // ─────────────────────────────────────────

  const loadClientConfig = useCallback(async (slug) => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    try {
      // Set slug in axios defaults + localStorage
      setClientSlug(slug);
      setClientSlugState(slug);

      // Fetch client config
      const response = await clientService.getConfig(slug);

      if (response.data) {
        const clientData = response.data;
        setClient(clientData);

        // Apply theme if present
        if (clientData.theme) {
          setTheme(clientData.theme);
          themeService.applyTheme(clientData.theme);
          setThemeApplied(true);
        }

        // Update page title
        if (clientData.name) {
          document.title = clientData.seo?.metaTitle || clientData.name;
        }

        // Update favicon
        if (clientData.favicon?.url) {
          const favicon = document.querySelector("link[rel='icon']");
          if (favicon) favicon.href = clientData.favicon.url;
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load client config");
      console.error("Client config load failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────
  // INITIALIZE ON MOUNT
  // ─────────────────────────────────────────

  useEffect(() => {
    const slug = detectClientSlug();
    if (slug) {
      loadClientConfig(slug);
    }
  }, [loadClientConfig]);

  // ─────────────────────────────────────────
  // SWITCH CLIENT
  // Used in admin panel to switch context
  // ─────────────────────────────────────────

  const switchClient = useCallback(async (slug) => {
    setThemeApplied(false);
    await loadClientConfig(slug);
  }, [loadClientConfig]);

  // ─────────────────────────────────────────
  // UPDATE THEME
  // Called after theme change in admin
  // ─────────────────────────────────────────

  const updateTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    themeService.applyTheme(newTheme);
  }, []);

  // ─────────────────────────────────────────
  // UPDATE CLIENT
  // Called after client update in admin
  // ─────────────────────────────────────────

  const updateClient = useCallback((updatedClient) => {
    setClient(updatedClient);
  }, []);

  // ─────────────────────────────────────────
  // REFRESH CLIENT CONFIG
  // Force re-fetch from backend
  // ─────────────────────────────────────────

  const refreshClient = useCallback(() => {
    if (clientSlug) {
      loadClientConfig(clientSlug);
    }
  }, [clientSlug, loadClientConfig]);

  // ─────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────

  const value = {
    // State
    client,
    theme,
    clientSlug,
    isLoading,
    error,
    themeApplied,

    // Computed
    clientId:   client?._id || null,
    clientName: client?.name || "",
    logo:       client?.logo || null,
    contact:    client?.contact || {},
    social:     client?.social || {},
    seo:        client?.seo || {},
    plan:       client?.plan || "free",

    // Actions
    loadClientConfig,
    switchClient,
    updateTheme,
    updateClient,
    refreshClient,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

// ─────────────────────────────────────────
// CUSTOM HOOK
// ─────────────────────────────────────────

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient must be used within ClientProvider");
  }
  return context;
};

export default ClientContext;
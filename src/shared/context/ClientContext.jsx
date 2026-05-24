 import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import clientService     from "@services/clientService.js";
import themeService      from "@services/themeService.js";
import { setClientSlug } from "@services/apiClient.js";

// ─────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────

const ClientContext = createContext(null);

// ─────────────────────────────────────────
// HELPER — Detect client slug from URL
// ─────────────────────────────────────────

const detectClientSlug = () => {
  const hostname       = window.location.hostname;
  const platformDomain = import.meta.env.VITE_PLATFORM_DOMAIN || "youragency.com";

  // Strategy 1 — Subdomain
  if (hostname.endsWith(`.${platformDomain}`)) {
    const subdomain = hostname
      .replace(`.${platformDomain}`, "")
      .toLowerCase();
    if (subdomain && subdomain !== "www" && subdomain !== "admin") {
      return subdomain;
    }
  }

  // Strategy 2 — Query param
  const params      = new URLSearchParams(window.location.search);
  const clientParam = params.get("client");
  if (clientParam) return clientParam;

  // Strategy 3 — localStorage
  const stored = localStorage.getItem("clientSlug");
  if (stored) return stored;

  return null;
};

// ─────────────────────────────────────────
// CLIENT PROVIDER
// ─────────────────────────────────────────

export const ClientProvider = ({ children }) => {

  const [client,        setClient]        = useState(null);
  const [theme,         setTheme]         = useState(null);
  const [clientSlug,    setClientSlugState] = useState(null);
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState(null);
  const [themeApplied,  setThemeApplied]  = useState(false);

  // ─────────────────────────────────────────
  // LOAD BY SLUG
  // ─────────────────────────────────────────

  const loadClientConfig = useCallback(async (slug) => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    try {
      setClientSlug(slug);
      setClientSlugState(slug);

      const response = await clientService.getConfig(slug);

      if (response?.data) {
        const clientData = response.data;
        setClient(clientData);

        if (clientData.theme) {
          setTheme(clientData.theme);
          themeService.applyTheme(clientData.theme);
          setThemeApplied(true);
        }

        if (clientData.name) {
          document.title =
            clientData.seo?.metaTitle || clientData.name;
        }

        if (clientData.favicon?.url) {
          const favicon = document.querySelector("link[rel='icon']");
          if (favicon) favicon.href = clientData.favicon.url;
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load client config");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────
  // LOAD BY ID — Admin panel ke liye
  // ─────────────────────────────────────────

  const loadClientById = useCallback(async (id) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await clientService.getClient(id);

      if (response?.data) {
        const clientData = response.data;
        setClient(clientData);
        setClientSlugState(clientData.slug);
        setClientSlug(clientData.slug);

        if (clientData.theme) {
          setTheme(clientData.theme);
          themeService.applyTheme(clientData.theme);
          setThemeApplied(true);
        }

        if (clientData.name) {
          document.title =
            clientData.seo?.metaTitle || clientData.name;
        }
      }
    } catch (err) {
      console.error("Client load by ID failed:", err);
      setError(err.message || "Failed to load client");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────
  // INITIALIZE ON MOUNT
  // ─────────────────────────────────────────

  useEffect(() => {
    const initClient = async () => {
      // Strategy 1 — URL se slug detect karo
      const slugFromUrl = detectClientSlug();
      if (slugFromUrl) {
        await loadClientConfig(slugFromUrl);
        return;
      }

      // Strategy 2 — localStorage se user check karo
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // User ke saath client linked hai
          if (parsedUser?.client) {
            const clientObj = parsedUser.client;

            if (typeof clientObj === "object" && clientObj.slug) {
              // Populated object — slug directly hai
              await loadClientConfig(clientObj.slug);
            } else if (typeof clientObj === "object" && clientObj._id) {
              // Object with _id — ID se load karo
              await loadClientById(clientObj._id);
            } else if (typeof clientObj === "string") {
              // Plain ObjectId string
              await loadClientById(clientObj);
            }
          }
        }
      } catch (err) {
        console.error("Client init from user failed:", err);
      }
    };

    initClient();
  }, [loadClientConfig, loadClientById]);

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────

  const switchClient = useCallback(async (slug) => {
    setThemeApplied(false);
    await loadClientConfig(slug);
  }, [loadClientConfig]);

  const updateTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    themeService.applyTheme(newTheme);
  }, []);

  const updateClient = useCallback((updatedClient) => {
    setClient(updatedClient);
  }, []);

  const refreshClient = useCallback(() => {
    if (clientSlug) {
      loadClientConfig(clientSlug);
    }
  }, [clientSlug, loadClientConfig]);

  // ─────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────

  const value = {
    client,
    theme,
    clientSlug,
    isLoading,
    error,
    themeApplied,
    clientId:   client?._id   || null,
    clientName: client?.name  || "",
    logo:       client?.logo  || null,
    contact:    client?.contact || {},
    social:     client?.social  || {},
    seo:        client?.seo     || {},
    plan:       client?.plan    || "free",
    loadClientConfig,
    loadClientById,
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
// HOOK
// ─────────────────────────────────────────

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClient must be used within ClientProvider");
  }
  return context;
};

export default ClientContext;
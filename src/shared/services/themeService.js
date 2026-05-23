import apiClient          from "./apiClient.js";
import { THEME_ENDPOINTS } from "@constants/api.js";

// ─────────────────────────────────────────
// THEME SERVICE
// ─────────────────────────────────────────

const themeService = {

  // ── Public ───────────────────────────────
  getActiveTheme: async (clientSlug) => {
    return await apiClient.get(THEME_ENDPOINTS.ACTIVE, {
      headers: { "x-client-slug": clientSlug },
    });
  },

  // ── Admin ────────────────────────────────
  getAllThemes: async (params = {}) => {
    return await apiClient.get(THEME_ENDPOINTS.GET_ALL, { params });
  },

  getPresets: async () => {
    return await apiClient.get(THEME_ENDPOINTS.PRESETS);
  },

  getTheme: async (id) => {
    return await apiClient.get(THEME_ENDPOINTS.GET_ONE(id));
  },

  createTheme: async (data) => {
    return await apiClient.post(THEME_ENDPOINTS.CREATE, data);
  },

  updateTheme: async (id, data) => {
    return await apiClient.put(THEME_ENDPOINTS.UPDATE(id), data);
  },

  activateTheme: async (id) => {
    return await apiClient.put(THEME_ENDPOINTS.ACTIVATE(id));
  },

  applyPreset: async (id, preset) => {
    return await apiClient.put(
      THEME_ENDPOINTS.APPLY_PRESET(id),
      { preset }
    );
  },

  duplicateTheme: async (id) => {
    return await apiClient.post(THEME_ENDPOINTS.DUPLICATE(id));
  },

  deleteTheme: async (id) => {
    return await apiClient.delete(THEME_ENDPOINTS.DELETE(id));
  },

  // ── CSS Variables injection ───────────────
  // Injects theme CSS vars into :root
  injectThemeVars: (cssVariables) => {
    if (!cssVariables) return;

    const root = document.documentElement;
    const vars = cssVariables
      .split(";")
      .map((v) => v.trim())
      .filter(Boolean);

    vars.forEach((variable) => {
      const colonIndex = variable.indexOf(":");
      if (colonIndex === -1) return;

      const property = variable.substring(0, colonIndex).trim();
      const value    = variable.substring(colonIndex + 1).trim();

      if (property && value) {
        root.style.setProperty(property, value);
      }
    });
  },

  // ── Load Google Font dynamically ──────────
  loadGoogleFont: (fontName) => {
    if (!fontName || fontName === "Inter") return;

    const fontUrl = `https://fonts.googleapis.com/css2?family=${
      fontName.replace(/ /g, "+")
    }:wght@300;400;500;600;700;800&display=swap`;

    // Check if already loaded
    const existing = document.querySelector(`link[href="${fontUrl}"]`);
    if (existing) return;

    const link    = document.createElement("link");
    link.rel      = "stylesheet";
    link.href     = fontUrl;
    document.head.appendChild(link);
  },

  // ── Apply full theme ─────────────────────
  // Injects CSS vars + loads fonts
  applyTheme: (theme) => {
    if (!theme) return;

    // Inject CSS variables
    if (theme.cssVariables) {
      themeService.injectThemeVars(theme.cssVariables);
    }

    // Load Google Fonts
    if (theme.typography?.headingFont) {
      themeService.loadGoogleFont(theme.typography.headingFont);
    }

    if (
      theme.typography?.bodyFont &&
      theme.typography.bodyFont !== theme.typography.headingFont
    ) {
      themeService.loadGoogleFont(theme.typography.bodyFont);
    }

    // Dark mode
    if (theme.darkMode?.enabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Update browser theme color
    const themeColorMeta = document.getElementById("theme-color-meta");
    if (themeColorMeta && theme.colors?.primary) {
      themeColorMeta.content = theme.colors.primary;
    }
  },
};

export default themeService;
// ─────────────────────────────────────────
// API CONSTANTS
// All endpoint URLs defined here
// Change base URL → everything updates
// ─────────────────────────────────────────

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// ── Auth Endpoints ───────────────────────
export const AUTH_ENDPOINTS = {
  LOGIN:           `${API_BASE_URL}/auth/login`,
  LOGOUT:          `${API_BASE_URL}/auth/logout`,
  REGISTER:        `${API_BASE_URL}/auth/register`,
  ME:              `${API_BASE_URL}/auth/me`,
  UPDATE_PROFILE:  `${API_BASE_URL}/auth/me`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  USERS:           `${API_BASE_URL}/auth/users`,
  TOGGLE_STATUS:   (id) => `${API_BASE_URL}/auth/users/${id}/toggle-status`,
};

// ── Client Endpoints ─────────────────────
export const CLIENT_ENDPOINTS = {
  CONFIG:           `${API_BASE_URL}/clients/config`,
  BASE:             `${API_BASE_URL}/clients`,
  GET_ALL:          `${API_BASE_URL}/clients`,
  CREATE:           `${API_BASE_URL}/clients`,
  GET_ONE:          (id) => `${API_BASE_URL}/clients/${id}`,
  UPDATE:           (id) => `${API_BASE_URL}/clients/${id}`,
  DELETE:           (id) => `${API_BASE_URL}/clients/${id}`,
  LOGO:             (id) => `${API_BASE_URL}/clients/${id}/logo`,
  STATS:            (id) => `${API_BASE_URL}/clients/${id}/stats`,
  MAINTENANCE:      (id) => `${API_BASE_URL}/clients/${id}/maintenance`,
  ASSIGN_OWNER:     (id) => `${API_BASE_URL}/clients/${id}/assign-owner`,
};

// ── Product Endpoints ────────────────────
export const PRODUCT_ENDPOINTS = {
  BASE:             `${API_BASE_URL}/products`,
  PUBLIC:           `${API_BASE_URL}/products/public`,
  FEATURED:         `${API_BASE_URL}/products/featured`,
  CATEGORIES:       `${API_BASE_URL}/products/categories`,
  BULK_STATUS:      `${API_BASE_URL}/products/bulk-status`,
  GET_ALL:          `${API_BASE_URL}/products`,
  CREATE:           `${API_BASE_URL}/products`,
  GET_ONE:          (id) => `${API_BASE_URL}/products/${id}`,
  UPDATE:           (id) => `${API_BASE_URL}/products/${id}`,
  DELETE:           (id) => `${API_BASE_URL}/products/${id}`,
  STATUS:           (id) => `${API_BASE_URL}/products/${id}/status`,
  TOGGLE_FEATURED:  (id) => `${API_BASE_URL}/products/${id}/toggle-featured`,
  ADD_IMAGES:       (id) => `${API_BASE_URL}/products/${id}/images`,
  DELETE_IMAGE:     (id, publicId) =>
    `${API_BASE_URL}/products/${id}/images/${publicId}`,
  SET_PRIMARY:      (id, publicId) =>
    `${API_BASE_URL}/products/${id}/images/${publicId}/primary`,
};

// ── Theme Endpoints ──────────────────────
export const THEME_ENDPOINTS = {
  BASE:             `${API_BASE_URL}/themes`,
  ACTIVE:           `${API_BASE_URL}/themes/active`,
  PRESETS:          `${API_BASE_URL}/themes/presets`,
  GET_ALL:          `${API_BASE_URL}/themes`,
  CREATE:           `${API_BASE_URL}/themes`,
  GET_ONE:          (id) => `${API_BASE_URL}/themes/${id}`,
  UPDATE:           (id) => `${API_BASE_URL}/themes/${id}`,
  DELETE:           (id) => `${API_BASE_URL}/themes/${id}`,
  ACTIVATE:         (id) => `${API_BASE_URL}/themes/${id}/activate`,
  APPLY_PRESET:     (id) => `${API_BASE_URL}/themes/${id}/apply-preset`,
  DUPLICATE:        (id) => `${API_BASE_URL}/themes/${id}/duplicate`,
};

// ── Section Endpoints ────────────────────
export const SECTION_ENDPOINTS = {
  BASE:              `${API_BASE_URL}/sections`,
  REORDER:           `${API_BASE_URL}/sections/reorder`,
  PAGE:              (page) => `${API_BASE_URL}/sections/page/${page}`,
  GET_ALL:           `${API_BASE_URL}/sections`,
  CREATE:            `${API_BASE_URL}/sections`,
  GET_ONE:           (id) => `${API_BASE_URL}/sections/${id}`,
  UPDATE:            (id) => `${API_BASE_URL}/sections/${id}`,
  DELETE:            (id) => `${API_BASE_URL}/sections/${id}`,
  UPDATE_DATA:       (id) => `${API_BASE_URL}/sections/${id}/data`,
  TOGGLE_VISIBILITY: (id) => `${API_BASE_URL}/sections/${id}/toggle-visibility`,
  DUPLICATE:         (id) => `${API_BASE_URL}/sections/${id}/duplicate`,
  ADD_ITEM:          (id) => `${API_BASE_URL}/sections/${id}/items`,
  REMOVE_ITEM:       (id, index) =>
    `${API_BASE_URL}/sections/${id}/items/${index}`,
};

// ── Upload Endpoints ─────────────────────
export const UPLOAD_ENDPOINTS = {
  IMAGE:     `${API_BASE_URL}/upload/image`,
  IMAGES:    `${API_BASE_URL}/upload/images`,
  LOGO:      `${API_BASE_URL}/upload/logo`,
  FAVICON:   `${API_BASE_URL}/upload/favicon`,
  AVATAR:    `${API_BASE_URL}/upload/avatar`,
  OG_IMAGE:  `${API_BASE_URL}/upload/og-image`,
  GALLERY:   `${API_BASE_URL}/upload/gallery`,
  SIGNATURE: `${API_BASE_URL}/upload/signature`,
  SECTION:   (sectionId) =>
    `${API_BASE_URL}/upload/section/${sectionId}`,
  DELETE:    (publicId) =>
    `${API_BASE_URL}/upload/${btoa(publicId)}`,
};

// ── Query Keys ───────────────────────────
// Centralized React Query cache keys
// Consistent invalidation across app
export const QUERY_KEYS = {
  // Auth
  ME:              ["auth", "me"],
  USERS:           ["auth", "users"],

  // Client
  CLIENT_CONFIG:   (slug) => ["client", "config", slug],
  CLIENTS:         ["clients"],
  CLIENT:          (id)   => ["client", id],
  CLIENT_STATS:    (id)   => ["client", "stats", id],

  // Products
  PRODUCTS:        (filters) => ["products", filters],
  PUBLIC_PRODUCTS: (slug, filters) => ["products", "public", slug, filters],
  PRODUCT:         (id)   => ["product", id],
  FEATURED:        (slug) => ["products", "featured", slug],
  CATEGORIES:      (slug) => ["products", "categories", slug],

  // Themes
  THEMES:          (clientId) => ["themes", clientId],
  ACTIVE_THEME:    (slug)     => ["theme", "active", slug],
  PRESETS:         ["themes", "presets"],

  // Sections
  SECTIONS:        (clientId) => ["sections", clientId],
  PAGE_SECTIONS:   (slug, page) => ["sections", "page", slug, page],
};

// ── App Routes ───────────────────────────
export const ROUTES = {
  // Website
  HOME:       "/",
  PRODUCTS:   "/products",
  PRODUCT:    (slug) => `/products/${slug}`,
  ABOUT:      "/about",
  CONTACT:    "/contact",

  // Admin
  ADMIN:              "/admin",
  ADMIN_LOGIN:        "/admin/login",
  ADMIN_DASHBOARD:    "/admin/dashboard",
  ADMIN_CLIENTS:      "/admin/clients",
  ADMIN_CLIENT_NEW:   "/admin/clients/new",
  ADMIN_CLIENT_EDIT:  (id) => `/admin/clients/${id}/edit`,
  ADMIN_PRODUCTS:     "/admin/products",
  ADMIN_PRODUCT_NEW:  "/admin/products/new",
  ADMIN_PRODUCT_EDIT: (id) => `/admin/products/${id}/edit`,
  ADMIN_THEMES:       "/admin/themes",
  ADMIN_SECTIONS:     "/admin/sections",
  ADMIN_SETTINGS:     "/admin/settings",
  ADMIN_USERS:        "/admin/users",
};
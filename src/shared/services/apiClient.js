import axios from "axios";
import toast  from "react-hot-toast";
import { API_BASE_URL } from "@constants/api.js";

// ─────────────────────────────────────────
// AXIOS INSTANCE
// Central HTTP client for all API calls
// ─────────────────────────────────────────

const apiClient = axios.create({
  baseURL:         API_BASE_URL,
  timeout:         15000, // 15 seconds
  withCredentials: true,  // Send cookies with every request
  headers: {
    "Content-Type": "application/json",
    "Accept":       "application/json",
  },
});

// ─────────────────────────────────────────
// REQUEST INTERCEPTOR
// Runs before every API request
// ─────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    // ── Add JWT token from localStorage ───
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ── Add client slug header ─────────────
    // Used by backend resolveClient middleware
    const clientSlug = localStorage.getItem("clientSlug");
    if (clientSlug) {
      config.headers["x-client-slug"] = clientSlug;
    }

    // ── Log in development ─────────────────
    if (import.meta.env.DEV) {
      console.log(
        `🌐 API ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Runs after every API response
// ─────────────────────────────────────────

apiClient.interceptors.response.use(
  // ── Success handler ──────────────────────
  (response) => {
    return response.data;
    // Return only data — no need for response.data everywhere
  },

  // ── Error handler ────────────────────────
  (error) => {
    const { response } = error;

    // No response — network error
    if (!response) {
      toast.error(
        "Network error. Please check your internet connection."
      );
      return Promise.reject({
        message: "Network error",
        statusCode: 0,
      });
    }

    const { status, data } = response;

    // ── Handle specific status codes ────────
    switch (status) {
      // Unauthorized — token expired or invalid
      case 401:
        // Clear stored auth data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Don't redirect on login page
        if (!window.location.pathname.includes("/login")) {
          toast.error(
            data?.message || "Session expired. Please login again."
          );

          // Redirect to login after short delay
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 1500);
        }
        break;

      // Forbidden
      case 403:
        toast.error(
          data?.message || "You do not have permission to perform this action."
        );
        break;

      // Not found
      case 404:
        // Don't show toast for 404 — handle in components
        break;

      // Conflict — duplicate
      case 409:
        toast.error(data?.message || "This record already exists.");
        break;

      // Validation error
      case 400:
        // Show first validation error
        if (data?.errors?.length > 0) {
          toast.error(data.errors[0].message);
        } else {
          toast.error(data?.message || "Invalid request data.");
        }
        break;

      // Rate limited
      case 429:
        toast.error(
          "Too many requests. Please slow down and try again."
        );
        break;

      // Server error
      case 500:
        toast.error(
          "Server error. Please try again later."
        );
        break;

      // Maintenance
      case 503:
        toast.error(
          data?.message || "Service temporarily unavailable."
        );
        break;

      default:
        toast.error(data?.message || "Something went wrong.");
    }

    // ── Reject with clean error object ──────
    return Promise.reject({
      message:    data?.message    || "Something went wrong",
      errors:     data?.errors     || [],
      statusCode: status,
    });
  }
);

// ─────────────────────────────────────────
// HELPER — Set client slug globally
// Called when client is resolved
// ─────────────────────────────────────────

export const setClientSlug = (slug) => {
  if (slug) {
    localStorage.setItem("clientSlug", slug);
    apiClient.defaults.headers["x-client-slug"] = slug;
  } else {
    localStorage.removeItem("clientSlug");
    delete apiClient.defaults.headers["x-client-slug"];
  }
};

// ─────────────────────────────────────────
// HELPER — Set auth token globally
// Called after login
// ─────────────────────────────────────────

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("accessToken");
    delete apiClient.defaults.headers.Authorization;
  }
};

// ─────────────────────────────────────────
// HELPER — Clear all auth data
// Called on logout
// ─────────────────────────────────────────

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("clientSlug");
  delete apiClient.defaults.headers.Authorization;
  delete apiClient.defaults.headers["x-client-slug"];
};

export default apiClient;
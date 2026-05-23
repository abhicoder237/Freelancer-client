import apiClient, { setAuthToken, clearAuthData } from "./apiClient.js";
import { AUTH_ENDPOINTS } from "@constants/api.js";

// ─────────────────────────────────────────
// AUTH SERVICE
// All authentication related API calls
// ─────────────────────────────────────────

const authService = {

  // ── Login ────────────────────────────────
  login: async (credentials) => {
    const response = await apiClient.post(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );

    // Save token + user to localStorage
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }

    if (response.data?.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );
    }

    return response;
  },

  // ── Logout ───────────────────────────────
  logout: async () => {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    } finally {
      // Always clear local data even if API fails
      clearAuthData();
    }
  },

  // ── Register ─────────────────────────────
  register: async (userData) => {
    return await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
  },

  // ── Get current user ─────────────────────
  getMe: async () => {
    return await apiClient.get(AUTH_ENDPOINTS.ME);
  },

  // ── Update profile ───────────────────────
  updateProfile: async (data) => {
    return await apiClient.put(AUTH_ENDPOINTS.UPDATE_PROFILE, data);
  },

  // ── Change password ──────────────────────
  changePassword: async (data) => {
    const response = await apiClient.put(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      data
    );
    // Clear auth after password change — must re-login
    clearAuthData();
    return response;
  },

  // ── Get all users (superadmin) ───────────
  getAllUsers: async (params = {}) => {
    return await apiClient.get(AUTH_ENDPOINTS.USERS, { params });
  },

  // ── Toggle user status ───────────────────
  toggleUserStatus: async (userId) => {
    return await apiClient.put(AUTH_ENDPOINTS.TOGGLE_STATUS(userId));
  },

  // ── Get stored user from localStorage ────
  getStoredUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // ── Check if token exists ─────────────────
  isAuthenticated: () => {
    return !!localStorage.getItem("accessToken");
  },
};

export default authService;
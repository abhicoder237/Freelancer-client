import apiClient          from "./apiClient.js";
import { CLIENT_ENDPOINTS } from "@constants/api.js";

// ─────────────────────────────────────────
// CLIENT SERVICE
// All client/tenant related API calls
// ─────────────────────────────────────────

const clientService = {

  // ── Get client config (public) ───────────
  // Main frontend entry — loads theme + info
  getConfig: async (clientSlug) => {
    return await apiClient.get(CLIENT_ENDPOINTS.CONFIG, {
      headers: { "x-client-slug": clientSlug },
    });
  },

  // ── Get all clients (admin) ───────────────
  getAllClients: async (params = {}) => {
    return await apiClient.get(CLIENT_ENDPOINTS.GET_ALL, { params });
  },

  // ── Get single client ─────────────────────
  getClient: async (identifier) => {
    return await apiClient.get(CLIENT_ENDPOINTS.GET_ONE(identifier));
  },

  // ── Create client ─────────────────────────
  createClient: async (data) => {
    return await apiClient.post(CLIENT_ENDPOINTS.CREATE, data);
  },

  // ── Update client ─────────────────────────
  updateClient: async (id, data) => {
    return await apiClient.put(CLIENT_ENDPOINTS.UPDATE(id), data);
  },

  // ── Upload logo ───────────────────────────
  uploadLogo: async (id, file, altText = "") => {
    const formData = new FormData();
    formData.append("image", file);
    if (altText) formData.append("altText", altText);

    return await apiClient.post(CLIENT_ENDPOINTS.LOGO(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── Get client stats ──────────────────────
  getStats: async (id) => {
    return await apiClient.get(CLIENT_ENDPOINTS.STATS(id));
  },

  // ── Toggle maintenance ────────────────────
  toggleMaintenance: async (id, data) => {
    return await apiClient.put(
      CLIENT_ENDPOINTS.MAINTENANCE(id),
      data
    );
  },

  // ── Assign owner ──────────────────────────
  assignOwner: async (clientId, userId) => {
    return await apiClient.put(
      CLIENT_ENDPOINTS.ASSIGN_OWNER(clientId),
      { userId }
    );
  },

  // ── Delete client ─────────────────────────
  deleteClient: async (id) => {
    return await apiClient.delete(CLIENT_ENDPOINTS.DELETE(id));
  },
};

export default clientService;
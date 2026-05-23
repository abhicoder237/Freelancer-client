import apiClient            from "./apiClient.js";
import { SECTION_ENDPOINTS } from "@constants/api.js";

// ─────────────────────────────────────────
// SECTION SERVICE
// ─────────────────────────────────────────

const sectionService = {

  // ── Public ───────────────────────────────
  getPageSections: async (page = "home", clientSlug) => {
    return await apiClient.get(SECTION_ENDPOINTS.PAGE(page), {
      headers: clientSlug
        ? { "x-client-slug": clientSlug }
        : {},
    });
  },

  // ── Admin ────────────────────────────────
  getAllSections: async (params = {}) => {
    return await apiClient.get(SECTION_ENDPOINTS.GET_ALL, { params });
  },

  getSection: async (id) => {
    return await apiClient.get(SECTION_ENDPOINTS.GET_ONE(id));
  },

  createSection: async (data) => {
    return await apiClient.post(SECTION_ENDPOINTS.CREATE, data);
  },

  updateSection: async (id, data) => {
    return await apiClient.put(SECTION_ENDPOINTS.UPDATE(id), data);
  },

  updateSectionData: async (id, dataKey, data) => {
    return await apiClient.put(SECTION_ENDPOINTS.UPDATE_DATA(id), {
      [dataKey]: data,
    });
  },

  toggleVisibility: async (id) => {
    return await apiClient.put(
      SECTION_ENDPOINTS.TOGGLE_VISIBILITY(id)
    );
  },

  reorderSections: async (sections) => {
    return await apiClient.put(SECTION_ENDPOINTS.REORDER, {
      sections,
    });
  },

  duplicateSection: async (id) => {
    return await apiClient.post(SECTION_ENDPOINTS.DUPLICATE(id));
  },

  addItem: async (id, item) => {
    return await apiClient.post(SECTION_ENDPOINTS.ADD_ITEM(id), {
      item,
    });
  },

  removeItem: async (id, index) => {
    return await apiClient.delete(
      SECTION_ENDPOINTS.REMOVE_ITEM(id, index)
    );
  },

  deleteSection: async (id) => {
    return await apiClient.delete(SECTION_ENDPOINTS.DELETE(id));
  },
};

export default sectionService;
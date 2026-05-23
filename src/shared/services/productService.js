import apiClient            from "./apiClient.js";
import { PRODUCT_ENDPOINTS } from "@constants/api.js";

// ─────────────────────────────────────────
// PRODUCT SERVICE
// ─────────────────────────────────────────

const productService = {

  // ── Public — storefront ──────────────────
  getPublicProducts: async (params = {}) => {
    return await apiClient.get(PRODUCT_ENDPOINTS.PUBLIC, { params });
  },

  getFeaturedProducts: async (params = {}) => {
    return await apiClient.get(PRODUCT_ENDPOINTS.FEATURED, { params });
  },

  getCategories: async () => {
    return await apiClient.get(PRODUCT_ENDPOINTS.CATEGORIES);
  },

  getProduct: async (identifier) => {
    return await apiClient.get(PRODUCT_ENDPOINTS.GET_ONE(identifier));
  },

  // ── Admin — product management ───────────
  getAllProducts: async (params = {}) => {
    return await apiClient.get(PRODUCT_ENDPOINTS.GET_ALL, { params });
  },

  createProduct: async (data) => {
    return await apiClient.post(PRODUCT_ENDPOINTS.CREATE, data);
  },

  updateProduct: async (id, data) => {
    return await apiClient.put(PRODUCT_ENDPOINTS.UPDATE(id), data);
  },

  updateStatus: async (id, status) => {
    return await apiClient.put(
      PRODUCT_ENDPOINTS.STATUS(id),
      { status }
    );
  },

  bulkUpdateStatus: async (productIds, status) => {
    return await apiClient.put(PRODUCT_ENDPOINTS.BULK_STATUS, {
      productIds,
      status,
    });
  },

  toggleFeatured: async (id) => {
    return await apiClient.put(PRODUCT_ENDPOINTS.TOGGLE_FEATURED(id));
  },

  deleteProduct: async (id) => {
    return await apiClient.delete(PRODUCT_ENDPOINTS.DELETE(id));
  },

  // ── Image management ──────────────────────
  addImages: async (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    return await apiClient.post(
      PRODUCT_ENDPOINTS.ADD_IMAGES(id),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  deleteImage: async (productId, publicId) => {
    // Encode publicId — contains slashes
    const encodedId = btoa(publicId);
    return await apiClient.delete(
      PRODUCT_ENDPOINTS.DELETE_IMAGE(productId, encodedId)
    );
  },

  setPrimaryImage: async (productId, publicId) => {
    const encodedId = btoa(publicId);
    return await apiClient.put(
      PRODUCT_ENDPOINTS.SET_PRIMARY(productId, encodedId)
    );
  },
};

export default productService;
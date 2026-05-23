import apiClient            from "./apiClient.js";
import { UPLOAD_ENDPOINTS } from "@constants/api.js";

// ─────────────────────────────────────────
// UPLOAD SERVICE
// ─────────────────────────────────────────

const uploadService = {

  // ── Single image ──────────────────────────
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return await apiClient.post(UPLOAD_ENDPOINTS.IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── Multiple images ───────────────────────
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    return await apiClient.post(UPLOAD_ENDPOINTS.IMAGES, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── Logo ──────────────────────────────────
  uploadLogo: async (file, altText = "") => {
    const formData = new FormData();
    formData.append("image", file);
    if (altText) formData.append("altText", altText);

    return await apiClient.post(UPLOAD_ENDPOINTS.LOGO, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── Favicon ───────────────────────────────
  uploadFavicon: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return await apiClient.post(UPLOAD_ENDPOINTS.FAVICON, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── Avatar ────────────────────────────────
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return await apiClient.post(UPLOAD_ENDPOINTS.AVATAR, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── OG Image ─────────────────────────────
  uploadOgImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return await apiClient.post(UPLOAD_ENDPOINTS.OG_IMAGE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── Section image ─────────────────────────
  uploadSectionImage: async (sectionId, file, imageField = "") => {
    const formData = new FormData();
    formData.append("image", file);
    if (imageField) formData.append("imageField", imageField);

    return await apiClient.post(
      UPLOAD_ENDPOINTS.SECTION(sectionId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  // ── Delete image ──────────────────────────
  deleteImage: async (publicId) => {
    const encodedId = btoa(publicId);
    return await apiClient.delete(UPLOAD_ENDPOINTS.DELETE(encodedId));
  },

  // ── Get gallery ───────────────────────────
  getGallery: async (params = {}) => {
    return await apiClient.get(UPLOAD_ENDPOINTS.GALLERY, { params });
  },

  // ── Get signature ─────────────────────────
  getSignature: async (folderType = "general") => {
    return await apiClient.get(UPLOAD_ENDPOINTS.SIGNATURE, {
      params: { folderType },
    });
  },
};

export default uploadService;
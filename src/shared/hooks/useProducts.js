import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast                                      from "react-hot-toast";
import productService                             from "@services/productService.js";
import { QUERY_KEYS }                             from "@constants/api.js";
import { useClient }                              from "@context/ClientContext.jsx";

// ─────────────────────────────────────────
// usePublicProducts — for storefront
// ─────────────────────────────────────────

export const usePublicProducts = (filters = {}) => {
  const { clientSlug } = useClient();

  return useQuery({
    queryKey: QUERY_KEYS.PUBLIC_PRODUCTS(clientSlug, filters),
    queryFn:  () => productService.getPublicProducts(filters),
    enabled:  !!clientSlug,
    keepPreviousData: true, // Smooth pagination
  });
};

// ─────────────────────────────────────────
// useFeaturedProducts — for homepage
// ─────────────────────────────────────────

export const useFeaturedProducts = (limit = 8) => {
  const { clientSlug } = useClient();

  return useQuery({
    queryKey: QUERY_KEYS.FEATURED(clientSlug),
    queryFn:  () => productService.getFeaturedProducts({ limit }),
    enabled:  !!clientSlug,
  });
};

// ─────────────────────────────────────────
// useCategories — for filter sidebar
// ─────────────────────────────────────────

export const useCategories = () => {
  const { clientSlug } = useClient();

  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES(clientSlug),
    queryFn:  productService.getCategories,
    enabled:  !!clientSlug,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// ─────────────────────────────────────────
// useAdminProducts — for admin panel
// ─────────────────────────────────────────

export const useAdminProducts = (filters = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS(filters),
    queryFn:  () => productService.getAllProducts(filters),
    keepPreviousData: true,
  });
};

// ─────────────────────────────────────────
// useProduct — single product
// ─────────────────────────────────────────

export const useProduct = (identifier) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCT(identifier),
    queryFn:  () => productService.getProduct(identifier),
    enabled:  !!identifier,
  });
};

// ─────────────────────────────────────────
// useProductMutations — CRUD operations
// ─────────────────────────────────────────

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  // Create
  const createMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      toast.success("Product created successfully!");
      invalidateProducts();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create product.");
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      invalidateProducts();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update product.");
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      invalidateProducts();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete product.");
    },
  });

  // Toggle featured
  const toggleFeaturedMutation = useMutation({
    mutationFn: productService.toggleFeatured,
    onSuccess: () => {
      invalidateProducts();
    },
  });

  // Update status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => productService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Product status updated!");
      invalidateProducts();
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleFeaturedMutation,
    updateStatusMutation,
  };
};
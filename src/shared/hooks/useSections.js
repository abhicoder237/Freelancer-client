import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast                                      from "react-hot-toast";
import sectionService                             from "@services/sectionService.js";
import { QUERY_KEYS }                             from "@constants/api.js";
import { useClient }                              from "@context/ClientContext.jsx";

// ─────────────────────────────────────────
// usePageSections — for frontend pages
// ─────────────────────────────────────────

export const usePageSections = (page = "home") => {
  const { clientSlug } = useClient();

  return useQuery({
    queryKey: QUERY_KEYS.PAGE_SECTIONS(clientSlug, page),
    queryFn:  () => sectionService.getPageSections(page, clientSlug),
    enabled:  !!clientSlug,
    staleTime: 5 * 60 * 1000,
  });
};

// ─────────────────────────────────────────
// useAdminSections — for admin panel
// ─────────────────────────────────────────

export const useAdminSections = (params = {}) => {
  const { clientId } = useClient();

  return useQuery({
    queryKey: QUERY_KEYS.SECTIONS(clientId),
    queryFn:  () => sectionService.getAllSections(params),
    enabled:  !!clientId,
  });
};

// ─────────────────────────────────────────
// useSectionMutations — CRUD + reorder
// ─────────────────────────────────────────

export const useSectionMutations = () => {
  const queryClient      = useQueryClient();
  const { clientId, clientSlug } = useClient();

  const invalidateSections = () => {
    queryClient.invalidateQueries({ queryKey: ["sections"] });
  };

  // Create
  const createMutation = useMutation({
    mutationFn: sectionService.createSection,
    onSuccess: () => {
      toast.success("Section created successfully!");
      invalidateSections();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create section.");
    },
  });

  // Update base config
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sectionService.updateSection(id, data),
    onSuccess: () => {
      toast.success("Section updated!");
      invalidateSections();
    },
  });

  // Update content data
  const updateDataMutation = useMutation({
    mutationFn: ({ id, dataKey, data }) =>
      sectionService.updateSectionData(id, dataKey, data),
    onSuccess: () => {
      toast.success("Section content updated!");
      invalidateSections();
    },
  });

  // Toggle visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: sectionService.toggleVisibility,
    onSuccess: () => {
      invalidateSections();
    },
  });

  // Reorder
  const reorderMutation = useMutation({
    mutationFn: sectionService.reorderSections,
    onSuccess: () => {
      toast.success("Sections reordered!");
      invalidateSections();
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: sectionService.deleteSection,
    onSuccess: () => {
      toast.success("Section deleted!");
      invalidateSections();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete section.");
    },
  });

  // Duplicate
  const duplicateMutation = useMutation({
    mutationFn: sectionService.duplicateSection,
    onSuccess: () => {
      toast.success("Section duplicated!");
      invalidateSections();
    },
  });

  return {
    createMutation,
    updateMutation,
    updateDataMutation,
    toggleVisibilityMutation,
    reorderMutation,
    deleteMutation,
    duplicateMutation,
  };
};
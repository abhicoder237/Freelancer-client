import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient }         from "@tanstack/react-query";
import themeService                          from "@services/themeService.js";
import { QUERY_KEYS }                        from "@constants/api.js";
import { useClient }                         from "@context/ClientContext.jsx";

// ─────────────────────────────────────────
// useTheme Hook
// Fetches + applies active theme for client
// ─────────────────────────────────────────

const useTheme = () => {
  const { clientSlug, updateTheme } = useClient();
  const queryClient                  = useQueryClient();
  const [isDark, setIsDark]         = useState(false);

  // ── Fetch active theme ───────────────────
  const {
    data:      themeResponse,
    isLoading: isThemeLoading,
    error:     themeError,
    refetch:   refetchTheme,
  } = useQuery({
    queryKey: QUERY_KEYS.ACTIVE_THEME(clientSlug),
    queryFn:  () => themeService.getActiveTheme(clientSlug),
    enabled:  !!clientSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    onSuccess: (response) => {
      if (response?.data) {
        themeService.applyTheme(response.data);
        updateTheme(response.data);
        setIsDark(response.data.darkMode?.enabled || false);
      }
    },
  });

  const theme = themeResponse?.data || null;

  // ── Toggle dark mode ─────────────────────
  const toggleDarkMode = useCallback(() => {
    const newDark = !isDark;
    setIsDark(newDark);

    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // ── Invalidate theme cache ────────────────
  // Call this after theme update in admin
  const invalidateTheme = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.ACTIVE_THEME(clientSlug),
    });
  }, [queryClient, clientSlug]);

  return {
    theme,
    isThemeLoading,
    themeError,
    isDark,
    toggleDarkMode,
    refetchTheme,
    invalidateTheme,
  };
};

export default useTheme;
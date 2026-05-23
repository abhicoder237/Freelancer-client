import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast           from "react-hot-toast";
import authService     from "@services/authService.js";
import { setAuthToken, clearAuthData } from "@services/apiClient.js";
import { ROUTES }      from "@constants/api.js";

// ─────────────────────────────────────────
// CONTEXT CREATION
// ─────────────────────────────────────────

const AuthContext = createContext(null);

// ─────────────────────────────────────────
// AUTH PROVIDER
// ─────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ── State ────────────────────────────────
  const [user,        setUser]        = useState(null);
  const [token,       setToken]       = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isLoggedIn,  setIsLoggedIn]  = useState(false);

  // ─────────────────────────────────────────
  // INITIALIZE AUTH
  // Check localStorage on app start
  // ─────────────────────────────────────────

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser  = authService.getStoredUser();

        if (storedToken && storedUser) {
          // Set token in axios defaults
          setAuthToken(storedToken);
          setToken(storedToken);
          setUser(storedUser);
          setIsLoggedIn(true);

          // Verify token is still valid — fetch fresh user data
          try {
            const response = await authService.getMe();
            if (response.data) {
              setUser(response.data);
              localStorage.setItem("user", JSON.stringify(response.data));
            }
          } catch {
            // Token invalid — clear everything
            handleLogout(false);
          }
        }
      } catch {
        handleLogout(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ─────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────

  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);

      if (response.data) {
        const { user: loggedInUser, token: accessToken } = response.data;

        // Update state
        setUser(loggedInUser);
        setToken(accessToken);
        setIsLoggedIn(true);

        toast.success(`Welcome back, ${loggedInUser.name}! 👋`);

        // Redirect based on role
        if (
          loggedInUser.role === "superadmin" ||
          loggedInUser.role === "admin"
        ) {
          navigate(ROUTES.ADMIN_DASHBOARD);
        } else if (loggedInUser.role === "clientadmin") {
          navigate(ROUTES.ADMIN_DASHBOARD);
        }

        return { success: true, user: loggedInUser };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // ─────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────

  const handleLogout = useCallback(async (showToast = true) => {
    try {
      await authService.logout();
    } catch {
      // Still clear local data even if API fails
    } finally {
      // Clear all state
      setUser(null);
      setToken(null);
      setIsLoggedIn(false);
      clearAuthData();

      if (showToast) {
        toast.success("Logged out successfully.");
      }

      navigate(ROUTES.ADMIN_LOGIN);
    }
  }, [navigate]);

  // ─────────────────────────────────────────
  // UPDATE USER (after profile update)
  // ─────────────────────────────────────────

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  // ─────────────────────────────────────────
  // ROLE HELPERS
  // ─────────────────────────────────────────

  const isSuperAdmin  = user?.role === "superadmin";
  const isAdmin       = user?.role === "admin";
  const isClientAdmin = user?.role === "clientadmin";
  const isAdminOrAbove = isSuperAdmin || isAdmin;

  const hasRole = useCallback((...roles) => {
    return roles.includes(user?.role);
  }, [user]);

  // ─────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────

  const value = {
    // State
    user,
    token,
    isLoading,
    isLoggedIn,

    // Actions
    login,
    logout:     handleLogout,
    updateUser,

    // Role helpers
    isSuperAdmin,
    isAdmin,
    isClientAdmin,
    isAdminOrAbove,
    hasRole,

    // User client ID (for clientadmin)
    userClientId: user?.client?._id || user?.client || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────
// CUSTOM HOOK
// ─────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
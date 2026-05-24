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

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user,       setUser]       = useState(null);
  const [token,      setToken]      = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ─────────────────────────────────────────
  // INITIALIZE AUTH
  // ─────────────────────────────────────────

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser  = authService.getStoredUser();

        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          setToken(storedToken);
          setUser(storedUser);
          setIsLoggedIn(true);

          // Verify token still valid
          try {
            const response = await authService.getMe();
            if (response?.data) {
              setUser(response.data);
              localStorage.setItem(
                "user",
                JSON.stringify(response.data)
              );
            }
          } catch {
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

      if (response?.data) {
        const { user: loggedInUser, token: accessToken } = response.data;

        setUser(loggedInUser);
        setToken(accessToken);
        setIsLoggedIn(true);

        toast.success(`Welcome back, ${loggedInUser.name}! 👋`);

        navigate(ROUTES.ADMIN_DASHBOARD);

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
      // Still clear local data
    } finally {
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
  // UPDATE USER
  // ─────────────────────────────────────────

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  // ─────────────────────────────────────────
  // ROLE HELPERS
  // ─────────────────────────────────────────

  const isSuperAdmin   = user?.role === "superadmin";
  const isAdmin        = user?.role === "admin";
  const isClientAdmin  = user?.role === "clientadmin";
  const isAdminOrAbove = isSuperAdmin || isAdmin;

  const hasRole = useCallback((...roles) => {
    return roles.includes(user?.role);
  }, [user]);

  // ─────────────────────────────────────────
  // GET CLIENT SLUG FROM USER
  // ─────────────────────────────────────────

  const getUserClientSlug = useCallback(() => {
    if (!user?.client) return null;
    if (typeof user.client === "object") {
      return user.client.slug || null;
    }
    return null;
  }, [user]);

  const getUserClientId = useCallback(() => {
    if (!user?.client) return null;
    if (typeof user.client === "object") {
      return user.client._id || user.client.toString();
    }
    return user.client.toString();
  }, [user]);

  // ─────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────

  const value = {
    user,
    token,
    isLoading,
    isLoggedIn,
    login,
    logout:           handleLogout,
    updateUser,
    isSuperAdmin,
    isAdmin,
    isClientAdmin,
    isAdminOrAbove,
    hasRole,
    getUserClientSlug,
    getUserClientId,
    userClientId:     getUserClientId(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
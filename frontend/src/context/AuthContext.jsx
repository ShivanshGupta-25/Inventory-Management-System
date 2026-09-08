import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(true);

  // Restore logged-in user when application starts
  useEffect(() => {
    const restoreUser = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(storedToken);

        setUser(response.user);
        setToken(storedToken);
      } catch (error) {
        console.error("Failed to restore user:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  // Login
  const login = async (credentials) => {
    const response = await loginUser(credentials);

    const receivedToken = response.token;
    const receivedUser = response.user;

    localStorage.setItem("token", receivedToken);
    localStorage.setItem("user", JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);

    return response;
  };

  // Register
  const register = async (userData) => {
    const response = await registerUser(userData);

    const receivedToken = response.token;
    const receivedUser = response.user;

    if (receivedToken) {
      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
    }

    if (receivedUser) {
      localStorage.setItem("user", JSON.stringify(receivedUser));
      setUser(receivedUser);
    }

    return response;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// IMPORTANT: LoginPage.jsx is expecting this export
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};

export default AuthContext;
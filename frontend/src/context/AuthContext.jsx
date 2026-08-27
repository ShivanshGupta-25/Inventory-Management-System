import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "inventory_auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }

    setLoading(false);
  }, []);

  const login = async ({ email, password, role }) => {
    /*
      TEMPORARY FRONTEND AUTHENTICATION

      This will later become:

      API → Backend → Database
                  ↓
             JWT / Session
                  ↓
              User Role
    */

    if (!email || !password || !role) {
      throw new Error("Please complete all fields.");
    }

    const authenticatedUser = {
      id: Date.now(),
      name: email.split("@")[0],
      email,
      role,
    };

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(authenticatedUser)
    );

    setUser(authenticatedUser);

    return authenticatedUser;
  };

  const signup = async ({
    name,
    email,
    password,
    role,
  }) => {
    if (!name || !email || !password || !role) {
      throw new Error("Please complete all fields.");
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      role,
    };

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(newUser)
    );

    setUser(newUser);

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
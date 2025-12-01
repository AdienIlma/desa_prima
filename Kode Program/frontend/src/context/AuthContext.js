import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);

      const userData = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        kabupatenId: decoded.kabupatenId,
        kabupatenName: decoded.kabupatenName,
        kelompokId: decoded.kelompokId,
      };

      setUser(userData);
      return userData;
    } catch (error) {
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "https://backend-desa-prima-dev.student.stis.ac.id/users/auth/login",
        {
          email,
          password,
        }
      );

      if (!res.data.token) throw new Error("Token tidak diterima");

      localStorage.setItem("authToken", res.data.token);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;

      const userData = setUserFromToken(res.data.token);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  };

  // Efek untuk pengecekan saat refresh halaman
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 Starting auth check...");
      const token = localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await axios.get(
          "https://backend-desa-prima-dev.student.stis.ac.id/users/auth/me"
        );

        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          kabupatenId: response.data.user.kabupatenId,
          kelompokId: response.data.user.kelompokId,
          kabupatenName: response.data.user.kabupatenName,
        });
      } catch (error) {
        localStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    return "/?logoutSuccess=true";
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

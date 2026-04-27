import React, { createContext, useState } from "react";
import { API } from "../utils/API";

export const AuthContext = createContext();

const AuthState = ({ children }) => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const [registrar, setRegistrar] = useState(null);
  const [role, setRole] = useState(() => localStorage.getItem("role") || null);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  // ================= GET USER =================
  const getUser = async () => {
    try {
      const token = localStorage.getItem("token");

    

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const { data } = await API.get("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      

      // FIXED: consistent handling
      const userData = data?.data || data?.user || data;

      setUser(userData);
      setIsAuthenticated(true);

      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.log("❌ getUser ERROR:", err.response?.data || err.message);

      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  // ================= GET REGISTRAR =================
  const getRegistrar = async () => {
    try {
      const token = localStorage.getItem("registrarToken");

      if (!token) return;

      const { data } = await API.get("/api/registrar/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const regData = data?.registrar || data;

      setRegistrar(regData);
      setRole("registrar");
      setIsAuthenticated(true);

      localStorage.setItem("registrar", JSON.stringify(regData));
    } catch (error) {
      console.log("❌ registrar ERROR:", error.response?.data || error.message);
      logout();
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    console.log("🔥 LOGOUT CALLED");

    localStorage.removeItem("token");
    localStorage.removeItem("registrarToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setUser(null);
    setRegistrar(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        registrar,
        role,
        isAuthenticated,
        getUser,
        getRegistrar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthState;
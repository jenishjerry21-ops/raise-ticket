import React, { createContext, useContext, useState, useCallback } from "react";
import { login as loginApi, logout as logoutApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = sessionStorage.getItem("smartdesk_admin");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem("smartdesk_token"));

  const login = useCallback(async (email, password) => {
    const data = await loginApi({ email, password });
    sessionStorage.setItem("smartdesk_token", data.token);
    sessionStorage.setItem("smartdesk_admin", JSON.stringify(data.admin || {}));
    setToken(data.token);
    setAdmin(data.admin || {});
    return data;
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setToken(null);
    setAdmin(null);
  }, []);

  const value = {
    admin,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

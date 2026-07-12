import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // True until we've asked the backend whether a session cookie is valid.
  // Consumers (routes) must wait for this before deciding to redirect.
  const [loading, setLoading] = useState(true);

  // On first load, ask the backend who (if anyone) the session cookie
  // belongs to. Nothing about auth is read from or written to
  // localStorage/sessionStorage — the httpOnly cookie is the only source
  // of truth, and only the server can read it.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const res = await api.get("/auth/me");
        if (!cancelled) setUser(res.data?.user || null);
      } catch (err) {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Called on successful login with the backend `user` object.
  // The session token itself lives only in the httpOnly cookie the
  // server just set on the response — the frontend never touches it.
  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // even if the request fails, drop client-side state
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.type === "admin",
    // Prefer the stored name, fall back to the email prefix.
    displayName:
      user?.name?.trim() ||
      (user?.email ? user.email.split("@")[0] : "Guest"),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

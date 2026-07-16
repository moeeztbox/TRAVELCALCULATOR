import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api from "../api/axios";
import {
  SESSION_TIMEOUT_MS,
  SESSION_LAST_ACTIVITY_KEY,
} from "../config/session";

// Real user interaction resets the idle countdown. Throttled below so a
// burst of scroll/keydown events doesn't reschedule the timer dozens of
// times a second.
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"];
const ACTIVITY_THROTTLE_MS = 5000;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // True until we've asked the backend whether a session cookie is valid.
  // Consumers (routes) must wait for this before deciding to redirect.
  const [loading, setLoading] = useState(true);
  // Set when the auto-logout timer (not an explicit user logout) ends the
  // session, so the app can redirect to /login with an explanatory message.
  const [sessionExpired, setSessionExpired] = useState(false);

  const timeoutRef = useRef(null);
  const lastThrottledResetRef = useRef(0);

  const clearAutoLogoutTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Ends the session because the user was idle for SESSION_TIMEOUT_MS (as
  // opposed to a manual logout) — same cleanup as logout(), plus the
  // sessionExpired flag.
  const autoLogout = async () => {
    clearAutoLogoutTimer();
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // proceed with client-side cleanup regardless
    }
    sessionStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
    setUser(null);
    setSessionExpired(true);
  };

  // (Re)starts the idle countdown based on the last recorded activity time.
  const scheduleAutoLogout = (lastActivityMs) => {
    clearAutoLogoutTimer();
    const remaining = SESSION_TIMEOUT_MS - (Date.now() - lastActivityMs);
    if (remaining <= 0) {
      autoLogout();
      return;
    }
    timeoutRef.current = setTimeout(autoLogout, remaining);
  };

  // Records fresh activity and pushes the auto-logout deadline back out.
  // Called on login/session-restore, and by the live activity listener below.
  const registerActivity = () => {
    const now = Date.now();
    sessionStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(now));
    scheduleAutoLogout(now);
  };

  // On first load, ask the backend who (if anyone) the session cookie
  // belongs to. Nothing about auth is read from or written to localStorage
  // — the httpOnly cookie is the only source of truth for identity, and
  // only the server can read it. sessionStorage is used solely as a local
  // idle-timer marker (see SESSION_LAST_ACTIVITY_KEY above), never identity.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const res = await api.get("/auth/me");
        const restoredUser = res.data?.user || null;
        if (!cancelled) setUser(restoredUser);

        // Loading the page counts as activity — resets the idle window.
        if (restoredUser) registerActivity();
      } catch (err) {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
      clearAutoLogoutTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While logged in, any real interaction resets the idle countdown.
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastThrottledResetRef.current < ACTIVITY_THROTTLE_MS) return;
      lastThrottledResetRef.current = now;
      registerActivity();
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );
    return () => {
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, handleActivity)
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Called on successful login with the backend `user` object.
  // The session token itself lives only in the httpOnly cookie the
  // server just set on the response — the frontend never touches it.
  const login = (userData) => {
    setSessionExpired(false);
    setUser(userData);
    registerActivity();
  };

  const logout = async () => {
    clearAutoLogoutTimer();
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // even if the request fails, drop client-side state
    }
    sessionStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
    setUser(null);
  };

  const clearSessionExpired = () => setSessionExpired(false);

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
    sessionExpired,
    clearSessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

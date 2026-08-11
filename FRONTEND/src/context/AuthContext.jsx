import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api, { setUnauthorizedHandler } from "../api/axios";
import {
  SESSION_TIMEOUT_MS,
  SESSION_LAST_ACTIVITY_KEY,
  getLastActivityMs,
  isSessionExpired,
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
  // Guards against overlapping calls — e.g. several protected requests
  // in flight (like NormalPackage's parallel hotel/visa/flight/transport
  // fetches) can all 401 back-to-back and each try to trigger this.
  const loggingOutRef = useRef(false);

  const clearAutoLogoutTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Ends the session — because the idle timer expired (possibly caught up
  // late via the revalidation effect below), or because the backend itself
  // rejected a request with 401 (expired/invalid/missing token, reported
  // via the axios interceptor). Same cleanup as logout(), plus the
  // sessionExpired flag so the app redirects to /login with an explanation.
  const autoLogout = async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    clearAutoLogoutTimer();
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // proceed with client-side cleanup regardless
    }
    sessionStorage.removeItem(SESSION_LAST_ACTIVITY_KEY);
    setUser(null);
    setSessionExpired(true);
    loggingOutRef.current = false;
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

        if (restoredUser) {
          // The backend session cookie/JWT can easily outlive the much
          // shorter frontend inactivity window (SESSION_TIMEOUT_MS), so a
          // valid cookie alone doesn't mean the idle session is still
          // valid. A page load/refresh must NOT silently resurrect an
          // already-expired session just because the tab happened to
          // reload — that would let re-entering a protected URL (which is
          // a full navigation, not an SPA transition) or a plain refresh
          // bypass the inactivity timeout entirely.
          if (isSessionExpired()) {
            await autoLogout();
          } else {
            if (!cancelled) setUser(restoredUser);
            // Loading the page while still within the idle window counts
            // as activity — resets the countdown.
            registerActivity();
          }
        } else if (!cancelled) {
          setUser(null);
        }
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

  // The scheduled auto-logout `setTimeout` can be delayed or effectively
  // frozen by the browser while the page is hidden/backgrounded — most
  // notably while a native `window.print()` dialog is open, but the same
  // applies to a minimized window, a backgrounded tab, or the device
  // sleeping. None of those pause the real inactivity clock, so relying on
  // the timer callback alone to fire at the right wall-clock moment isn't
  // reliable. Whenever the page becomes visible/focused again (or the print
  // dialog closes), re-derive elapsed idle time from the absolute
  // `lastActivityMs` timestamp in sessionStorage and act on that directly —
  // logging out immediately if it's already past due, or just re-arming the
  // timer against the correct remaining time otherwise. This never counts
  // as activity itself (it doesn't touch the stored timestamp), so opening
  // or closing the print dialog can't reset or extend the countdown.
  useEffect(() => {
    if (!user) return;

    const revalidateSession = () => {
      const lastActivityMs = getLastActivityMs();
      if (lastActivityMs === null) return;

      if (Date.now() - lastActivityMs >= SESSION_TIMEOUT_MS) {
        autoLogout();
      } else {
        // Re-arm against the same stored timestamp — a delayed/throttled
        // timer is corrected, but this is not treated as new activity.
        scheduleAutoLogout(lastActivityMs);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") revalidateSession();
    };

    window.addEventListener("focus", revalidateSession);
    window.addEventListener("afterprint", revalidateSession);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", revalidateSession);
      window.removeEventListener("afterprint", revalidateSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // The backend is the real authority on session validity, not this
  // context's local `user` state or the inactivity timer. Any protected API
  // call that comes back 401 (missing/invalid/expired JWT — see the axios
  // interceptor in api/axios.js) means the server has already rejected the
  // session, so we react the same way as an idle timeout: clear local auth
  // state and let App.jsx's sessionExpired effect redirect to /login. This
  // is what stops a print dialog (or a backgrounded tab, tampered frontend
  // state, or a token that simply outlived the browser session) from being
  // able to keep using a session the backend no longer considers valid.
  useEffect(() => {
    setUnauthorizedHandler(autoLogout);
    return () => setUnauthorizedHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // Exposed for PrivateRoute: a synchronous, side-effect-free check
    // (safe to call during render) plus the same autoLogout flow used
    // everywhere else, aliased here for call-site clarity.
    isSessionExpired,
    expireSession: autoLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

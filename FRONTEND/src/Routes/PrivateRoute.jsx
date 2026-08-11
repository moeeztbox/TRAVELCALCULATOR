import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guards every protected route. Being authenticated (a valid session
// cookie) is necessary but not sufficient — the frontend inactivity window
// can expire while `isAuthenticated` is still stale-true, e.g. before the
// setTimeout or the focus/afterprint/visibilitychange listeners have had a
// chance to fire. `isSessionExpired()` re-derives the real elapsed idle
// time from the absolute last-activity timestamp on every render —
// including a fresh mount caused by navigating (via sidebar, back/forward,
// or a manually typed URL) to a *different* protected route — so an
// already-expired session can never render a protected page. Re-entering
// the exact same URL, or a plain refresh, is a full page load rather than
// an in-app navigation; that case is instead caught by AuthContext's own
// restore-on-load check, which applies the same rule before ever setting
// `user`.
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, isSessionExpired, expireSession } =
    useAuth();
  const location = useLocation();

  // Synchronous, side-effect-free (just a sessionStorage + Date.now()
  // read) — safe to call directly during render, not only inside effects.
  const expired = isAuthenticated && isSessionExpired();

  useEffect(() => {
    if (expired) expireSession();
  }, [expired, expireSession, location.pathname]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  // Expired: never render the protected page. expireSession() (above)
  // flips `sessionExpired`, which App.jsx's existing effect turns into a
  // redirect to /login with the "logged out due to inactivity" message.
  if (expired) return null;

  return children;
};

export default PrivateRoute;

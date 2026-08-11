// Single source of truth for client-side session behavior.
//
// SESSION_TIMEOUT_MS controls how long a user can stay IDLE (no clicks, key
// presses, scrolling, or navigation) before being automatically logged out.
// Any real interaction resets the countdown, so active use is never
// interrupted — only genuine inactivity triggers the logout. Change this
// ONE value to adjust the timeout everywhere it's used.
//
// Currently set to 5 minutes for testing. For production, e.g.:
//   export const SESSION_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 hours
export const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// sessionStorage key used to persist the last-activity timestamp, so a page
// refresh (itself treated as activity) doesn't lose track of the idle
// countdown. sessionStorage is cleared when the browser/tab is fully closed.
export const SESSION_LAST_ACTIVITY_KEY = "albq_last_activity";

// The absolute last-activity timestamp is the single source of truth for
// idle time — never a running JavaScript timer, which can be delayed,
// throttled, or simply never fire at all (a backgrounded tab, a native
// print dialog, the device sleeping). Reads sessionStorage directly rather
// than any component state, so it's safe to call synchronously from
// anywhere — including mid-render (PrivateRoute), not just inside effects.
export const getLastActivityMs = () => {
  const stored = sessionStorage.getItem(SESSION_LAST_ACTIVITY_KEY);
  const n = stored ? Number(stored) : NaN;
  return Number.isFinite(n) ? n : null;
};

// The one centralized answer to "is the inactivity session still valid?" —
// used by AuthContext (on load/refresh and on focus/afterprint/
// visibilitychange) and by PrivateRoute (on every route render). No stored
// marker at all means there's nothing to judge staleness against (treated
// as not-expired) — every code path that sets a logged-in user also calls
// registerActivity() in the same breath, so an authenticated session
// missing this marker shouldn't occur in practice; this is just the safe
// default for that edge case, not a bypass.
export const isSessionExpired = () => {
  const lastActivityMs = getLastActivityMs();
  if (lastActivityMs === null) return false;
  return Date.now() - lastActivityMs >= SESSION_TIMEOUT_MS;
};

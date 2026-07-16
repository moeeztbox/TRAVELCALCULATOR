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

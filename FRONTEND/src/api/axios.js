import axios from "axios";

// Shared axios instance. `withCredentials` is required so the browser sends
// and stores the httpOnly session cookie set by the backend on login —
// this is what replaces localStorage for auth state.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Bridge to AuthContext (registered once, on mount — see AuthContext.jsx).
// The backend is the real authority on whether a session is still valid: if
// any protected request comes back 401 (missing/invalid/expired token),
// that means the server has already rejected the session — regardless of
// what the frontend's own inactivity timer thinks. This reacts to that by
// clearing local auth state and sending the user to /login, instead of
// leaving the UI silently showing "still logged in" while requests quietly
// fail underneath it.
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    // A failed login attempt (bad credentials) is also a 401, but it isn't
    // an expired session — the login form handles that error itself, and
    // treating it as a session timeout would misfire "logged out due to
    // inactivity" on a plain wrong-password attempt.
    const isLoginRequest = url.includes("/auth/login");
    if (status === 401 && !isLoginRequest && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";

// Shared axios instance. `withCredentials` is required so the browser sends
// and stores the httpOnly session cookie set by the backend on login —
// this is what replaces localStorage for auth state.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export default api;

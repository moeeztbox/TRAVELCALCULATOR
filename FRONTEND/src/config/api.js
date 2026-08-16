// Single source of truth for the backend API's base URL.
//
// Local development: no .env file is required — this falls back to the
// local Express dev server on port 5000.
//
// Production (Vercel): set VITE_API_URL in the Vercel project's
// Environment Variables to the deployed Render backend, including the
// /api suffix, e.g. https://your-backend.onrender.com/api
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

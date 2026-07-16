// controllers/authController.js
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

// No maxAge/expires is set here on purpose — this makes the auth cookie a
// browser "session cookie", which the browser (or Electron's underlying
// Chromium session) discards when it is fully closed. Combined with the
// JWT's own expiresIn below, this gives two layers of expiry: the cookie
// dies with the browser session, and the token itself has a hard expiry
// even if the cookie somehow persisted.
const cookieOptions = () => ({
  httpOnly: true, // not readable from JS — protects against XSS token theft
  secure: isProd, // HTTPS only in production
  sameSite: "lax",
  path: "/",
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * On success, sets an httpOnly session cookie so the frontend never has to
 * hold the token itself (no localStorage/sessionStorage involved).
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isAdmin = user.type === "admin";
    const secret = isAdmin ? process.env.JWT_SECRET_ADMIN : process.env.JWT_SECRET_USER;
    const expiresIn = isAdmin ? (process.env.JWT_EXPIRES_ADMIN || "7d") : (process.env.JWT_EXPIRES_USER || "1d");

    const payload = {
      id: user._id,
      email: user.email,
      type: user.type,
      name: user.name,
    };

    const token = jwt.sign(payload, secret, { expiresIn });

    res.cookie("token", token, cookieOptions());

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently logged-in user (from the session cookie), if any.
 * Used by the frontend on page load to restore auth state without
 * storing anything in localStorage.
 */
export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(200).json({ success: true, user: null });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      type: req.user.type,
    },
  });
};

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export const logoutUser = (req, res) => {
  res.clearCookie("token", cookieOptions());
  return res.json({ success: true, message: "Logged out" });
};

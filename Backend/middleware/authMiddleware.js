// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Try to verify token using admin secret, then user secret.
 * Reads the token from the httpOnly cookie first, falling back to the
 * Authorization header for non-browser clients.
 * If verified, attach decoded payload to req.user and call next().
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = req.cookies?.token || headerToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Try admin secret first
    const adminSecret = process.env.JWT_SECRET_ADMIN;
    const userSecret = process.env.JWT_SECRET_USER;

    let decoded = null;

    if (adminSecret) {
      try {
        decoded = jwt.verify(token, adminSecret);
      } catch (e) {
        // ignore and try user secret
      }
    }

    if (!decoded && userSecret) {
      try {
        decoded = jwt.verify(token, userSecret);
      } catch (e) {
        // ignore
      }
    }

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    // Attach to request
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Same as verifyToken, but never fails the request — used for routes that
 * want to know "who's logged in, if anyone" (e.g. GET /api/auth/me).
 * Sets req.user when a valid token is present, otherwise leaves it undefined.
 */
export const verifyTokenOptional = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const headerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = req.cookies?.token || headerToken;
  if (!token) return next();

  const adminSecret = process.env.JWT_SECRET_ADMIN;
  const userSecret = process.env.JWT_SECRET_USER;

  let decoded = null;
  if (adminSecret) {
    try {
      decoded = jwt.verify(token, adminSecret);
    } catch (e) {
      // ignore
    }
  }
  if (!decoded && userSecret) {
    try {
      decoded = jwt.verify(token, userSecret);
    } catch (e) {
      // ignore
    }
  }

  if (decoded) req.user = decoded;
  next();
};

/**
 * Require that the authenticated user is an admin.
 * Use after verifyToken.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  if (req.user.type !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

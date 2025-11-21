// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Try to verify token using admin secret, then user secret.
 * If verified, attach decoded payload to req.user and call next().
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

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

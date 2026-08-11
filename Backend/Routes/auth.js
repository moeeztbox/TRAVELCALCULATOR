// routes/auth.js
import express from "express";
import { loginUser, getMe, logoutUser } from "../Controllers/authController.js";
import { verifyTokenOptional } from "../middleware/authMiddleware.js";
import { loginRateLimiter } from "../middleware/loginRateLimiter.js";

const router = express.Router();

// POST /api/auth/login (public route, sets httpOnly session cookie).
// IP rate limiting runs first (cheap, no DB hit) as an outer guard; the
// per-account progressive lockout inside loginUser is the primary defense.
router.post("/login", loginRateLimiter, loginUser);

// GET /api/auth/me — restore session on page load
router.get("/me", verifyTokenOptional, getMe);

// POST /api/auth/logout — clears the session cookie
router.post("/logout", logoutUser);

export default router;

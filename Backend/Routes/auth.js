// routes/auth.js
import express from "express";
import { loginUser, getMe, logoutUser } from "../Controllers/authController.js";
import { verifyTokenOptional } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/login (public route, sets httpOnly session cookie)
router.post("/login", loginUser);

// GET /api/auth/me — restore session on page load
router.get("/me", verifyTokenOptional, getMe);

// POST /api/auth/logout — clears the session cookie
router.post("/logout", logoutUser);

export default router;

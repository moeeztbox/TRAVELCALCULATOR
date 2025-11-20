// routes/auth.js
import express from "express";
import { loginUser } from "../Controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // imported for future use

const router = express.Router();

// POST /api/auth/login (public route)
router.post("/login", loginUser);

// Example protected route (optional)
// router.get("/profile", verifyToken, (req, res) => {
//   res.json({ success: true, user: req.user });
// });

export default router;

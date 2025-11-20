// routes/hotel.js
import express from "express";
import {
  createHotel,
  getHotels,
  updateHotel,
  deleteHotel,
} from "../Controllers/hotel.js";

import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route: anyone logged in (optional: can keep it public if needed)
router.get("/hotel", verifyToken, getHotels); // Read all hotels

// Admin-only routes
router.post("/hotel", verifyToken, requireAdmin, createHotel);        // Create hotel
router.put("/hotel/:id", verifyToken, requireAdmin, updateHotel);     // Update hotel
router.delete("/hotel/:id", verifyToken, requireAdmin, deleteHotel);  // Delete hotel

export default router;

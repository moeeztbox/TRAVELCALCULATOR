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

// CRUD Routes
router.post("/hotels", createHotel);        // Create
router.get("/hotels", getHotels);           // Read
router.put("/hotels/:id", updateHotel);     // Update
router.delete("/hotels/:id", deleteHotel);  // Delete

export default router;

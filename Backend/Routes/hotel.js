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

// CRUD Routes — reading requires any valid session; mutating requires admin.
router.post("/hotels", verifyToken, requireAdmin, createHotel);        // Create
router.get("/hotels", verifyToken, getHotels);                         // Read
router.put("/hotels/:id", verifyToken, requireAdmin, updateHotel);     // Update
router.delete("/hotels/:id", verifyToken, requireAdmin, deleteHotel);  // Delete

export default router;

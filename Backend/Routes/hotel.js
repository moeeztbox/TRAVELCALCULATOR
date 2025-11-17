// routes/hotel.js
import express from "express";
import {
  createHotel,
  getHotels,
  updateHotel,
  deleteHotel,
} from "../Controllers/hotel.js";

const router = express.Router();

// CRUD Routes
router.post("/hotel", createHotel);        // Create
router.get("/hotel", getHotels);           // Read
router.put("/hotel/:id", updateHotel);     // Update
router.delete("/hotel/:id", deleteHotel);  // Delete

export default router;

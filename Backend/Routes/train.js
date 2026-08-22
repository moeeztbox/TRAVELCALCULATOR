import express from "express";
import {
  createTrain,
  getTrains,
  updateTrain,
  deleteTrain,
} from "../Controllers/train.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD Routes — reading requires any valid session; mutating requires admin.
router.post("/trains", verifyToken, requireAdmin, createTrain);        // Create
router.get("/trains", verifyToken, getTrains);                         // Read
router.put("/trains/:id", verifyToken, requireAdmin, updateTrain);     // Update
router.delete("/trains/:id", verifyToken, requireAdmin, deleteTrain);  // Delete

export default router;

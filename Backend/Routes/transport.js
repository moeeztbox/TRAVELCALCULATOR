import express from "express";
import {
  createTransport,
  getTransports,
  updateTransport,
  deleteTransport,
} from "../Controllers/transport.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD Routes — reading requires any valid session; mutating requires admin.
router.post("/transports", verifyToken, requireAdmin, createTransport);        // Create
router.get("/transports", verifyToken, getTransports);                         // Read
router.put("/transports/:id", verifyToken, requireAdmin, updateTransport);     // Update
router.delete("/transports/:id", verifyToken, requireAdmin, deleteTransport);  // Delete

export default router;

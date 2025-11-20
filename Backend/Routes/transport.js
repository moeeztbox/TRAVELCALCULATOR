import express from "express";
import {
  createTransport,
  getTransports,
  updateTransport,
  deleteTransport,
} from "../Controllers/transport.js";

const router = express.Router();

// CRUD Routes
router.post("/transports", createTransport);        // Create
router.get("/transports", getTransports);           // Read
router.put("/transports/:id", updateTransport);     // Update
router.delete("/transports/:id", deleteTransport);  // Delete

export default router;

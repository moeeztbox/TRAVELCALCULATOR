// routes/package.js
import express from "express";
import {
  createPackage,
  getPackages,
  updatePackage,
  deletePackage,
} from "../Controllers/package.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD Routes — reading requires any valid session; mutating requires admin.
router.post("/packages", verifyToken, requireAdmin, createPackage); // Create
router.get("/packages", verifyToken, getPackages); // Read
router.put("/packages/:id", verifyToken, requireAdmin, updatePackage); // Update
router.delete("/packages/:id", verifyToken, requireAdmin, deletePackage); // Delete

export default router;

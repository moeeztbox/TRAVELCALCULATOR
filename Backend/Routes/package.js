// routes/package.js
import express from "express";
import {
  createPackage,
  getPackages,
  updatePackage,
  deletePackage,
} from "../Controllers/package.js";

const router = express.Router();

// CRUD Routes
router.post("/packages", createPackage); // Create
router.get("/packages", getPackages); // Read
router.put("/packages/:id", updatePackage); // Update
router.delete("/packages/:id", deletePackage); // Delete

export default router;

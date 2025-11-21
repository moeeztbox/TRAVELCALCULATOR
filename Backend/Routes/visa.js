// routes/visa.js
import express from "express";
import { createVisa, getVisas, updateVisa, deleteVisa } from "../Controllers/visa.js";

import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD Routes
router.post("/visas", createVisa);        // Create
router.get("/visas", getVisas);           // Read
router.put("/visas/:id", updateVisa);     // Update
router.delete("/visas/:id", deleteVisa);  // Delete

export default router;

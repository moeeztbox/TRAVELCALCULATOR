// routes/visa.js
import express from "express";
import { createVisa, getVisas, updateVisa, deleteVisa } from "../Controllers/visa.js";

import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD Routes — reading requires any valid session; mutating requires admin.
router.post("/visas", verifyToken, requireAdmin, createVisa);        // Create
router.get("/visas", verifyToken, getVisas);                         // Read
router.put("/visas/:id", verifyToken, requireAdmin, updateVisa);     // Update
router.delete("/visas/:id", verifyToken, requireAdmin, deleteVisa);  // Delete

export default router;

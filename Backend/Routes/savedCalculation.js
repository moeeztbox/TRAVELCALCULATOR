import express from "express";
import {
  createSavedCalculation,
  getSavedCalculations,
  updateSavedCalculation,
  deleteSavedCalculation,
} from "../Controllers/savedCalculation.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Any authenticated user can save/read their own calculator output — this
// is user-generated history, not master pricing data. Editing/deleting
// saved records is restricted to admins, matching every other mutating
// action in this app.
router.post("/saved-calculations", verifyToken, createSavedCalculation);
router.get("/saved-calculations", verifyToken, getSavedCalculations);
router.put("/saved-calculations/:id", verifyToken, requireAdmin, updateSavedCalculation);
router.delete("/saved-calculations/:id", verifyToken, requireAdmin, deleteSavedCalculation);

export default router;

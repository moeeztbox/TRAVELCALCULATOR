import express from "express";
import { createTicket, getTickets, updateTicket, deleteTicket } from "../Controllers/ticket.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Reading requires any valid session; mutating requires admin.
router.post("/tickets", verifyToken, requireAdmin, createTicket);
router.get("/tickets", verifyToken, getTickets);
router.put("/tickets/:id", verifyToken, requireAdmin, updateTicket);
router.delete("/tickets/:id", verifyToken, requireAdmin, deleteTicket);

export default router;

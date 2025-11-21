import express from "express";
import { createTicket, getTickets, updateTicket, deleteTicket } from "../Controllers/ticket.js";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/tickets", createTicket);
router.get("/tickets", getTickets);
router.put("/tickets/:id", updateTicket);
router.delete("/tickets/:id", deleteTicket);

export default router;

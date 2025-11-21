import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    airlineName: { type: String, required: true, trim: true },
    category: { type: String, enum: ["Group Ticket", "System Ticket"], required: true, trim: true },
    passenger: { type: String, enum: ["adult", "infant", "child"], required: true },
    weight: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    agentName: { type: String, required: true, trim: true },
    agentCost: { type: Number, required: true, min: 0 },
    companyCost: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;

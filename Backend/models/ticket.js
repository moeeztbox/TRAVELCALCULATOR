import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    airlineName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Group Ticket", "System Ticket"],
      required: true,
      trim: true,
    },
    passenger: {
      type: String,
      enum: ["adult", "infant", "child"],
      required: true,
    },
    // Departure and arrival/return baggage allowances are tracked
    // separately since they're commonly different on Umrah/Hajj itineraries.
    departureLuggage: { type: Number, required: true, min: 0 },
    departureBags: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Departure Bags must be a whole number",
      },
    },
    arrivalLuggage: { type: Number, required: true, min: 0 },
    arrivalBags: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Arrival Bags must be a whole number",
      },
    },
    price: { type: Number, required: true, min: 0 },
    agentName: { type: String, required: true, trim: true },
    // Date fields for validity period
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Removed: notes field
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;

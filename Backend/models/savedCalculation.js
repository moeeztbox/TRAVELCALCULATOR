// models/savedCalculation.js
// One reusable "Saved History" record for every calculator type (Hotel,
// Transport, Visa, Flight, Train Ticket, Customize Package). Each save
// stores a full, self-contained snapshot of whatever that page's `result`
// object looked like at the moment of saving — so if a master Hotel/Visa/
// Transport/Ticket price changes later, previously saved calculations keep
// showing exactly what the client was actually quoted.
import mongoose from "mongoose";

const savedCalculationSchema = new mongoose.Schema(
  {
    // Permanent, globally unique, sequential reference — e.g. "TRV-000001".
    // Generated once at creation time (see utils/referenceNumber.js) and
    // never reassigned, even if the record is later edited or another
    // record is deleted.
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Which calculator this save came from — drives which History tab it
    // appears under.
    type: {
      type: String,
      enum: ["hotel", "transport", "visa", "flight", "trainTicket", "package"],
      required: true,
    },
    // "Client Name" for Hotel/Transport/Visa/Flight/Train Ticket saves, or
    // "Package Title" for Customize Package saves — same field either way.
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    // The complete calculation snapshot exactly as computed by the
    // originating page (every input the calculation used plus every
    // computed/final figure) — never re-derived from live master data, so
    // it can never silently drift if a Hotel/Visa/Transport/Ticket price
    // changes after the fact.
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // A single number pulled out of `snapshot` at save time, purely so the
    // History list can show a "Total" column without re-parsing the
    // snapshot on every render.
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Every History tab lists one `type`, newest first.
savedCalculationSchema.index({ type: 1, createdAt: -1 });

const SavedCalculation = mongoose.model("SavedCalculation", savedCalculationSchema);

export default SavedCalculation;

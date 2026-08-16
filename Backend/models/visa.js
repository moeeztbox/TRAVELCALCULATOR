import mongoose from "mongoose";

const VisaSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Adult", "Child", "Infant"],
      required: true,
      trim: true,
    },
    agentName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Hotel BRN / Food BRN are optional add-ons — not every visa includes
    // them. The `*Price` fields are only required when their own checkbox
    // is true, and are cleared to null otherwise so a stale price from a
    // previously-checked state can never linger.
    hotelBRN: {
      type: Boolean,
      default: false,
    },
    hotelBRNPrice: {
      type: Number,
      min: 0,
      default: null,
      required: [
        function () {
          return this.hotelBRN === true;
        },
        "Hotel BRN price is required when Hotel BRN is enabled",
      ],
    },
    foodBRN: {
      type: Boolean,
      default: false,
    },
    foodBRNPrice: {
      type: Number,
      min: 0,
      default: null,
      required: [
        function () {
          return this.foodBRN === true;
        },
        "Food BRN price is required when Food BRN is enabled",
      ],
    },
    // optional: reference to a user/agent who created the record
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // REMOVED: notes field
  },
  { timestamps: true }
);

const Visa = mongoose.model("Visa", VisaSchema);
export default Visa;

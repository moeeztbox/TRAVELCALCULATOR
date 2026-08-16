import mongoose from "mongoose";

const transportSchema = new mongoose.Schema(
  {
    carType: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: String,
      required: true,
      trim: true,
    },
    route: {
      type: String,
      required: true,
      trim: true,
    },
    tripType: {
      type: String,
      enum: ["oneway", "roundtrip"],
      default: "oneway",
      required: true,
    },
    agentName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // Checked-in luggage allowance for this transport option, in bags
    // (number of bags), not weight.
    luggage: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const Transport = mongoose.model("Transport", transportSchema);

export default Transport;

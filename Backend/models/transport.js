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
    agentCost: {
      type: Number,
      required: true,
    },
    companyCost: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Transport = mongoose.model("Transport", transportSchema);

export default Transport;

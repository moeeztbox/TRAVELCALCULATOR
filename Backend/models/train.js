import mongoose from "mongoose";

const trainSchema = new mongoose.Schema(
  {
    trainName: {
      type: String,
      required: true,
      trim: true,
    },
    route: {
      type: String,
      required: true,
      trim: true,
    },
    departure: {
      type: String,
      required: true,
      trim: true,
    },
    arrival: {
      type: String,
      required: true,
      trim: true,
    },
    trainClass: {
      type: String,
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
  },
  { timestamps: true }
);

const Train = mongoose.model("Train", trainSchema);

export default Train;

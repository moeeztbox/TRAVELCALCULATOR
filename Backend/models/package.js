// models/package.js
import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    // Basic Information
    packageName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    totalNights: {
      type: Number,
      required: true,
    },

    // Agent Information
    agentName: {
      type: String,
      trim: true,
      default: "",
    },
    agentCost: {
      type: Number,
      default: 0,
    },
    companyCost: {
      type: Number,
      default: 0,
    },

    // Hotel Details - Makkah
    makkahHotelName: {
      type: String,
      trim: true,
      default: "",
    },
    makkahDistance: {
      type: String,
      trim: true,
      default: "",
    },

    // Hotel Details - Madinah
    madinahHotelName: {
      type: String,
      trim: true,
      default: "",
    },
    madinahDistance: {
      type: String,
      trim: true,
      default: "",
    },

    // Package Details (Included flags stored as Yes/No strings)
    visaIncluded: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    flightIncluded: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    transportIncluded: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },

    // Ziyarat — free text (Included / Not Included / custom)
    ziyarat: {
      type: String,
      trim: true,
      default: "",
    },

    // Description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);

export default Package;

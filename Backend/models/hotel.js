//hotel name , price 
// models/hotel.js
import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["5-star", "4-star", "3-star", "2-star", "1-star"],
      required: true,
    },
    roomType: {
      type: String,
      enum: ["sharing", "quad", "double", "single"],
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

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;

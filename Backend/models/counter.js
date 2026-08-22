// models/counter.js
// Generic atomic-sequence counter (MongoDB's standard auto-increment
// pattern, since Mongoose/Mongo has no native auto-increment). Each
// document's _id is the sequence's name (e.g. "savedCalculation"), so this
// collection can back more than one counter if ever needed.
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;

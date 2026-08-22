// utils/referenceNumber.js
import Counter from "../models/counter.js";

// Generates the next globally unique, permanent, sequential reference
// number — "TRV-000001", "TRV-000002", ... — for a new saved calculation.
// Atomic via a single findOneAndUpdate($inc) on a dedicated counter
// document, so concurrent saves can never race to the same number, and a
// number is never reused even if the record that used it is later deleted.
export const getNextReferenceNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "savedCalculation" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TRV-${String(counter.seq).padStart(6, "0")}`;
};

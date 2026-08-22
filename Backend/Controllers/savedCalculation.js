import SavedCalculation from "../models/savedCalculation.js";
import { getNextReferenceNumber } from "../utils/referenceNumber.js";

const VALID_TYPES = ["hotel", "transport", "visa", "flight", "trainTicket", "package"];

// ➤ CREATE — save a calculation to history. Any authenticated user can
// save their own calculator output (this isn't master pricing data), same
// as any other logged-in action in the app.
export const createSavedCalculation = async (req, res) => {
  try {
    const { type, clientName, snapshot, total } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid history type" });
    }
    if (!clientName || !String(clientName).trim()) {
      return res.status(400).json({ success: false, message: "Client name is required" });
    }
    if (snapshot == null || typeof snapshot !== "object") {
      return res.status(400).json({ success: false, message: "A calculation snapshot is required" });
    }
    const totalNum = Number(total);
    if (!Number.isFinite(totalNum) || totalNum < 0) {
      return res.status(400).json({ success: false, message: "A valid total is required" });
    }

    const referenceNumber = await getNextReferenceNumber();

    const saved = await SavedCalculation.create({
      referenceNumber,
      type,
      clientName: String(clientName).trim(),
      snapshot,
      total: totalNum,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Saved to history",
      data: saved,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ READ — list saved calculations, optionally filtered by ?type=
export const getSavedCalculations = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid history type" });
      }
      filter.type = type;
    }

    const records = await SavedCalculation.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ UPDATE — Client Name only. Every other field (total, snapshot,
// referenceNumber, type) is permanent once a calculation is saved — prices,
// calculations, and package details are never editable, only the client's
// name can be corrected (e.g. a typo). Any other field in the request body
// is silently ignored rather than applied.
export const updateSavedCalculation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!("clientName" in req.body) || !String(req.body.clientName || "").trim()) {
      return res.status(400).json({ success: false, message: "Client name is required" });
    }

    const updated = await SavedCalculation.findByIdAndUpdate(
      id,
      { clientName: String(req.body.clientName).trim() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Saved calculation not found" });
    }

    res.status(200).json({
      success: true,
      message: "Updated",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ DELETE
export const deleteSavedCalculation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SavedCalculation.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Saved calculation not found" });
    }

    res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

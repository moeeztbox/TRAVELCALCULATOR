// controllers/visa.js
import Visa from "../models/visa.js";

// ➤ CREATE VISA
export const createVisa = async (req, res) => {
  try {
    const { category, passenger, agentName, price, companyCost, agentCost, notes } = req.body;

    const visa = new Visa({
      category,
      passenger,
      agentName,
      price,
      companyCost,
      agentCost,
      notes,
      createdBy: req.user?.id,
    });

    await visa.save();

    res.status(201).json({
      success: true,
      message: "Visa created successfully",
      data: visa,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ READ ALL VISAS
export const getVisas = async (req, res) => {
  try {
    const visas = await Visa.find();
    res.status(200).json({ success: true, data: visas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ UPDATE VISA
export const updateVisa = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVisa = await Visa.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedVisa) {
      return res.status(404).json({ success: false, message: "Visa not found" });
    }

    res.status(200).json({
      success: true,
      message: "Visa updated successfully",
      data: updatedVisa,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ DELETE VISA
export const deleteVisa = async (req, res) => {
  try {
    const { id } = req.params;

    const visa = await Visa.findByIdAndDelete(id);

    if (!visa) {
      return res.status(404).json({ success: false, message: "Visa not found" });
    }

    res.status(200).json({ success: true, message: "Visa deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

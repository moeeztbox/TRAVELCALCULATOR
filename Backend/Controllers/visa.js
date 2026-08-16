import Visa from "../models/visa.js";

// ➤ CREATE VISA
export const createVisa = async (req, res) => {
  try {
    const { category, agentName, price, hotelBRN, hotelBRNPrice, foodBRN, foodBRNPrice } =
      req.body;

    const visa = new Visa({
      category,
      agentName,
      price,
      // Force the price to null whenever its checkbox is off, regardless of
      // what the client sent — a stale/leftover price can never be saved.
      hotelBRN: !!hotelBRN,
      hotelBRNPrice: hotelBRN ? hotelBRNPrice : null,
      foodBRN: !!foodBRN,
      foodBRNPrice: foodBRN ? foodBRNPrice : null,
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
    const update = { ...req.body };
    // Same rule as create: an unchecked BRN can never carry a stale price.
    if ("hotelBRN" in update) {
      update.hotelBRN = !!update.hotelBRN;
      update.hotelBRNPrice = update.hotelBRN ? update.hotelBRNPrice : null;
    }
    if ("foodBRN" in update) {
      update.foodBRN = !!update.foodBRN;
      update.foodBRNPrice = update.foodBRN ? update.foodBRNPrice : null;
    }
    const updatedVisa = await Visa.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedVisa) {
      return res
        .status(404)
        .json({ success: false, message: "Visa not found" });
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
      return res
        .status(404)
        .json({ success: false, message: "Visa not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Visa deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

import Transport from "../models/transport.js";

// ➤ CREATE TRANSPORT
export const createTransport = async (req, res) => {
  try {
    const {
      carType,
      capacity,
      route,
      tripType,
      agentName,
      agentCost,
      companyCost,
      price,
    } = req.body;
    const transport = new Transport({
      carType,
      capacity,
      route,
      tripType,
      agentName,
      agentCost,
      companyCost,
      price,
    });
    await transport.save();

    res.status(201).json({
      success: true,
      message: "Transport created successfully",
      data: transport,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ READ ALL TRANSPORTS
export const getTransports = async (req, res) => {
  try {
    const transports = await Transport.find();
    res.status(200).json({ success: true, data: transports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ UPDATE TRANSPORT
export const updateTransport = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTransport = await Transport.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTransport) {
      return res
        .status(404)
        .json({ success: false, message: "Transport not found" });
    }

    res.status(200).json({
      success: true,
      message: "Transport updated successfully",
      data: updatedTransport,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ DELETE TRANSPORT
export const deleteTransport = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await Transport.findByIdAndDelete(id);

    if (!transport) {
      return res
        .status(404)
        .json({ success: false, message: "Transport not found" });
    }

    res.status(200).json({
      success: true,
      message: "Transport deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

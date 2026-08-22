import Train from "../models/train.js";

// ➤ CREATE TRAIN
export const createTrain = async (req, res) => {
  try {
    const {
      trainName,
      route,
      departure,
      arrival,
      trainClass,
      agentName,
      price,
    } = req.body;
    const train = new Train({
      trainName,
      route,
      departure,
      arrival,
      trainClass,
      agentName,
      price,
    });
    await train.save();

    res.status(201).json({
      success: true,
      message: "Train created successfully",
      data: train,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ READ ALL TRAINS
export const getTrains = async (req, res) => {
  try {
    const trains = await Train.find();
    res.status(200).json({ success: true, data: trains });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ UPDATE TRAIN
export const updateTrain = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTrain = await Train.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTrain) {
      return res.status(404).json({ success: false, message: "Train not found" });
    }

    res.status(200).json({
      success: true,
      message: "Train updated successfully",
      data: updatedTrain,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ DELETE TRAIN
export const deleteTrain = async (req, res) => {
  try {
    const { id } = req.params;

    const train = await Train.findByIdAndDelete(id);

    if (!train) {
      return res.status(404).json({ success: false, message: "Train not found" });
    }

    res.status(200).json({
      success: true,
      message: "Train deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

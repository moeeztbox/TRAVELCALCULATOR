// controllers/package.js
import Package from "../models/package.js";

// ➤ CREATE PACKAGE
export const createPackage = async (req, res) => {
  try {
    const pkg = new Package({ ...req.body, createdBy: req.user?.id });
    await pkg.save();

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: pkg,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ READ ALL PACKAGES
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ UPDATE PACKAGE
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPackage = await Package.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPackage) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updatedPackage,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ DELETE PACKAGE
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByIdAndDelete(id);

    if (!pkg) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// crud fucn , read, update, delete , create
// controllers/hotel.js
import Hotel from "../models/hotel.js";

// ➤ CREATE HOTEL
export const createHotel = async (req, res) => {
  try {
    const {
      hotelName,
      category,
      roomType,
      agentName,
      agentCost,
      companyCost,
      price,
      area,
      city,
      distance,
    } = req.body;

    const hotel = new Hotel({
      hotelName,
      category,
      roomType,
      agentName,
      agentCost,
      companyCost,
      price,
      area,
      city,
      distance,
    });

    await hotel.save();

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ READ ALL HOTELS
export const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ UPDATE HOTEL
export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedHotel = await Hotel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedHotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: updatedHotel,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ DELETE HOTEL
export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findByIdAndDelete(id);

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

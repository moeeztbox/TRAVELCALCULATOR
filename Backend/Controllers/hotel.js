// crud fucn , read, update, delete , create
// controllers/hotel.js
import Hotel from "../models/hotel.js";

// ➤ CREATE HOTEL
// Accepts one set of shared hotel details plus a `roomTypes` array
// (e.g. [{ roomType: "single", price: 100 }, { roomType: "quad", price: 300 }]).
// The admin fills out the form once; we split it into one document per
// selected room type so the database stores separate rows automatically.
export const createHotel = async (req, res) => {
  try {
    const {
      hotelName,
      category,
      agentName,
      area,
      city,
      distance,
      address,
      roomTypes,
    } = req.body;

    if (!Array.isArray(roomTypes) || roomTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one room type with a price",
      });
    }

    const sharedFields = {
      hotelName,
      category,
      agentName,
      area,
      city,
      distance,
      address,
    };

    const docs = roomTypes.map((rt) => ({
      ...sharedFields,
      roomType: rt.roomType,
      price: rt.price,
    }));

    const createdHotels = await Hotel.insertMany(docs);

    res.status(201).json({
      success: true,
      message: `${createdHotels.length} hotel room type(s) created successfully`,
      data: createdHotels,
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
// Edits a single existing room-type record (one row = one room type).
export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedHotel = await Hotel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
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

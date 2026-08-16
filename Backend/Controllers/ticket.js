import Ticket from "../models/ticket.js";

// ➤ CREATE TICKET
export const createTicket = async (req, res) => {
  try {
    const {
      airlineName,
      category,
      passenger,
      departureLuggage,
      departureBags,
      arrivalLuggage,
      arrivalBags,
      price,
      agentName,
      validFrom,
      validTo,
    } = req.body;

    // Validate dates
    if (!validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: "Valid from and valid to dates are required",
      });
    }

    const ticket = new Ticket({
      airlineName,
      category,
      passenger,
      departureLuggage,
      departureBags,
      arrivalLuggage,
      arrivalBags,
      price,
      agentName,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      createdBy: req.user?.id,
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ READ ALL TICKETS
export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ UPDATE TICKET
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTicket = await Ticket.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➤ DELETE TICKET
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

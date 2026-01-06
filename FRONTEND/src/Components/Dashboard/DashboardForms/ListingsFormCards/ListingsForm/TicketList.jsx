import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TicketList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newTicket, setNewTicket] = useState({
    airlineName: "",
    category: "",
    passenger: "",
    weight: "",
    price: "",
    agentName: "",
    agentCost: "",
    companyCost: "",
    validFrom: "", // Added date field
    validTo: "", // Added date field
  });

  const [editTicket, setEditTicket] = useState({
    _id: "",
    airlineName: "",
    category: "",
    passenger: "",
    weight: "",
    price: "",
    agentName: "",
    agentCost: "",
    companyCost: "",
    validFrom: "", // Added date field
    validTo: "", // Added date field
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/tickets");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setTickets(data.data);
      else setTickets([]);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTicket = async () => {
    if (
      !newTicket.airlineName ||
      !newTicket.category ||
      !newTicket.passenger ||
      !newTicket.price ||
      !newTicket.validFrom ||
      !newTicket.validTo
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });
      const data = await res.json();
      if (data.success) {
        alert("Ticket added successfully!");
        setShowAddModal(false);
        setNewTicket({
          airlineName: "",
          category: "",
          passenger: "",
          weight: "",
          price: "",
          agentName: "",
          agentCost: "",
          companyCost: "",
          validFrom: "",
          validTo: "",
        });
        fetchTickets();
      } else {
        alert(data.message || "Error adding ticket");
      }
    } catch (err) {
      console.error("Error adding ticket:", err);
      alert("Error adding ticket");
    }
  };

  const deleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) fetchTickets();
      else alert(data.message || "Error deleting ticket");
    } catch (err) {
      console.error("Error deleting ticket:", err);
      alert("Error deleting ticket");
    }
  };

  const openEditModal = (ticket) => {
    setEditTicket({
      _id: ticket._id,
      airlineName: ticket.airlineName,
      category: ticket.category,
      passenger: ticket.passenger,
      weight: ticket.weight,
      price: ticket.price,
      agentName: ticket.agentName,
      agentCost: ticket.agentCost,
      companyCost: ticket.companyCost,
      validFrom: ticket.validFrom
        ? new Date(ticket.validFrom).toISOString().split("T")[0]
        : "",
      validTo: ticket.validTo
        ? new Date(ticket.validTo).toISOString().split("T")[0]
        : "",
    });
    setShowEditModal(true);
  };

  const updateTicket = async () => {
    if (
      !editTicket.airlineName ||
      !editTicket.category ||
      !editTicket.passenger ||
      !editTicket.price ||
      !editTicket.validFrom ||
      !editTicket.validTo
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/tickets/${editTicket._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editTicket),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Ticket updated successfully!");
        setShowEditModal(false);
        fetchTickets();
      } else {
        alert(data.message || "Error updating ticket");
      }
    } catch (err) {
      console.error("Error updating ticket:", err);
      alert("Error updating ticket");
    }
  };

  const handleBack = () => navigate("/dashboard/listings");

  const type = localStorage.getItem("type");
  const isAdmin = type === "admin";

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // PRINT FUNCTION
  const handlePrint = () => {
    const navElements = document.querySelectorAll(
      'nav, header, [role="navigation"]'
    );
    navElements.forEach((el) => {
      el.style.display = "none";
    });

    window.print();

    setTimeout(() => {
      navElements.forEach((el) => {
        el.style.display = "";
      });
    }, 100);
  };

  return (
    <div className="px-4 sm:px-8 py-6 w-full">
      {/* PRINT CSS */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            nav, header, [role="navigation"] {
              display: none !important;
            }
            body {
              -webkit-print-color-adjust: exact;
              margin: 0;
              padding: 0;
              background: white !important;
            }
            .print\:hidden {
              display: none !important;
            }
            .print\:block {
              display: block !important;
            }
            
            * {
              background: white !important;
              box-shadow: none !important;
            }
            
            .rounded-xl, .rounded-lg, .rounded {
              border-radius: 0 !important;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000 !important;
            }
            
            .print-table th, 
            .print-table td {
              border: 1px solid #000 !important;
              padding: 12px 8px !important;
              background: white !important;
              font-size: 12px;
              height: 50px;
              vertical-align: middle;
              text-align: left;
            }
            
            .print-table th {
              background: white !important;
              font-weight: bold;
              border-bottom: 2px solid #000 !important;
            }
            
            .print-table tr {
              border-bottom: 1px solid #000 !important;
            }
            
            footer {
              display: none !important;
            }
            
            .footer, [class*="footer"], [class*="copyright"] {
              display: none !important;
            }
            
            .print-table {
              page-break-inside: auto;
            }
            
            .print-table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              font-size: 24px;
              font-weight: bold;
            }
          }
        `}
      </style>

      <button
        onClick={handleBack}
        className="no-print flex items-center cursor-pointer gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} /> <span className="font-medium">Back</span>
      </button>

      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-3xl font-extrabold text-gray-900">Tickets List</h1>

        <div className="flex gap-2">
          {/* PRINT BUTTON */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition cursor-pointer no-print"
          >
            Print
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex cursor-pointer items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition no-print"
            >
              <Plus size={20} /> Add
            </button>
          )}
        </div>
      </div>

      {/* PRINTABLE AREA */}
      <div id="print-area">
        {/* PRINT-ONLY HEADER */}
        <h1 className="print-header print:block hidden">Tickets List</h1>

        {/* TABLE */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden print:shadow-none print:rounded-none">
          <table className="w-full text-left print-table">
            <thead className="bg-gray-100 text-gray-700 print:bg-white">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold">Airline</th>
                <th className="py-3 px-4 text-sm font-semibold">Category</th>
                <th className="py-3 px-4 text-sm font-semibold">Passenger</th>
                <th className="py-3 px-4 text-sm font-semibold">Weight</th>
                <th className="py-3 px-4 text-sm font-semibold">Agent Name</th>
                <th className="py-3 px-4 text-sm font-semibold">Agent Cost</th>
                <th className="py-3 px-4 text-sm font-semibold">
                  Company Cost
                </th>
                <th className="py-3 px-4 text-sm font-semibold">Price</th>
                <th className="py-3 px-4 text-sm font-semibold">Valid From</th>
                <th className="py-3 px-4 text-sm font-semibold">Valid To</th>
                {isAdmin && (
                  <th className="py-3 px-4 text-sm font-semibold no-print">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 11 : 10}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 11 : 10}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="border-b hover:bg-gray-50 transition print:hover:bg-white"
                  >
                    <td className="py-3 px-4">{ticket.airlineName}</td>
                    <td className="py-3 px-4">{ticket.category}</td>
                    <td className="py-3 px-4">{ticket.passenger}</td>
                    <td className="py-3 px-4">{ticket.weight} KG</td>
                    <td className="py-3 px-4">{ticket.agentName}</td>
                    <td className="py-3 px-4">{ticket.agentCost}</td>
                    <td className="py-3 px-4">{ticket.companyCost}</td>
                    <td className="py-3 px-4">{ticket.price}</td>
                    <td className="py-3 px-4">
                      {formatDate(ticket.validFrom)}
                    </td>
                    <td className="py-3 px-4">{formatDate(ticket.validTo)}</td>

                    {isAdmin && (
                      <td className="py-3 px-4 flex items-center gap-4 no-print">
                        <button
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => openEditModal(ticket)}
                        >
                          <Pencil size={20} />
                        </button>

                        <button
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          onClick={() => deleteTicket(ticket._id)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Ticket</h2>

            <input
              type="text"
              placeholder="Airline Name *"
              value={newTicket.airlineName}
              onChange={(e) =>
                setNewTicket({ ...newTicket, airlineName: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            />

            <select
              value={newTicket.category}
              onChange={(e) =>
                setNewTicket({ ...newTicket, category: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            >
              <option value="">Select Category *</option>
              <option value="Group Ticket">Group Ticket</option>
              <option value="System Ticket">System Ticket</option>
            </select>

            <select
              value={newTicket.passenger}
              onChange={(e) =>
                setNewTicket({ ...newTicket, passenger: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            >
              <option value="">Select Passenger *</option>
              <option value="adult">Adult</option>
              <option value="infant">Infant</option>
              <option value="child">Child</option>
            </select>

            <input
              type="number"
              placeholder="Weight (KG)"
              value={newTicket.weight}
              onChange={(e) =>
                setNewTicket({ ...newTicket, weight: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Price *"
              value={newTicket.price}
              onChange={(e) =>
                setNewTicket({ ...newTicket, price: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            />

            <input
              type="text"
              placeholder="Agent Name"
              value={newTicket.agentName}
              onChange={(e) =>
                setNewTicket({ ...newTicket, agentName: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Agent Cost"
              value={newTicket.agentCost}
              onChange={(e) =>
                setNewTicket({ ...newTicket, agentCost: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Company Cost"
              value={newTicket.companyCost}
              onChange={(e) =>
                setNewTicket({ ...newTicket, companyCost: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="date"
              placeholder="Valid From *"
              value={newTicket.validFrom}
              onChange={(e) =>
                setNewTicket({ ...newTicket, validFrom: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            />

            <input
              type="date"
              placeholder="Valid To *"
              value={newTicket.validTo}
              min={newTicket.validFrom}
              onChange={(e) =>
                setNewTicket({ ...newTicket, validTo: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            />

            {/* REMOVED: Notes textarea */}

            <div className="flex justify-between gap-2 mt-4">
              <button
                onClick={saveTicket}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Ticket</h2>

            <input
              type="text"
              placeholder="Airline Name *"
              value={editTicket.airlineName}
              onChange={(e) =>
                setEditTicket({ ...editTicket, airlineName: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            />

            <select
              value={editTicket.category}
              onChange={(e) =>
                setEditTicket({ ...editTicket, category: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            >
              <option value="">Select Category *</option>
              <option value="Group Ticket">Group Ticket</option>
              <option value="System Ticket">System Ticket</option>
            </select>

            <select
              value={editTicket.passenger}
              onChange={(e) =>
                setEditTicket({ ...editTicket, passenger: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            >
              <option value="">Select Passenger *</option>
              <option value="adult">Adult</option>
              <option value="infant">Infant</option>
              <option value="child">Child</option>
            </select>

            <input
              type="number"
              placeholder="Weight (KG)"
              value={editTicket.weight}
              onChange={(e) =>
                setEditTicket({ ...editTicket, weight: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Price *"
              value={editTicket.price}
              onChange={(e) =>
                setEditTicket({ ...editTicket, price: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            />

            <input
              type="text"
              placeholder="Agent Name"
              value={editTicket.agentName}
              onChange={(e) =>
                setEditTicket({ ...editTicket, agentName: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Agent Cost"
              value={editTicket.agentCost}
              onChange={(e) =>
                setEditTicket({ ...editTicket, agentCost: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Company Cost"
              value={editTicket.companyCost}
              onChange={(e) =>
                setEditTicket({ ...editTicket, companyCost: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="date"
              placeholder="Valid From *"
              value={editTicket.validFrom}
              onChange={(e) =>
                setEditTicket({ ...editTicket, validFrom: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            />

            <input
              type="date"
              placeholder="Valid To *"
              value={editTicket.validTo}
              min={editTicket.validFrom}
              onChange={(e) =>
                setEditTicket({ ...editTicket, validTo: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
              required
            />

            {/* REMOVED: Notes textarea */}

            <div className="flex justify-between gap-2 mt-4">
              <button
                onClick={updateTicket}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Update
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;

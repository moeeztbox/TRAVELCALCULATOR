import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Plane, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../../Main/Modal";
import {
  Field,
  inputClass,
  SectionTitle,
  ModalActions,
} from "../../../../Main/FormControls";
import PageHeader from "../../../../UI/PageHeader";
import Button from "../../../../UI/Button";
import { useAuth } from "../../../../../context/AuthContext";
import { toUpper } from "../../../../../utils/text";
import { API_BASE_URL } from "../../../../../config/api";

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
    price: "",
    agentName: "",
    departureLuggage: "",
    departureBags: "",
    arrivalLuggage: "",
    arrivalBags: "",
    validFrom: "", // Added date field
    validTo: "", // Added date field
  });

  const [editTicket, setEditTicket] = useState({
    _id: "",
    airlineName: "",
    category: "",
    passenger: "",
    price: "",
    agentName: "",
    departureLuggage: "",
    departureBags: "",
    arrivalLuggage: "",
    arrivalBags: "",
    validFrom: "", // Added date field
    validTo: "", // Added date field
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/tickets`, {
        credentials: "include",
      });
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
      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
          price: "",
          agentName: "",
          departureLuggage: "",
          departureBags: "",
          arrivalLuggage: "",
          arrivalBags: "",
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
      const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: "DELETE",
        credentials: "include",
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
      price: ticket.price,
      agentName: ticket.agentName,
      departureLuggage: ticket.departureLuggage ?? "",
      departureBags: ticket.departureBags ?? "",
      arrivalLuggage: ticket.arrivalLuggage ?? "",
      arrivalBags: ticket.arrivalBags ?? "",
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
        `${API_BASE_URL}/tickets/${editTicket._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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

  const { isAdmin } = useAuth();

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

  // Shared field set for both Add and Edit modals
  const renderTicketFields = (data, setData) => (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={<Plane size={16} className="text-blue-600" />}>
          Flight Information
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Airline Name" required className="sm:col-span-2">
            <input
              type="text"
              placeholder="e.g. Saudia"
              value={data.airlineName}
              onChange={(e) =>
                setData({ ...data, airlineName: toUpper(e.target.value) })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Category" required>
            <select
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Category</option>
              <option value="Group Ticket">Group Ticket</option>
              <option value="System Ticket">System Ticket</option>
            </select>
          </Field>

          <Field label="Passenger" required>
            <select
              value={data.passenger}
              onChange={(e) => setData({ ...data, passenger: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Passenger</option>
              <option value="adult">Adult</option>
              <option value="infant">Infant</option>
              <option value="child">Child</option>
            </select>
          </Field>

          <Field label="Price" required>
            <input
              type="number"
              placeholder="0"
              value={data.price}
              onChange={(e) => setData({ ...data, price: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Baggage Allowance</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Departure Luggage (KG)" required>
            <input
              type="number"
              placeholder="e.g. 30"
              value={data.departureLuggage}
              onChange={(e) =>
                setData({ ...data, departureLuggage: e.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Departure Bags" required>
            <input
              type="number"
              step="1"
              placeholder="e.g. 1"
              value={data.departureBags}
              onChange={(e) =>
                setData({ ...data, departureBags: e.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Arrival Luggage (KG)" required>
            <input
              type="number"
              placeholder="e.g. 30"
              value={data.arrivalLuggage}
              onChange={(e) =>
                setData({ ...data, arrivalLuggage: e.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Arrival Bags" required>
            <input
              type="number"
              step="1"
              placeholder="e.g. 1"
              value={data.arrivalBags}
              onChange={(e) =>
                setData({ ...data, arrivalBags: e.target.value })
              }
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Validity Period</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Valid From" required>
            <input
              type="date"
              value={data.validFrom}
              onChange={(e) => setData({ ...data, validFrom: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Valid To" required>
            <input
              type="date"
              min={data.validFrom}
              value={data.validTo}
              onChange={(e) => setData({ ...data, validTo: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Agent</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Agent Name" className="sm:col-span-2">
            <input
              type="text"
              placeholder="Agent name"
              value={data.agentName}
              onChange={(e) =>
                setData({ ...data, agentName: toUpper(e.target.value) })
              }
              className={inputClass}
            />
          </Field>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
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
            .print\\:hidden {
              display: none !important;
            }
            .print\\:block {
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

      <div className="no-print mb-8">
        <PageHeader
          title="Tickets"
          subtitle="Airlines, fares & validity"
          icon={Plane}
          onBack={handleBack}
          actions={
            <>
              <Button variant="secondary" icon={Printer} onClick={handlePrint}>
                Print
              </Button>
              {isAdmin && (
                <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                  Add Ticket
                </Button>
              )}
            </>
          }
        />
      </div>

      {/* PRINTABLE AREA */}
      <div id="print-area">
        {/* PRINT-ONLY HEADER */}
        <h1 className="print-header print:block hidden">Tickets List</h1>

        {/* TABLE */}
        <div className="table-card mt-2 print:shadow-none print:rounded-none print:border-0">
          <table className="data-table print-table">
            <thead>
              <tr>
                <th>Airline</th>
                <th>Category</th>
                <th>Passenger</th>
                <th>Agent Name</th>
                <th>Price</th>
                <th>Departure Luggage</th>
                <th>Departure Bags</th>
                <th>Arrival Luggage</th>
                <th>Arrival Bags</th>
                <th>Valid From</th>
                <th>Valid To</th>
                {isAdmin && <th className="no-print">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 12 : 11}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 12 : 11}
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
                    <td className="py-3 px-4">{ticket.agentName}</td>
                    <td className="py-3 px-4">{ticket.price}</td>
                    <td className="py-3 px-4">
                      {ticket.departureLuggage ?? "-"} KG
                    </td>
                    <td className="py-3 px-4">
                      {ticket.departureBags ?? "-"}
                    </td>
                    <td className="py-3 px-4">
                      {ticket.arrivalLuggage ?? "-"} KG
                    </td>
                    <td className="py-3 px-4">{ticket.arrivalBags ?? "-"}</td>
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
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Ticket"
        icon={<Plane size={20} className="text-blue-600" />}
        footer={
          <ModalActions
            onCancel={() => setShowAddModal(false)}
            onSubmit={saveTicket}
            submitLabel="Save Ticket"
            submitColor="green"
          />
        }
      >
        {renderTicketFields(newTicket, setNewTicket)}
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Ticket"
        icon={<Plane size={20} className="text-blue-600" />}
        footer={
          <ModalActions
            onCancel={() => setShowEditModal(false)}
            onSubmit={updateTicket}
            submitLabel="Update Ticket"
            submitColor="blue"
          />
        }
      >
        {renderTicketFields(editTicket, setEditTicket)}
      </Modal>
    </div>
  );
};

export default TicketList;

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VisaList = () => {
  const navigate = useNavigate();
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newVisa, setNewVisa] = useState({
    category: "",
    passenger: "",
    agentName: "",
    price: "",
    companyCost: "",
    agentCost: "",
    notes: "",
  });

  const [editVisa, setEditVisa] = useState({
    _id: "",
    category: "",
    passenger: "",
    agentName: "",
    price: "",
    companyCost: "",
    agentCost: "",
    notes: "",
  });

  useEffect(() => {
    fetchVisas();
  }, []);

  const fetchVisas = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/visas");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setVisas(data.data);
      else setVisas([]);
    } catch (err) {
      console.error("Error fetching visas:", err);
      setVisas([]);
    } finally {
      setLoading(false);
    }
  };

  const saveVisa = async () => {
    if (
      !newVisa.category ||
      !newVisa.passenger ||
      !newVisa.agentName ||
      !newVisa.price
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/visas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVisa),
      });
      const data = await res.json();
      if (data.success) {
        alert("Visa added successfully!");
        setShowAddModal(false);
        setNewVisa({
          category: "",
          passenger: "",
          agentName: "",
          price: "",
          companyCost: "",
          agentCost: "",
          notes: "",
        });
        fetchVisas();
      } else {
        alert(data.message || "Error adding visa");
      }
    } catch (err) {
      console.error("Error adding visa:", err);
      alert("Error adding visa");
    }
  };

  const deleteVisa = async (id) => {
    if (!window.confirm("Are you sure you want to delete this visa?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/visas/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) fetchVisas();
      else alert(data.message || "Error deleting visa");
    } catch (err) {
      console.error("Error deleting visa:", err);
      alert("Error deleting visa");
    }
  };

  const openEditModal = (visa) => {
    setEditVisa(visa);
    setShowEditModal(true);
  };

  const updateVisa = async () => {
    if (
      !editVisa.category ||
      !editVisa.passenger ||
      !editVisa.agentName ||
      !editVisa.price
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/visas/${editVisa._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editVisa),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Visa updated successfully!");
        setShowEditModal(false);
        fetchVisas();
      } else {
        alert(data.message || "Error updating visa");
      }
    } catch (err) {
      console.error("Error updating visa:", err);
      alert("Error updating visa");
    }
  };

  const handleBack = () => navigate("/dashboard/listings");

  const type = localStorage.getItem("type");
  const isAdmin = type === "admin";

  // PRINT FUNCTION - Hide navbar during print
  const handlePrint = () => {
    // Hide navbar elements before printing
    const navElements = document.querySelectorAll(
      'nav, header, [role="navigation"]'
    );
    navElements.forEach((el) => {
      el.style.display = "none";
    });

    window.print();

    // Restore navbar elements after printing
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
            
            /* Remove all background colors and shadows */
            * {
              background: white !important;
              box-shadow: none !important;
            }
            
            /* Remove border radius */
            .rounded-xl, .rounded-lg, .rounded {
              border-radius: 0 !important;
            }
            
            /* Professional table styling for print only */
            .print-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000 !important;
            }
            
            .print-table th, 
            .print-table td {
              border: 1px solid #000 !important;
              padding: 14px 10px !important;
              background: white !important;
              font-size: 14px;
              height: 55px;
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
            
            /* Remove any footer */
            footer {
              display: none !important;
            }
            
            /* Hide the copyright text */
            .footer, [class*="footer"], [class*="copyright"] {
              display: none !important;
            }
            
            /* Ensure proper page breaks */
            .print-table {
              page-break-inside: auto;
            }
            
            .print-table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            /* Center the header */
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
        className="no-print cursor-pointer flex items-center gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} /> <span>Back</span>
      </button>

      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-3xl font-extrabold text-gray-900">Visa List</h1>
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
        <h1 className="print-header print:block hidden">Visa List</h1>

        {/* TABLE - Different styling for screen vs print */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden print:shadow-none print:rounded-none">
          <table className="w-full text-left print-table">
            <thead className="bg-gray-100 text-gray-700 print:bg-white">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold">Category</th>
                <th className="py-3 px-4 text-sm font-semibold">Passenger</th>
                <th className="py-3 px-4 text-sm font-semibold">Agent Name</th>
                <th className="py-3 px-4 text-sm font-semibold">Agent Cost</th>
                <th className="py-3 px-4 text-sm font-semibold">
                  Company Cost
                </th>
                <th className="py-3 px-4 text-sm font-semibold">Price</th>
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
                    colSpan={isAdmin ? 7 : 6}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : visas.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No visas found.
                  </td>
                </tr>
              ) : (
                visas.map((v) => (
                  <tr
                    key={v._id}
                    className="border-b hover:bg-gray-50 transition print:hover:bg-white"
                  >
                    <td className="py-3 px-4">{v.category}</td>
                    <td className="py-3 px-4">{v.passenger}</td>
                    <td className="py-3 px-4">{v.agentName}</td>
                    <td className="py-3 px-4">{v.agentCost}</td>
                    <td className="py-3 px-4">{v.companyCost}</td>
                    <td className="py-3 px-4">{v.price}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 flex gap-4 no-print">
                        <button
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => openEditModal(v)}
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          onClick={() => deleteVisa(v._id)}
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Add Visa</h2>

            <select
              value={newVisa.category}
              onChange={(e) =>
                setNewVisa({ ...newVisa, category: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Category</option>
              <option value="with massar">with massar</option>
              <option value="without massar">without massar</option>
            </select>

            <select
              value={newVisa.passenger}
              onChange={(e) =>
                setNewVisa({ ...newVisa, passenger: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Passenger</option>
              <option value="adult">adult</option>
              <option value="infant">infant</option>
            </select>

            <input
              type="text"
              placeholder="Agent Name"
              value={newVisa.agentName}
              onChange={(e) =>
                setNewVisa({ ...newVisa, agentName: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Agent Cost"
              value={newVisa.agentCost}
              onChange={(e) =>
                setNewVisa({ ...newVisa, agentCost: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Company Cost"
              value={newVisa.companyCost}
              onChange={(e) =>
                setNewVisa({ ...newVisa, companyCost: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Price"
              value={newVisa.price}
              onChange={(e) =>
                setNewVisa({ ...newVisa, price: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <textarea
              placeholder="Notes"
              value={newVisa.notes}
              onChange={(e) =>
                setNewVisa({ ...newVisa, notes: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <div className="flex justify-between gap-2">
              <button
                onClick={saveVisa}
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
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Edit Visa</h2>

            <select
              value={editVisa.category}
              onChange={(e) =>
                setEditVisa({ ...editVisa, category: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Category</option>
              <option value="with massar">with massar</option>
              <option value="without massar">without massar</option>
            </select>

            <select
              value={editVisa.passenger}
              onChange={(e) =>
                setEditVisa({ ...editVisa, passenger: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Passenger</option>
              <option value="adult">adult</option>
              <option value="infant">infant</option>
            </select>

            <input
              type="text"
              placeholder="Agent Name"
              value={editVisa.agentName}
              onChange={(e) =>
                setEditVisa({ ...editVisa, agentName: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Agent Cost"
              value={editVisa.agentCost}
              onChange={(e) =>
                setEditVisa({ ...editVisa, agentCost: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Company Cost"
              value={editVisa.companyCost}
              onChange={(e) =>
                setEditVisa({ ...editVisa, companyCost: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Price"
              value={editVisa.price}
              onChange={(e) =>
                setEditVisa({ ...editVisa, price: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <textarea
              placeholder="Notes"
              value={editVisa.notes}
              onChange={(e) =>
                setEditVisa({ ...editVisa, notes: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <div className="flex justify-between gap-2">
              <button
                onClick={updateVisa}
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

export default VisaList;

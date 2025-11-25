import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TransportList = () => {
  const navigate = useNavigate();
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newTransport, setNewTransport] = useState({
    carType: "",
    capacity: "",
    from: "",
    to: "",
    agentName: "",
    agentCost: "",
    companyCost: "",
    price: "",
  });

  const [editTransport, setEditTransport] = useState({
    _id: "",
    carType: "",
    capacity: "",
    from: "",
    to: "",
    agentName: "",
    agentCost: "",
    companyCost: "",
    price: "",
  });

  const capacities = [
    "4 Seater",
    "6 Seater",
    "8 Seater",
    "12 Seater",
    "15 Seater",
  ];
  const carTypes = ["Hiace", "SUV", "Coaster", "Sedan"];

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/transports");
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setTransports(data.data);
      } else {
        setTransports([]);
      }
    } catch (err) {
      console.error("Error fetching transports:", err);
      setTransports([]);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const saveTransport = async () => {
    if (
      !newTransport.carType ||
      !newTransport.capacity ||
      !newTransport.from ||
      !newTransport.to ||
      !newTransport.price
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/transports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTransport,
          route: {
            from: newTransport.from,
            to: newTransport.to,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Transport added successfully!");
        setShowAddModal(false);
        setNewTransport({
          carType: "",
          capacity: "",
          from: "",
          to: "",
          agentName: "",
          agentCost: "",
          companyCost: "",
          price: "",
        });
        fetchTransports();
      }
    } catch (err) {
      console.error("Error adding transport:", err);
    }
  };

  // DELETE
  const deleteTransport = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await fetch(`http://localhost:5000/api/transports/${id}`, {
        method: "DELETE",
      });
      fetchTransports();
    } catch (err) {
      console.error("Error deleting transport:", err);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (item) => {
    setEditTransport({
      _id: item._id,
      carType: item.carType,
      capacity: item.capacity,
      from: item.route?.from || "",
      to: item.route?.to || "",
      agentName: item.agentName,
      agentCost: item.agentCost,
      companyCost: item.companyCost,
      price: item.price,
    });

    setShowEditModal(true);
  };

  // UPDATE
  const updateTransport = async () => {
    if (
      !editTransport.carType ||
      !editTransport.capacity ||
      !editTransport.from ||
      !editTransport.to ||
      !editTransport.price
    ) {
      alert("All required fields must be filled");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/transports/${editTransport._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editTransport,
            route: {
              from: editTransport.from,
              to: editTransport.to,
            },
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Transport updated!");
        setShowEditModal(false);
        fetchTransports();
      }
    } catch (err) {
      console.error("Error updating transport:", err);
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

      {/* Back */}
      <button
        onClick={handleBack}
        className="no-print cursor-pointer flex items-center gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} /> <span>Back</span>
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Transport List
        </h1>

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
        <h1 className="print-header print:block hidden">Transport List</h1>

        {/* Table - Different styling for screen vs print */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden print:shadow-none print:rounded-none">
          <table className="w-full text-left print-table">
            <thead className="bg-gray-100 text-gray-700 print:bg-white">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold">Car Type</th>
                <th className="py-3 px-4 text-sm font-semibold">Capacity</th>
                <th className="py-3 px-4 text-sm font-semibold">Route</th>
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
                    colSpan={isAdmin ? 8 : 7}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : transports.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : 7}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No transport found.
                  </td>
                </tr>
              ) : (
                transports.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b hover:bg-gray-50 transition print:hover:bg-white"
                  >
                    <td className="py-3 px-4">{item.carType}</td>
                    <td className="py-3 px-4">{item.capacity}</td>
                    <td className="py-3 px-4">
                      {item.route?.from} → {item.route?.to}
                    </td>
                    <td className="py-3 px-4">{item.agentName}</td>
                    <td className="py-3 px-4">{item.agentCost}</td>
                    <td className="py-3 px-4">{item.companyCost}</td>
                    <td className="py-3 px-4">{item.price}</td>

                    {isAdmin && (
                      <td className="py-3 px-4 flex gap-4 no-print">
                        <button
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => openEditModal(item)}
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          onClick={() => deleteTransport(item._id)}
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
            <h2 className="text-2xl font-bold mb-4">Add Transport</h2>

            <select
              value={newTransport.carType}
              onChange={(e) =>
                setNewTransport({ ...newTransport, carType: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Car Type</option>
              {carTypes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={newTransport.capacity}
              onChange={(e) =>
                setNewTransport({ ...newTransport, capacity: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Capacity</option>
              {capacities.map((cap) => (
                <option key={cap} value={cap}>
                  {cap}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="From"
              className="w-full border rounded px-3 py-2 mb-3"
              value={newTransport.from}
              onChange={(e) =>
                setNewTransport({ ...newTransport, from: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="To"
              className="w-full border rounded px-3 py-2 mb-3"
              value={newTransport.to}
              onChange={(e) =>
                setNewTransport({ ...newTransport, to: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Agent Name"
              className="w-full border rounded px-3 py-2 mb-3"
              value={newTransport.agentName}
              onChange={(e) =>
                setNewTransport({ ...newTransport, agentName: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Agent Cost"
              className="w-full border rounded px-3 py-2 mb-3"
              value={newTransport.agentCost}
              onChange={(e) =>
                setNewTransport({ ...newTransport, agentCost: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Company Cost"
              className="w-full border rounded px-3 py-2 mb-3"
              value={newTransport.companyCost}
              onChange={(e) =>
                setNewTransport({
                  ...newTransport,
                  companyCost: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Price"
              className="w-full border rounded px-3 py-2 mb-4"
              value={newTransport.price}
              onChange={(e) =>
                setNewTransport({ ...newTransport, price: e.target.value })
              }
            />

            <div className="flex gap-2">
              <button
                onClick={saveTransport}
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
            <h2 className="text-2xl font-bold mb-4">Edit Transport</h2>

            <select
              value={editTransport.carType}
              onChange={(e) =>
                setEditTransport({ ...editTransport, carType: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Car Type</option>
              {carTypes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={editTransport.capacity}
              onChange={(e) =>
                setEditTransport({ ...editTransport, capacity: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Capacity</option>
              {capacities.map((cap) => (
                <option key={cap} value={cap}>
                  {cap}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="From"
              value={editTransport.from}
              onChange={(e) =>
                setEditTransport({ ...editTransport, from: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="text"
              placeholder="To"
              value={editTransport.to}
              onChange={(e) =>
                setEditTransport({ ...editTransport, to: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="text"
              placeholder="Agent Name"
              value={editTransport.agentName}
              onChange={(e) =>
                setEditTransport({
                  ...editTransport,
                  agentName: e.target.value,
                })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Agent Cost"
              value={editTransport.agentCost}
              onChange={(e) =>
                setEditTransport({
                  ...editTransport,
                  agentCost: e.target.value,
                })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Company Cost"
              value={editTransport.companyCost}
              onChange={(e) =>
                setEditTransport({
                  ...editTransport,
                  companyCost: e.target.value,
                })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="number"
              placeholder="Price"
              value={editTransport.price}
              onChange={(e) =>
                setEditTransport({ ...editTransport, price: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={updateTransport}
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

export default TransportList;

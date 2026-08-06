import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Car, Printer } from "lucide-react";
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

const TransportList = () => {
  const navigate = useNavigate();
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // New shape: route is a single string, tripType is "oneway" | "roundtrip"
  const [newTransport, setNewTransport] = useState({
    carType: "",
    capacity: "",
    tripType: "oneway",
    route: "",
    agentName: "",
    agentCost: "",
    companyCost: "",
    price: "",
  });

  const [editTransport, setEditTransport] = useState({
    _id: "",
    carType: "",
    capacity: "",
    tripType: "oneway",
    route: "",
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

  // Route options
  const oneWayRoutes = [
    "Makkah → Medinah",
    "Makkah → Jeddah",
    "Medinah → Makkah",
    "Medinah → Jeddah",
    "Jeddah → Medinah",
    "Jeddah → Makkah",
  ];

  const roundTripRoutes = [
    "Jeddah → Makkah → Medinah → Medinah Airport",
    "Medinah Airport → Medinah Hotel → Makkah Hotel → Jeddah Airport",
    "Jeddah → Makkah → Medinah → Jeddah",
    "Jeddah → Medinah → Makkah → Jeddah",
    "Jeddah → Makkah → Medinah → Makkah → Jeddah",
  ];

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/transports");
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        // Accept both old shape (route object) and new shape (route string).
        // Normalize so we always display item.routeString
        const normalized = data.data.map((t) => {
          const routeString =
            typeof t.route === "string"
              ? t.route
              : t.route && (t.route.from || t.route.to)
              ? `${t.route.from || ""}${
                  t.route.from && t.route.to ? " → " : ""
                }${t.route.to || ""}`
              : t.routeString || "";
          return { ...t, routeString };
        });
        setTransports(normalized);
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
    // basic validation
    if (
      !newTransport.carType ||
      !newTransport.capacity ||
      !newTransport.route ||
      !newTransport.price
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        carType: newTransport.carType,
        capacity: newTransport.capacity,
        tripType: newTransport.tripType,
        route: newTransport.route, // string
        agentName: newTransport.agentName,
        agentCost: newTransport.agentCost,
        companyCost: newTransport.companyCost,
        price: newTransport.price,
      };

      const res = await fetch("http://localhost:5000/api/transports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Transport added successfully!");
        setShowAddModal(false);
        setNewTransport({
          carType: "",
          capacity: "",
          tripType: "oneway",
          route: "",
          agentName: "",
          agentCost: "",
          companyCost: "",
          price: "",
        });
        fetchTransports();
      } else {
        console.error("Server response:", data);
        alert("Failed to add transport. See console.");
      }
    } catch (err) {
      console.error("Error adding transport:", err);
      alert("Error adding transport. See console.");
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
    // determine tripType based on whether route matches round trip options
    const isRound =
      roundTripRoutes.includes(item.routeString) ||
      (typeof item.tripType === "string" && item.tripType === "roundtrip");

    setEditTransport({
      _id: item._id,
      carType: item.carType || "",
      capacity: item.capacity || "",
      tripType: isRound ? "roundtrip" : "oneway",
      route: item.routeString || "",
      agentName: item.agentName || "",
      agentCost: item.agentCost || "",
      companyCost: item.companyCost || "",
      price: item.price || "",
    });

    setShowEditModal(true);
  };

  // UPDATE
  const updateTransport = async () => {
    if (
      !editTransport.carType ||
      !editTransport.capacity ||
      !editTransport.route ||
      !editTransport.price
    ) {
      alert("All required fields must be filled");
      return;
    }

    try {
      const payload = {
        carType: editTransport.carType,
        capacity: editTransport.capacity,
        tripType: editTransport.tripType,
        route: editTransport.route, // string
        agentName: editTransport.agentName,
        agentCost: editTransport.agentCost,
        companyCost: editTransport.companyCost,
        price: editTransport.price,
      };

      const res = await fetch(
        `http://localhost:5000/api/transports/${editTransport._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Transport updated!");
        setShowEditModal(false);
        fetchTransports();
      } else {
        console.error("Server response:", data);
        alert("Failed to update transport. See console.");
      }
    } catch (err) {
      console.error("Error updating transport:", err);
      alert("Error updating transport. See console.");
    }
  };

  const handleBack = () => navigate("/dashboard/listings");

  const { isAdmin } = useAuth();

  // PRINT FUNCTION - Hide navbar during print
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

  // Helper to get route options based on trip type
  const getRouteOptions = (tripType) =>
    tripType === "roundtrip" ? roundTripRoutes : oneWayRoutes;

  // Shared field set for both Add and Edit modals
  const renderTransportFields = (data, setData) => (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={<Car size={16} className="text-blue-600" />}>
          Vehicle &amp; Route
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Car Type" required>
            <select
              value={data.carType}
              onChange={(e) => setData({ ...data, carType: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Car Type</option>
              {carTypes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Capacity" required>
            <select
              value={data.capacity}
              onChange={(e) => setData({ ...data, capacity: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Capacity</option>
              {capacities.map((cap) => (
                <option key={cap} value={cap}>
                  {cap}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Trip Type" required>
            <select
              value={data.tripType}
              onChange={(e) =>
                setData({ ...data, tripType: e.target.value, route: "" })
              }
              className={inputClass}
            >
              <option value="oneway">One Way</option>
              <option value="roundtrip">Round Trip</option>
            </select>
          </Field>

          <Field label="Route" required>
            <select
              value={data.route}
              onChange={(e) => setData({ ...data, route: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Route</option>
              {getRouteOptions(data.tripType).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Pricing &amp; Agent</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Agent Name" className="sm:col-span-2">
            <input
              type="text"
              placeholder="Agent name"
              value={data.agentName}
              onChange={(e) =>
                setData({ ...data, agentName: e.target.value.toUpperCase() })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Agent Cost">
            <input
              type="number"
              placeholder="0"
              value={data.agentCost}
              onChange={(e) => setData({ ...data, agentCost: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Company Cost">
            <input
              type="number"
              placeholder="0"
              value={data.companyCost}
              onChange={(e) =>
                setData({ ...data, companyCost: e.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Price" required className="sm:col-span-2">
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
          title="Transport"
          subtitle="Vehicles, routes & trip pricing"
          icon={Car}
          onBack={handleBack}
          actions={
            <>
              <Button variant="secondary" icon={Printer} onClick={handlePrint}>
                Print
              </Button>
              {isAdmin && (
                <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                  Add Transport
                </Button>
              )}
            </>
          }
        />
      </div>

      {/* PRINTABLE AREA */}
      <div id="print-area">
        {/* PRINT-ONLY HEADER */}
        <h1 className="print-header print:block hidden">Transport List</h1>

        {/* Table - Different styling for screen vs print */}
        <div className="table-card mt-2 print:shadow-none print:rounded-none print:border-0">
          <table className="data-table print-table">
            <thead>
              <tr>
                <th>Car Type</th>
                <th>Capacity</th>
                <th>Route</th>
                <th>Agent Name</th>
                <th>Agent Cost</th>
                <th>Company Cost</th>
                <th>Price</th>
                {isAdmin && <th className="no-print">Actions</th>}
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
                    <td className="py-3 px-4">{item.routeString}</td>
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
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transport"
        icon={<Car size={20} className="text-blue-600" />}
        footer={
          <ModalActions
            onCancel={() => setShowAddModal(false)}
            onSubmit={saveTransport}
            submitLabel="Save Transport"
            submitColor="green"
          />
        }
      >
        {renderTransportFields(newTransport, setNewTransport)}
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Transport"
        icon={<Car size={20} className="text-blue-600" />}
        footer={
          <ModalActions
            onCancel={() => setShowEditModal(false)}
            onSubmit={updateTransport}
            submitLabel="Update Transport"
            submitColor="blue"
          />
        }
      >
        {renderTransportFields(editTransport, setEditTransport)}
      </Modal>
    </div>
  );
};

export default TransportList;

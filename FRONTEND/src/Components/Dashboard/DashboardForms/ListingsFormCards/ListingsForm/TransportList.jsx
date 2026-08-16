import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Car,
  Printer,
  SlidersHorizontal,
  X,
  ArrowUpDown,
} from "lucide-react";
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
import EmptyState from "../../../../UI/EmptyState";
import { useAuth } from "../../../../../context/AuthContext";
import { toUpper } from "../../../../../utils/text";
import { API_BASE_URL } from "../../../../../config/api";

const emptyFilters = {
  carTypes: [],
  tripTypes: [],
  capacity: "",
  route: "",
  agentName: "",
  minLuggage: "",
  minPrice: "",
  maxPrice: "",
  sortByPrice: "",
};

const TransportList = () => {
  const navigate = useNavigate();
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // New shape: route is a single string, tripType is "oneway" | "roundtrip"
  const [newTransport, setNewTransport] = useState({
    carType: "",
    capacity: "",
    tripType: "oneway",
    route: "",
    agentName: "",
    price: "",
    luggage: "",
  });

  const [editTransport, setEditTransport] = useState({
    _id: "",
    carType: "",
    capacity: "",
    tripType: "oneway",
    route: "",
    agentName: "",
    price: "",
    luggage: "",
  });

  // Vehicle master data (BASMA EMAAR PAKISTAN rate sheet) — selecting a car
  // type below auto-fills its known capacity/bags. "SUV" is kept for
  // editing pre-existing records that still use it.
  const VEHICLE_META = {
    SEDAN: { capacity: "2", luggage: "2" },
    "GMC YUKON XL 25 MODEL": { capacity: "6", luggage: "4" },
    STARIA: { capacity: "7", luggage: "4" },
    HIACE: { capacity: "9", luggage: "6" },
    COASTER: { capacity: "17", luggage: "10" },
    "BUS 20 MODEL": { capacity: "47", luggage: "20" },
    "BUS 25/26 MODEL": { capacity: "49", luggage: "25" },
  };
  const carTypes = ["SUV", ...Object.keys(VEHICLE_META)];

  const capacities = [
    "4 Seater",
    "6 Seater",
    "8 Seater",
    "12 Seater",
    "15 Seater",
    ...new Set(Object.values(VEHICLE_META).map((v) => v.capacity)),
  ];

  // Route options
  const oneWayRoutes = [
    "Makkah → Medinah",
    "Makkah → Jeddah",
    "Medinah → Makkah",
    "Medinah → Jeddah",
    "Jeddah → Medinah",
    "Jeddah → Makkah",
    "JEDDAH AIRPORT > MAKKAH HOTEL",
    "MAKKAH > MADINAH",
    "JEDDAH AIRPORT > MADINAH",
    "MAKKAH > JEDDAH AIRPORT",
    "MAKKAH > TAIF ZIYARAT",
    "MAKKAH HOTEL > MAKKAH TRAIN STATION",
    "MADINAH HOTEL > MADINAH TRAIN STATION",
    "MAKKAH > MADINAH VIA BADR - EXTRA CHARGES",
    "MADINAH AIRPORT > MAKKAH HOTEL",
    "TAIF AIRPORT > MAKKAH HOTEL",
  ];

  const roundTripRoutes = [
    "Jeddah → Makkah → Medinah → Medinah Airport",
    "Medinah Airport → Medinah Hotel → Makkah Hotel → Jeddah Airport",
    "Jeddah → Makkah → Medinah → Jeddah",
    "Jeddah → Medinah → Makkah → Jeddah",
    "Jeddah → Makkah → Medinah → Makkah → Jeddah",
    "MAKKAH & MADINAH ZIYARAT",
    "MADINAH AIRPORT <> MADINAH HOTEL",
    "JEDDAH AIRPORT <> JEDDAH CITY",
    "MAKKAH ZIYARAT WITH JOURANA",
  ];

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/transports`, {
        credentials: "include",
      });
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
        price: newTransport.price,
        luggage: newTransport.luggage,
      };

      const res = await fetch(`${API_BASE_URL}/transports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
          price: "",
          luggage: "",
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
      await fetch(`${API_BASE_URL}/transports/${id}`, {
        method: "DELETE",
        credentials: "include",
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
      price: item.price || "",
      luggage: item.luggage ?? "",
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
        price: editTransport.price,
        luggage: editTransport.luggage,
      };

      const res = await fetch(
        `${API_BASE_URL}/transports/${editTransport._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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

  // ---- Advanced filtering (client-side, combinable) ----
  const toggleFilterArray = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.capacity) count++;
    if (filters.route) count++;
    if (filters.agentName) count++;
    if (filters.minLuggage) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    count += filters.carTypes.length;
    count += filters.tripTypes.length;
    return count;
  }, [filters]);

  const filteredTransports = useMemo(() => {
    const list = transports.filter((t) => {
      if (filters.carTypes.length && !filters.carTypes.includes(t.carType))
        return false;
      if (filters.tripTypes.length && !filters.tripTypes.includes(t.tripType))
        return false;
      if (
        filters.capacity &&
        !String(t.capacity || "")
          .toLowerCase()
          .includes(filters.capacity.toLowerCase())
      )
        return false;
      if (
        filters.route &&
        !t.routeString?.toLowerCase().includes(filters.route.toLowerCase())
      )
        return false;
      if (
        filters.agentName &&
        !t.agentName?.toLowerCase().includes(filters.agentName.toLowerCase())
      )
        return false;
      if (filters.minLuggage && Number(t.luggage) < Number(filters.minLuggage))
        return false;
      if (filters.minPrice && Number(t.price) < Number(filters.minPrice))
        return false;
      if (filters.maxPrice && Number(t.price) > Number(filters.maxPrice))
        return false;
      return true;
    });

    if (filters.sortByPrice === "asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.sortByPrice === "desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return list;
  }, [transports, filters]);

  const clearFilters = () => setFilters(emptyFilters);

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
              onChange={(e) => {
                const selected = e.target.value;
                const meta = VEHICLE_META[selected];
                setData({
                  ...data,
                  carType: selected,
                  // Auto-fill known capacity/bags for this vehicle; still a
                  // plain editable select/input afterward, not locked.
                  ...(meta
                    ? { capacity: meta.capacity, luggage: meta.luggage }
                    : {}),
                });
              }}
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
                setData({ ...data, agentName: toUpper(e.target.value) })
              }
              className={inputClass}
            />
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

          <Field label="Luggage (Bags)" required>
            <input
              type="number"
              placeholder="0"
              value={data.luggage}
              onChange={(e) => setData({ ...data, luggage: e.target.value })}
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
              <Button
                variant="secondary"
                icon={SlidersHorizontal}
                onClick={() => setShowFilters((v) => !v)}
                className="lg:hidden"
              >
                Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
              </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* FILTER PANEL */}
        <aside
          className={`no-print min-w-0 ${showFilters ? "block" : "hidden"} lg:block`}
        >
          <div className="table-card p-5 lg:sticky lg:top-20 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-brand-600" />
                Filters
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer flex items-center gap-1"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            <Field label="Car Type">
              <div className="flex flex-wrap gap-1.5">
                {carTypes.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleFilterArray("carTypes", c)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      filters.carTypes.includes(c)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-surface-2 text-muted border-hair hover:border-brand-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Trip Type">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "oneway", label: "One Way" },
                  { value: "roundtrip", label: "Round Trip" },
                ].map((tt) => (
                  <button
                    key={tt.value}
                    type="button"
                    onClick={() => toggleFilterArray("tripTypes", tt.value)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      filters.tripTypes.includes(tt.value)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-surface-2 text-muted border-hair hover:border-brand-300"
                    }`}
                  >
                    {tt.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Capacity">
              <input
                type="text"
                placeholder="Search capacity..."
                value={filters.capacity}
                onChange={(e) =>
                  setFilters({ ...filters, capacity: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Route">
              <input
                type="text"
                placeholder="Search route..."
                value={filters.route}
                onChange={(e) =>
                  setFilters({ ...filters, route: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Agent Name">
              <input
                type="text"
                placeholder="Search agent..."
                value={filters.agentName}
                onChange={(e) =>
                  setFilters({ ...filters, agentName: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Min Bags">
              <input
                type="number"
                placeholder="e.g. 4"
                value={filters.minLuggage}
                onChange={(e) =>
                  setFilters({ ...filters, minLuggage: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Price Range">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className={inputClass}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </Field>

            <Field label="Sort by Price">
              <select
                value={filters.sortByPrice}
                onChange={(e) =>
                  setFilters({ ...filters, sortByPrice: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Default</option>
                <option value="asc">Cheapest first</option>
                <option value="desc">Most expensive first</option>
              </select>
            </Field>
          </div>
        </aside>

        {/* LISTING */}
        <div className="min-w-0">
          {/* PRINTABLE AREA */}
          <div id="print-area">
            {/* PRINT-ONLY HEADER */}
            <h1 className="print-header print:block hidden">Transport List</h1>

            {!loading && (
              <p className="no-print text-sm text-muted mb-3">
                Showing{" "}
                <span className="font-semibold text-ink">
                  {filteredTransports.length}
                </span>{" "}
                of {transports.length} transport options
                {filters.sortByPrice && (
                  <span className="inline-flex items-center gap-1 ml-2 text-brand-600 font-medium">
                    <ArrowUpDown size={13} />
                    {filters.sortByPrice === "asc"
                      ? "Cheapest first"
                      : "Most expensive first"}
                  </span>
                )}
              </p>
            )}

            {/* Table - Different styling for screen vs print */}
            <div className="table-card mt-2 print:shadow-none print:rounded-none print:border-0">
              <table className="data-table print-table">
                <thead>
                  <tr>
                    <th>Car Type</th>
                    <th>Capacity</th>
                    <th>Route</th>
                    <th>Agent Name</th>
                    <th>Price</th>
                    <th>Luggage (Bags)</th>
                    {isAdmin && <th className="no-print">Actions</th>}
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
                  ) : filteredTransports.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="p-0">
                        <EmptyState
                          icon={Car}
                          title="No transport found"
                          message="Try adjusting or clearing your filters."
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredTransports.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b hover:bg-gray-50 transition print:hover:bg-white"
                  >
                    <td className="py-3 px-4">{item.carType}</td>
                    <td className="py-3 px-4">{item.capacity}</td>
                    <td className="py-3 px-4">{item.routeString}</td>
                    <td className="py-3 px-4">{item.agentName}</td>
                    <td className="py-3 px-4">{item.price}</td>
                    <td className="py-3 px-4">{item.luggage}</td>

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

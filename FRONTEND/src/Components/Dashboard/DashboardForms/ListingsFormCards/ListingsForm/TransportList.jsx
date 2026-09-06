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
  Search,
  ChevronDown,
  ChevronUp,
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
import TransportRoutesMatrix from "./TransportRoutesMatrix";

// `route`/`agentName` were folded into the always-visible top Search box
// (below) — everything else stays a discrete "Filters" panel control.
const emptyFilters = {
  carTypes: [],
  tripTypes: [],
  capacity: "",
  minLuggage: "",
  minPrice: "",
  maxPrice: "",
};

const TransportList = () => {
  const navigate = useNavigate();
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  // Always-visible top-level controls, deliberately separate from the
  // collapsible Filters panel.
  const [search, setSearch] = useState("");
  const [sortByPrice, setSortByPrice] = useState("");

  // "list" = the existing flat listing (unchanged); "routes" = the new
  // company-wise rate matrix.
  const [viewMode, setViewMode] = useState("list");

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
  // type below auto-fills its known capacity/bags.
  const VEHICLE_META = {
    SEDAN: { capacity: "2", luggage: "2" },
    "GMC YUKON XL 25 MODEL": { capacity: "6", luggage: "4" },
    STARIA: { capacity: "7", luggage: "4" },
    HIACE: { capacity: "9", luggage: "6" },
    COASTER: { capacity: "17", luggage: "10" },
    "BUS 20 MODEL": { capacity: "47", luggage: "20" },
    "BUS 25/26 MODEL": { capacity: "49", luggage: "25" },
  };
  const carTypes = Object.keys(VEHICLE_META);

  const capacities = [
    "4 Seater",
    "6 Seater",
    "8 Seater",
    "12 Seater",
    "15 Seater",
    ...new Set(Object.values(VEHICLE_META).map((v) => v.capacity)),
  ];

  // Route options — only the proper CAPITAL-LETTER standard routes. The
  // old lowercase/arrow-style entries (e.g. "Makkah → Medinah") have been
  // removed from these selectable options; existing Transport records
  // using those strings are untouched.
  const oneWayRoutes = [
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

  // OPEN ADD MODAL — used by the Show Routes matrix to pre-fill a new rate
  // for the exact company/route/vehicle cell that was clicked. Opens the
  // same Add modal/flow as the "Add Transport" button; nothing about that
  // flow changes.
  const openAddModalWithPrefill = ({ agentName, route, carType, capacity, luggage }) => {
    // Same trip-type detection as openEditModal, below — otherwise a
    // roundtrip-only route (e.g. "MAKKAH & MADINAH ZIYARAT") would be
    // pre-filled while the Route dropdown is still showing oneway options,
    // which don't include it.
    const tripType = roundTripRoutes.includes(route) ? "roundtrip" : "oneway";
    setNewTransport({
      carType: carType || "",
      capacity: capacity || "",
      tripType,
      route: route || "",
      agentName: agentName || "",
      price: "",
      luggage: luggage || "",
    });
    setShowAddModal(true);
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

  // Car Type filter options are DYNAMIC — always exactly whatever carType
  // values actually exist in the live Transport data right now, so a
  // brand-new vehicle (e.g. "ABC") shows up here automatically with no
  // code change. "SUV" is explicitly filtered out as a safety net — it's
  // retired and should never resurface here even if a stray record exists.
  const carTypeFilterOptions = useMemo(
    () =>
      [...new Set(transports.map((t) => t.carType).filter(Boolean))]
        .filter((c) => c.trim().toUpperCase() !== "SUV")
        .sort(),
    [transports]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.capacity) count++;
    if (filters.minLuggage) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    count += filters.carTypes.length;
    count += filters.tripTypes.length;
    return count;
  }, [filters]);

  const filteredTransports = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = transports.filter((t) => {
      if (
        q &&
        !(
          t.routeString?.toLowerCase().includes(q) ||
          t.agentName?.toLowerCase().includes(q) ||
          t.carType?.toLowerCase().includes(q)
        )
      )
        return false;
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
      if (filters.minLuggage && Number(t.luggage) < Number(filters.minLuggage))
        return false;
      if (filters.minPrice && Number(t.price) < Number(filters.minPrice))
        return false;
      if (filters.maxPrice && Number(t.price) > Number(filters.maxPrice))
        return false;
      return true;
    });

    if (sortByPrice === "asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortByPrice === "desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return list;
  }, [transports, filters, search, sortByPrice]);

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

      <div className="no-print mb-6">
        <PageHeader
          title="Transport"
          subtitle="Vehicles, routes & trip pricing"
          icon={Car}
          onBack={handleBack}
          actions={
            viewMode === "list" ? (
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
            ) : null
          }
        />
      </div>

      {/* VIEW TOGGLE — "Show All Lists" is the existing flat listing,
          unchanged; "Show Routes" is the new company-wise rate matrix. */}
      <div className="no-print flex flex-wrap gap-2 mb-6">
        {[
          { key: "list", label: "Show All Lists" },
          { key: "routes", label: "Show Routes" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setViewMode(tab.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
              viewMode === tab.key
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-surface-2 text-muted border-hair hover:border-brand-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === "routes" && (
        <TransportRoutesMatrix
          transports={transports}
          isAdmin={isAdmin}
          onAddRate={openAddModalWithPrefill}
          onEditRate={openEditModal}
        />
      )}

      {viewMode === "list" && (
      <div className="space-y-4">
        {/* TOP BAR — Filters | Sort By | Search, in one row. No more left
            sidebar, so the table below gets the full page width. */}
        <div className="no-print flex flex-nowrap items-center gap-3">
          <Button
            variant="secondary"
            icon={SlidersHorizontal}
            iconRight={showFilters ? ChevronUp : ChevronDown}
            onClick={() => setShowFilters((v) => !v)}
            className="shrink-0"
          >
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </Button>

          <select
            value={sortByPrice}
            onChange={(e) => setSortByPrice(e.target.value)}
            className="shrink-0 w-40 rounded-xl border border-hair bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink cursor-pointer focus:border-brand-400 focus:bg-surface focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            <option value="">Sort: Default</option>
            <option value="asc">Cheapest First</option>
            <option value="desc">Most Expensive</option>
          </select>

          <div className="relative flex-1 min-w-40">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-soft pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search route, agent, or car type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        {/* COLLAPSIBLE FILTER PANEL — full width, only rendered when open. */}
        {showFilters && (
          <div className="no-print table-card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer flex items-center gap-1"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Field label="Car Type" className="sm:col-span-2 lg:col-span-4">
                <div className="flex flex-wrap gap-1.5">
                  {carTypeFilterOptions.map((c) => (
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

              {/* Trip Type, Capacity, and Min Bags kept in one tight
                  sub-grid so they read as a related group instead of being
                  stretched across the wide outer grid's gap-5 columns. */}
              <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
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
              </div>

              <Field label="Price Range" className="sm:col-span-2">
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
            </div>
          </div>
        )}

        {/* LISTING */}
        <div>
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
                {sortByPrice && (
                  <span className="inline-flex items-center gap-1 ml-2 text-brand-600 font-medium">
                    <ArrowUpDown size={13} />
                    {sortByPrice === "asc"
                      ? "Cheapest first"
                      : "Most expensive first"}
                  </span>
                )}
              </p>
            )}

            {/* Table - Different styling for screen vs print. Route wraps
                (inline style beats the shared .data-table nowrap rule)
                instead of forcing the whole table wider, which is what was
                pushing the last columns off-screen. */}
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
                    <td className="py-3 px-4 max-w-xs" style={{ whiteSpace: "normal" }}>
                      {item.routeString}
                    </td>
                    <td className="py-3 px-4">{item.agentName}</td>
                    <td className="py-3 px-4">{item.price}</td>
                    <td className="py-3 px-4">{item.luggage} KG</td>

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
      )}

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

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Train as TrainIcon,
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

const TRAIN_CLASSES = ["ECONOMY", "AC STANDARD", "AC SLEEPER", "BUSINESS", "FIRST CLASS"];

const emptyTrain = {
  trainName: "",
  route: "",
  departure: "",
  arrival: "",
  trainClass: "",
  agentName: "",
  price: "",
};

// `trainName`/`route`/`departure`/`arrival`/`agentName` were folded into
// the always-visible top Search box (below) — everything else stays a
// discrete "Filters" panel control.
const emptyFilters = {
  classes: [],
  minPrice: "",
  maxPrice: "",
};

const TrainList = () => {
  const navigate = useNavigate();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  // Always-visible top-level controls, deliberately separate from the
  // collapsible Filters panel.
  const [search, setSearch] = useState("");
  const [sortByPrice, setSortByPrice] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newTrain, setNewTrain] = useState({ ...emptyTrain });
  const [editTrain, setEditTrain] = useState({ _id: "", ...emptyTrain });

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/trains`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setTrains(data.data);
      else setTrains([]);
    } catch (err) {
      console.error("Error fetching trains:", err);
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const saveTrain = async () => {
    if (
      !newTrain.trainName ||
      !newTrain.route ||
      !newTrain.departure ||
      !newTrain.arrival ||
      !newTrain.trainClass ||
      !newTrain.price
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/trains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newTrain),
      });

      const data = await res.json();
      if (data.success) {
        alert("Train added successfully!");
        setShowAddModal(false);
        setNewTrain({ ...emptyTrain });
        fetchTrains();
      } else {
        console.error("Server response:", data);
        alert("Failed to add train. See console.");
      }
    } catch (err) {
      console.error("Error adding train:", err);
      alert("Error adding train. See console.");
    }
  };

  // DELETE
  const deleteTrain = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await fetch(`${API_BASE_URL}/trains/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchTrains();
    } catch (err) {
      console.error("Error deleting train:", err);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (item) => {
    setEditTrain({
      _id: item._id,
      trainName: item.trainName || "",
      route: item.route || "",
      departure: item.departure || "",
      arrival: item.arrival || "",
      trainClass: item.trainClass || "",
      agentName: item.agentName || "",
      price: item.price ?? "",
    });
    setShowEditModal(true);
  };

  // UPDATE
  const updateTrain = async () => {
    if (
      !editTrain.trainName ||
      !editTrain.route ||
      !editTrain.departure ||
      !editTrain.arrival ||
      !editTrain.trainClass ||
      !editTrain.price
    ) {
      alert("All required fields must be filled");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/trains/${editTrain._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editTrain),
      });

      const data = await res.json();
      if (data.success) {
        alert("Train updated!");
        setShowEditModal(false);
        fetchTrains();
      } else {
        console.error("Server response:", data);
        alert("Failed to update train. See console.");
      }
    } catch (err) {
      console.error("Error updating train:", err);
      alert("Error updating train. See console.");
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
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    count += filters.classes.length;
    return count;
  }, [filters]);

  const filteredTrains = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = trains.filter((t) => {
      if (
        q &&
        !(
          t.trainName?.toLowerCase().includes(q) ||
          t.route?.toLowerCase().includes(q) ||
          t.departure?.toLowerCase().includes(q) ||
          t.arrival?.toLowerCase().includes(q) ||
          t.agentName?.toLowerCase().includes(q)
        )
      )
        return false;
      if (filters.classes.length && !filters.classes.includes(t.trainClass))
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
  }, [trains, filters, search, sortByPrice]);

  const clearFilters = () => setFilters(emptyFilters);

  // Shared field set for both Add and Edit modals
  const renderTrainFields = (data, setData) => (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={<TrainIcon size={16} className="text-blue-600" />}>
          Train &amp; Route
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Train Name" required className="sm:col-span-2">
            <input
              type="text"
              placeholder="e.g. Tezgam Express"
              value={data.trainName}
              onChange={(e) =>
                setData({ ...data, trainName: toUpper(e.target.value) })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Route" required className="sm:col-span-2">
            <input
              type="text"
              placeholder="e.g. Karachi to Lahore"
              value={data.route}
              onChange={(e) =>
                setData({ ...data, route: toUpper(e.target.value) })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Departure" required>
            <input
              type="text"
              placeholder="e.g. Karachi Cantt"
              value={data.departure}
              onChange={(e) =>
                setData({ ...data, departure: toUpper(e.target.value) })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Arrival" required>
            <input
              type="text"
              placeholder="e.g. Lahore Junction"
              value={data.arrival}
              onChange={(e) =>
                setData({ ...data, arrival: toUpper(e.target.value) })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Class" required className="sm:col-span-2">
            <select
              value={data.trainClass}
              onChange={(e) => setData({ ...data, trainClass: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Class</option>
              {TRAIN_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
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
          title="Train"
          subtitle="Train routes, classes & fares"
          icon={TrainIcon}
          onBack={handleBack}
          actions={
            <>
              <Button variant="secondary" icon={Printer} onClick={handlePrint}>
                Print
              </Button>
              {isAdmin && (
                <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                  Add Train
                </Button>
              )}
            </>
          }
        />
      </div>

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
              placeholder="Search train, route, departure, arrival, or agent..."
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

              <Field label="Class" className="sm:col-span-2 lg:col-span-4">
                <div className="flex flex-wrap gap-1.5">
                  {TRAIN_CLASSES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleFilterArray("classes", c)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        filters.classes.includes(c)
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-surface-2 text-muted border-hair hover:border-brand-300"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
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
            <h1 className="print-header print:block hidden">Train List</h1>

            {!loading && (
              <p className="no-print text-sm text-muted mb-3">
                Showing{" "}
                <span className="font-semibold text-ink">
                  {filteredTrains.length}
                </span>{" "}
                of {trains.length} trains
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

            {/* Table - Different styling for screen vs print */}
            <div className="table-card mt-2 print:shadow-none print:rounded-none print:border-0">
              <table className="data-table print-table">
                <thead>
                  <tr>
                    <th>Train Name</th>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Class</th>
                    <th>Agent Name</th>
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
                  ) : filteredTrains.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="p-0">
                        <EmptyState
                          icon={TrainIcon}
                          title="No trains found"
                          message="Try adjusting or clearing your filters."
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredTrains.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b hover:bg-gray-50 transition print:hover:bg-white"
                      >
                        <td className="py-3 px-4">{item.trainName}</td>
                        <td className="py-3 px-4">{item.route}</td>
                        <td className="py-3 px-4">{item.departure}</td>
                        <td className="py-3 px-4">{item.arrival}</td>
                        <td className="py-3 px-4">{item.trainClass}</td>
                        <td className="py-3 px-4">{item.agentName}</td>
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
                              onClick={() => deleteTrain(item._id)}
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
        title="Add Train"
        icon={<TrainIcon size={20} className="text-blue-600" />}
        footer={
          <ModalActions
            onCancel={() => setShowAddModal(false)}
            onSubmit={saveTrain}
            submitLabel="Save Train"
            submitColor="green"
          />
        }
      >
        {renderTrainFields(newTrain, setNewTrain)}
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Train"
        icon={<TrainIcon size={20} className="text-blue-600" />}
        footer={
          <ModalActions
            onCancel={() => setShowEditModal(false)}
            onSubmit={updateTrain}
            submitLabel="Update Train"
            submitColor="blue"
          />
        }
      >
        {renderTrainFields(editTrain, setEditTrain)}
      </Modal>
    </div>
  );
};

export default TrainList;

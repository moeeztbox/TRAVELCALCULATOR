import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
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

const ROOM_TYPES = ["single", "double", "triple", "quad", "sharing"];
const CATEGORIES = ["5-star", "4-star", "3-star", "2-star", "1-star"];

const emptyRoomTypeSelections = () =>
  ROOM_TYPES.reduce(
    (acc, t) => ({ ...acc, [t]: { checked: false, price: "" } }),
    {}
  );

const emptyHotelBase = {
  hotelName: "",
  category: "",
  agentName: "",
  area: "",
  city: "",
  distance: "",
  address: "",
};

const emptyFilters = {
  hotelName: "",
  agentName: "",
  area: "",
  city: "",
  categories: [],
  roomTypes: [],
  maxDistance: "",
  minPrice: "",
  maxPrice: "",
  sortByPrice: "",
};

const HotelList = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [newHotel, setNewHotel] = useState(emptyHotelBase);
  const [roomTypeSelections, setRoomTypeSelections] = useState(
    emptyRoomTypeSelections()
  );

  const [editHotel, setEditHotel] = useState({
    _id: "",
    ...emptyHotelBase,
    roomType: "",
    price: "",
  });

  const [filters, setFilters] = useState(emptyFilters);

  // Fetch hotels
  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/hotels", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setHotels(data.data);
      } else {
        setHotels([]);
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomType = (type) => {
    setRoomTypeSelections((prev) => ({
      ...prev,
      [type]: { ...prev[type], checked: !prev[type].checked },
    }));
  };

  const setRoomTypePrice = (type, price) => {
    setRoomTypeSelections((prev) => ({
      ...prev,
      [type]: { ...prev[type], price },
    }));
  };

  const saveHotel = async () => {
    const selectedTypes = ROOM_TYPES.filter(
      (t) => roomTypeSelections[t].checked
    );

    if (
      !newHotel.hotelName ||
      !newHotel.category ||
      !newHotel.agentName ||
      !newHotel.city ||
      selectedTypes.length === 0
    ) {
      alert(
        "Please fill all required fields and select at least one room type"
      );
      return;
    }

    if (selectedTypes.some((t) => !roomTypeSelections[t].price)) {
      alert("Please enter a price for every selected room type");
      return;
    }

    const roomTypes = selectedTypes.map((t) => ({
      roomType: t,
      price: roomTypeSelections[t].price,
    }));

    try {
      const res = await fetch("http://localhost:5000/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...newHotel, roomTypes }),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message || "Hotel added successfully!");
        setShowAddModal(false);
        setNewHotel(emptyHotelBase);
        setRoomTypeSelections(emptyRoomTypeSelections());
        fetchHotels();
      } else {
        alert(data.message || "Error adding hotel");
      }
    } catch (err) {
      console.error("Error adding hotel:", err);
      alert("Error adding hotel");
    }
  };

  const deleteHotel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/hotels/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        alert("Hotel deleted successfully!");
        fetchHotels();
      } else {
        alert(data.message || "Error deleting hotel");
      }
    } catch (err) {
      console.error("Error deleting hotel:", err);
      alert("Error deleting hotel");
    }
  };

  const openEditModal = (hotel) => {
    setEditHotel(hotel);
    setShowEditModal(true);
  };

  const updateHotel = async () => {
    if (
      !editHotel.hotelName ||
      !editHotel.category ||
      !editHotel.roomType ||
      !editHotel.agentName ||
      !editHotel.price
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/hotels/${editHotel._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(editHotel),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Hotel updated successfully!");
        setShowEditModal(false);
        fetchHotels();
      } else {
        alert(data.message || "Error updating hotel");
      }
    } catch (err) {
      console.error("Error updating hotel:", err);
      alert("Error updating hotel");
    }
  };

  const handleBack = () => {
    navigate("/dashboard/listings");
  };

  // ROLE CHECK
  const { isAdmin } = useAuth();

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
    if (filters.hotelName) count++;
    if (filters.agentName) count++;
    if (filters.area) count++;
    if (filters.city) count++;
    if (filters.maxDistance) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    count += filters.categories.length;
    count += filters.roomTypes.length;
    return count;
  }, [filters]);

  const filteredHotels = useMemo(() => {
    const list = hotels.filter((h) => {
      if (
        filters.hotelName &&
        !h.hotelName?.toLowerCase().includes(filters.hotelName.toLowerCase())
      )
        return false;
      if (
        filters.agentName &&
        !h.agentName?.toLowerCase().includes(filters.agentName.toLowerCase())
      )
        return false;
      if (
        filters.area &&
        !h.area?.toLowerCase().includes(filters.area.toLowerCase())
      )
        return false;
      if (filters.city && h.city !== filters.city) return false;
      if (filters.categories.length && !filters.categories.includes(h.category))
        return false;
      if (filters.roomTypes.length && !filters.roomTypes.includes(h.roomType))
        return false;
      if (filters.maxDistance && Number(h.distance) > Number(filters.maxDistance))
        return false;
      if (filters.minPrice && Number(h.price) < Number(filters.minPrice))
        return false;
      if (filters.maxPrice && Number(h.price) > Number(filters.maxPrice))
        return false;
      return true;
    });

    if (filters.sortByPrice === "asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.sortByPrice === "desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return list;
  }, [hotels, filters]);

  const clearFilters = () => setFilters(emptyFilters);

  // Shared field set for both Add and Edit modals (hotel-level details)
  const renderSharedFields = (data, setData) => (
    <>
      <Field label="Hotel Name" required className="sm:col-span-2">
        <input
          type="text"
          placeholder="e.g. Hilton Makkah"
          value={data.hotelName}
          onChange={(e) =>
            setData({ ...data, hotelName: toUpper(e.target.value) })
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
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </Field>

      <Field label="City" required>
        <select
          value={data.city}
          onChange={(e) => setData({ ...data, city: e.target.value })}
          className={inputClass}
        >
          <option value="">Select City</option>
          <option value="Makkah">Makkah</option>
          <option value="Madinah">Madinah</option>
        </select>
      </Field>

      <Field label="Area">
        <input
          type="text"
          placeholder="e.g. Ajyad"
          value={data.area}
          onChange={(e) =>
            setData({ ...data, area: toUpper(e.target.value) })
          }
          className={inputClass}
        />
      </Field>

      <Field label="Distance from Haram (m)">
        <input
          type="number"
          placeholder="e.g. 250"
          value={data.distance}
          onChange={(e) => setData({ ...data, distance: e.target.value })}
          className={inputClass}
        />
      </Field>

      <Field label="Address" className="sm:col-span-2">
        <input
          type="text"
          placeholder="Full hotel address"
          value={data.address}
          onChange={(e) =>
            setData({ ...data, address: toUpper(e.target.value) })
          }
          className={inputClass}
        />
      </Field>
    </>
  );

  const renderAgentFields = (data, setData) => (
    <>
      <Field label="Agent Name" required className="sm:col-span-2">
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
    </>
  );

  // ADD form: room types as a checklist, price appears once checked
  const renderAddFields = () => (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={<Building2 size={16} className="text-blue-600" />}>
          Hotel Information
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderSharedFields(newHotel, setNewHotel)}
        </div>
      </div>

      <div>
        <SectionTitle>Room Types &amp; Pricing</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROOM_TYPES.map((type) => {
            const sel = roomTypeSelections[type];
            return (
              <div
                key={type}
                className={`rounded-xl border p-3 transition-colors ${
                  sel.checked
                    ? "border-brand-300 bg-brand-50"
                    : "border-hair bg-surface-2"
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sel.checked}
                    onChange={() => toggleRoomType(type)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <span className="text-sm font-semibold text-ink capitalize">
                    {type}
                  </span>
                </label>
                {sel.checked && (
                  <input
                    type="number"
                    placeholder={`${type.charAt(0).toUpperCase()}${type.slice(
                      1
                    )} price`}
                    value={sel.price}
                    onChange={(e) => setRoomTypePrice(type, e.target.value)}
                    className={`${inputClass} mt-2.5`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle>Pricing &amp; Agent</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderAgentFields(newHotel, setNewHotel)}
        </div>
      </div>
    </div>
  );

  // EDIT form: keeps single room-type editing (one row = one document)
  const renderEditFields = () => (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={<Building2 size={16} className="text-blue-600" />}>
          Hotel Information
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderSharedFields(editHotel, setEditHotel)}

          <Field label="Room Type" required>
            <select
              value={editHotel.roomType}
              onChange={(e) =>
                setEditHotel({ ...editHotel, roomType: e.target.value })
              }
              className={inputClass}
            >
              <option value="">Select Room Type</option>
              {ROOM_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Price (per night)" required>
            <input
              type="number"
              placeholder="0"
              value={editHotel.price}
              onChange={(e) =>
                setEditHotel({ ...editHotel, price: e.target.value })
              }
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Pricing &amp; Agent</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderAgentFields(editHotel, setEditHotel)}
        </div>
      </div>
    </div>
  );

  const colSpan = isAdmin ? 7 : 6;

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

            /* Remove all background colors and shadows */
            * {
              background: white !important;
              box-shadow: none !important;
            }

            /* Remove border radius */
            .rounded-xl, .rounded-lg, .rounded {
              border-radius: 0 !important;
            }

            /* Print in landscape with tight margins — the Hotel table has
               11 columns, and portrait simply isn't wide enough for them
               to fit on one page. */
            @page {
              size: landscape;
              margin: 8mm;
            }

            /* Professional table styling for print only.
               table-layout: fixed forces the browser to distribute the
               page's width across all columns instead of sizing each
               column by its content (which is what caused columns to
               overflow past the page edge). Combined with the smaller
               font/padding below and word-wrap (overriding the on-screen
               nowrap), every column now fits — long values wrap onto a
               second line inside their own column instead of pushing the
               table wider than the page. */
            .print-table {
              width: 100%;
              table-layout: fixed;
              border-collapse: collapse;
              border: 1px solid #000 !important;
            }

            .print-table th,
            .print-table td {
              border: 1px solid #000 !important;
              padding: 5px 4px !important;
              background: white !important;
              font-size: 8.5px;
              line-height: 1.25;
              vertical-align: middle;
              text-align: left;
              white-space: normal !important;
              word-break: break-word;
              overflow-wrap: break-word;
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

      {/* HEADER */}
      <div className="no-print mb-8">
        <PageHeader
          title="Hotels"
          subtitle="Manage your hotel inventory & rates"
          icon={Building2}
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
                  Add Hotel
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

            <Field label="Hotel Name">
              <input
                type="text"
                placeholder="Search hotel..."
                value={filters.hotelName}
                onChange={(e) =>
                  setFilters({ ...filters, hotelName: e.target.value })
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

            <Field label="Area">
              <input
                type="text"
                placeholder="Search area..."
                value={filters.area}
                onChange={(e) =>
                  setFilters({ ...filters, area: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="City">
              <select
                value={filters.city}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Any city</option>
                <option value="Makkah">Makkah</option>
                <option value="Madinah">Madinah</option>
              </select>
            </Field>

            <Field label="Category">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleFilterArray("categories", cat)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                      filters.categories.includes(cat)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-surface-2 text-muted border-hair hover:border-brand-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Room Type">
              <div className="flex flex-wrap gap-1.5">
                {ROOM_TYPES.map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => toggleFilterArray("roomTypes", rt)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border capitalize transition-colors cursor-pointer ${
                      filters.roomTypes.includes(rt)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-surface-2 text-muted border-hair hover:border-brand-300"
                    }`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Max Distance (m)">
              <input
                type="number"
                placeholder="e.g. 500"
                value={filters.maxDistance}
                onChange={(e) =>
                  setFilters({ ...filters, maxDistance: e.target.value })
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
            <h1 className="print-header print:block hidden">Hotels List</h1>

            {!loading && (
              <p className="no-print text-sm text-muted mb-3">
                Showing <span className="font-semibold text-ink">{filteredHotels.length}</span> of{" "}
                {hotels.length} hotels
                {filters.sortByPrice && (
                  <span className="inline-flex items-center gap-1 ml-2 text-brand-600 font-medium">
                    <ArrowUpDown size={13} />
                    {filters.sortByPrice === "asc" ? "Cheapest first" : "Most expensive first"}
                  </span>
                )}
              </p>
            )}

            {/* TABLE - Different styling for screen vs print */}
            <div className="table-card mt-2 print:shadow-none print:rounded-none print:border-0">
              <table className="data-table print-table">
                <thead>
                  <tr>
                    <th>Hotel Name</th>
                    <th>Category</th>
                    <th>Room Type</th>
                    <th>Area</th>
                    <th>City</th>
                    <th>Address</th>
                    <th>Distance (m)</th>
                    <th>Agent Name</th>
                    <th>Price</th>
                    {isAdmin && <th className="no-print">Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={colSpan}
                        className="py-4 px-4 text-center text-gray-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filteredHotels.length === 0 ? (
                    <tr>
                      <td colSpan={colSpan} className="p-0">
                        <EmptyState
                          icon={Building2}
                          title="No hotels found"
                          message="Try adjusting or clearing your filters."
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredHotels.map((hotel) => (
                      <tr
                        key={hotel._id}
                        className="border-b hover:bg-gray-50 transition print:hover:bg-white"
                      >
                        <td className="py-3 px-4">{hotel.hotelName}</td>
                        <td className="py-3 px-4">{hotel.category}</td>
                        <td className="py-3 px-4 capitalize">{hotel.roomType}</td>
                        <td className="py-3 px-4">{hotel.area}</td>
                        <td className="py-3 px-4">{hotel.city}</td>
                        <td className="py-3 px-4">{hotel.address || "-"}</td>
                        <td className="py-3 px-4">{hotel.distance}</td>
                        <td className="py-3 px-4">{hotel.agentName}</td>
                        <td className="py-3 px-4">{hotel.price}</td>

                        {isAdmin && (
                          <td className="py-3 px-4 flex items-center gap-4 no-print">
                            <button
                              onClick={() => openEditModal(hotel)}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              <Pencil size={20} />
                            </button>

                            <button
                              onClick={() => deleteHotel(hotel._id)}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
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

      {/* ADD HOTEL MODAL */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Hotel"
        icon={<Building2 size={20} className="text-blue-600" />}
        maxWidth="max-w-2xl"
        footer={
          <ModalActions
            onCancel={() => setShowAddModal(false)}
            onSubmit={saveHotel}
            submitLabel="Save Hotel"
            submitColor="green"
          />
        }
      >
        {renderAddFields()}
      </Modal>

      {/* EDIT HOTEL MODAL */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Hotel"
        icon={<Building2 size={20} className="text-blue-600" />}
        footer={
          <ModalActions
            onCancel={() => setShowEditModal(false)}
            onSubmit={updateHotel}
            submitLabel="Update Hotel"
            submitColor="blue"
          />
        }
      >
        {renderEditFields()}
      </Modal>
    </div>
  );
};

export default HotelList;

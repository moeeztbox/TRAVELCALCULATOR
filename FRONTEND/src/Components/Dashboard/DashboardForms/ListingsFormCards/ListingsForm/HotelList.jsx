import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../../Main/Modal";
import {
  Field,
  inputClass,
  SectionTitle,
  ModalActions,
} from "../../../../Main/FormControls";
import { useAuth } from "../../../../../context/AuthContext";

const HotelList = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newHotel, setNewHotel] = useState({
    hotelName: "",
    category: "",
    roomType: "",
    agentName: "",
    agentCost: "",
    companyCost: "",
    price: "",
    area: "",
    city: "",
    distance: "",
  });

  const [editHotel, setEditHotel] = useState({
    _id: "",
    hotelName: "",
    category: "",
    roomType: "",
    agentName: "",
    agentCost: "",
    companyCost: "",
    price: "",
    area: "",
    city: "",
    distance: "",
  });

  const categories = ["5-star", "4-star", "3-star", "2-star", "1-star"];
  const roomTypes = ["sharing", "quad", "double", "single"];

  // Fetch hotels
  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/hotels");
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

  const saveHotel = async () => {
    if (
      !newHotel.hotelName ||
      !newHotel.category ||
      !newHotel.roomType ||
      !newHotel.agentName ||
      !newHotel.price
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHotel),
      });

      const data = await res.json();

      if (data.success) {
        alert("Hotel added successfully!");
        setShowAddModal(false);
        setNewHotel({
          hotelName: "",
          category: "",
          roomType: "",
          agentName: "",
          agentCost: "",
          companyCost: "",
          price: "",
        });
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

  // Shared field set for both Add and Edit modals
  const renderHotelFields = (data, setData) => (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={<Building2 size={16} className="text-blue-600" />}>
          Hotel Information
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Hotel Name" required className="sm:col-span-2">
            <input
              type="text"
              placeholder="e.g. Hilton Makkah"
              value={data.hotelName}
              onChange={(e) => setData({ ...data, hotelName: e.target.value })}
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Room Type" required>
            <select
              value={data.roomType}
              onChange={(e) => setData({ ...data, roomType: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Room Type</option>
              {roomTypes.map((rt) => (
                <option key={rt} value={rt}>
                  {rt}
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
              onChange={(e) => setData({ ...data, area: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Distance from Haram (m)" className="sm:col-span-2">
            <input
              type="number"
              placeholder="e.g. 250"
              value={data.distance}
              onChange={(e) => setData({ ...data, distance: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Pricing &amp; Agent</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Agent Name" required className="sm:col-span-2">
            <input
              type="text"
              placeholder="Agent name"
              value={data.agentName}
              onChange={(e) => setData({ ...data, agentName: e.target.value })}
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

          <Field label="Price (per night)" required className="sm:col-span-2">
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

      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="no-print flex items-center cursor-pointer gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-3xl font-extrabold text-gray-900">Hotels List</h1>

        <div className="flex gap-2">
          {/* PRINT BUTTON */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition cursor-pointer no-print"
          >
            Print
          </button>

          {/* SHOW ADD BUTTON ONLY FOR ADMIN */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex cursor-pointer items-center gap-2 bg-blue-600 text-white px-4 py-2 
              rounded-lg shadow hover:bg-blue-700 transition no-print"
            >
              <Plus size={20} />
              Add
            </button>
          )}
        </div>
      </div>

      {/* PRINTABLE AREA */}
      <div id="print-area">
        {/* PRINT-ONLY HEADER */}
        <h1 className="print-header print:block hidden">Hotels List</h1>

        {/* TABLE - Different styling for screen vs print */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden mt-6 print:shadow-none print:rounded-none">
          <table className="w-full text-left print-table">
            <thead className="bg-gray-100 text-gray-700 print:bg-white">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold">Hotel Name</th>
                <th className="py-3 px-4 text-sm font-semibold">Category</th>
                <th className="py-3 px-4 text-sm font-semibold">Room Type</th>
                <th className="py-3 px-4 text-sm font-semibold">Area</th>
                <th className="py-3 px-4 text-sm font-semibold">City</th>
                <th className="py-3 px-4 text-sm font-semibold">
                  Distance (m)
                </th>
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
              ) : hotels.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : 7}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No hotels found.
                  </td>
                </tr>
              ) : (
                hotels.map((hotel) => (
                  <tr
                    key={hotel._id}
                    className="border-b hover:bg-gray-50 transition print:hover:bg-white"
                  >
                    <td className="py-3 px-4">{hotel.hotelName}</td>
                    <td className="py-3 px-4">{hotel.category}</td>
                    <td className="py-3 px-4">{hotel.roomType}</td>
                    <td className="py-3 px-4">{hotel.area}</td>
                    <td className="py-3 px-4">{hotel.city}</td>
                    <td className="py-3 px-4">{hotel.distance}</td>
                    <td className="py-3 px-4">{hotel.agentName}</td>
                    <td className="py-3 px-4">{hotel.agentCost}</td>
                    <td className="py-3 px-4">{hotel.companyCost}</td>
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

      {/* ADD HOTEL MODAL */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Hotel"
        icon={<Building2 size={20} className="text-blue-600" />}
        footer={
          <ModalActions
            onCancel={() => setShowAddModal(false)}
            onSubmit={saveHotel}
            submitLabel="Save Hotel"
            submitColor="green"
          />
        }
      >
        {renderHotelFields(newHotel, setNewHotel)}
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
        {renderHotelFields(editHotel, setEditHotel)}
      </Modal>
    </div>
  );
};

export default HotelList;

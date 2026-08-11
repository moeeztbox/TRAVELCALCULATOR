import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Building2,
  Calculator,
  Printer,
  Trash2,
  MapPin,
  Navigation,
} from "lucide-react";
import PageHeader from "../../UI/PageHeader";
import Button from "../../UI/Button";
import Combobox from "../../UI/Combobox";
import logo from "../../../Assets/logo-mark.png";

const COMPANY_NAME = "AlBuraq Global Travel & Tours";
const COMPANY_WEBSITE = "www.alburaqtours.com";
const COMPANY_ADDRESS =
  "Plaza No. 54, Block A, Commercial Area, Eden City, DHA Phase 8";
const COMPANY_PHONES = ["0321-4440467", "0327-3276060", "0316-9214727"];

// Defined at module scope (not inside the component) so its identity stays
// stable across renders — defining a component inside another component's
// body creates a brand-new function every render, which makes React
// unmount/remount the whole subtree (and any input inside it) on every
// keystroke, destroying focus.
const FieldWrapper = ({ children, className = "" }) => (
  <div className={`space-y-1 ${className}`}>{children}</div>
);

export default function HotelCalculator() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [hotelName, setHotelName] = useState("");
  const [category, setCategory] = useState("");
  const [roomType, setRoomType] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentCost, setAgentCost] = useState("");
  const [companyCost, setCompanyCost] = useState("");
  const [price, setPrice] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [clientName, setClientName] = useState("");
  const [result, setResult] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);

  // New fields for location
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [distance, setDistance] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/hotels", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setHotels(data.data);
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
    }
  };

  // Unique hotels by name, for the searchable combobox
  const uniqueHotelOptions = hotels
    .filter(
      (hotel, index, self) =>
        index === self.findIndex((h) => h.hotelName === hotel.hotelName)
    )
    .map((hotel) => ({ value: hotel.hotelName, label: hotel.hotelName }));

  const resetSelection = () => {
    setHotelName("");
    setCategory("");
    setRoomType("");
    setAgentName("");
    setAgentCost("");
    setCompanyCost("");
    setPrice("");
    setCity("");
    setArea("");
    setDistance("");
    setAddress("");
    setAvailableRoomTypes([]);
  };

  const handleHotelSelect = (selectedHotelName) => {
    if (!selectedHotelName) {
      resetSelection();
      return;
    }

    const hotel = hotels.find((h) => h.hotelName === selectedHotelName);
    if (!hotel) return;

    setHotelName(hotel.hotelName);
    setCategory(hotel.category);
    setAgentName(hotel.agentName);
    setCity(hotel.city || "");
    setArea(hotel.area || "");
    setDistance(hotel.distance || "");
    setAddress(hotel.address || "");

    // Reset room type when hotel changes
    setRoomType("");

    // Get all room types available for this hotel
    // First, get all hotels with this name (same hotel can have multiple room types)
    const hotelsWithSameName = hotels.filter(
      (h) => h.hotelName === hotel.hotelName
    );

    // Extract unique room types from these hotels
    const uniqueRoomTypes = [
      ...new Set(hotelsWithSameName.map((h) => h.roomType)),
    ];
    setAvailableRoomTypes(uniqueRoomTypes);

    // Set default values from the selected hotel (will update when room type is selected)
    setAgentCost(hotel.agentCost);
    setCompanyCost(hotel.companyCost);
    setPrice(hotel.price);
  };

  const handleRoomTypeSelect = (selectedRoomType) => {
    setRoomType(selectedRoomType);

    // Find the specific hotel with selected room type to get correct pricing
    const selectedHotel = hotels.find(
      (h) => h.hotelName === hotelName && h.roomType === selectedRoomType
    );

    if (selectedHotel) {
      setAgentCost(selectedHotel.agentCost);
      setCompanyCost(selectedHotel.companyCost);
      setPrice(selectedHotel.price);
      setCity(selectedHotel.city || "");
      setArea(selectedHotel.area || "");
      setDistance(selectedHotel.distance || "");
      setAddress(selectedHotel.address || "");
    }
  };

  const calculate = () => {
    if (!hotelName || !roomType || !checkIn || !checkOut || !price) {
      alert("Please fill all required fields!");
      return;
    }

    const nights =
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    if (nights <= 0) {
      alert("Checkout date must be after check-in date!");
      return;
    }

    const perNightPrice = parseFloat(price);
    const agentCostPerNight = parseFloat(agentCost);
    const companyCostPerNight = parseFloat(companyCost);

    // Calculate all costs
    const totalNightsPrice = perNightPrice * nights;
    const totalAgentCost = agentCostPerNight * nights;
    const totalCompanyCost = companyCostPerNight * nights;
    const totalFinalCost = totalNightsPrice + totalAgentCost + totalCompanyCost;

    setResult({
      // Client
      clientName,

      // Basic information
      hotelName,
      category,
      roomType,
      agentName,

      // Location information
      city,
      area,
      distance,
      address,

      // Per night costs
      perNightPrice,
      agentCost: agentCostPerNight,
      companyCost: companyCostPerNight,

      // Stay information
      checkIn,
      checkOut,
      totalNights: nights,

      // Total calculations
      totalNightsPrice,
      totalAgentCost,
      totalCompanyCost,
      totalFinalCost,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const clearForm = () => {
    resetSelection();
    setCheckIn("");
    setCheckOut("");
    setClientName("");
    setResult(null);
  };

  return (
    <div className="calc">
      {/* PRINT CSS — page-specific only; the app shell (sidebar/topbar/
          footer) is handled globally in index.css. Only the dedicated
          report block prints; the on-screen working view (including the
          internal agent/company cost breakdown) is hidden from print
          entirely. */}
      <style>
        {`
          @media print {
            #hotel-print-report {
              display: block !important;
              max-width: 720px;
              margin: 0 auto;
            }
          }
          #hotel-print-report { display: none; }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 no-print">
          <PageHeader
            title="Hotel Calculator"
            subtitle="Calculate hotel costs and commissions"
            icon={Building2}
            onBack={() => navigate("/dashboard")}
          />
        </div>

        {/* Input Section */}
        <div className="space-y-2 no-print">
          <div className="calc-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Hotel Selection — searchable combobox */}
              <FieldWrapper className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Hotel
                </label>
                <Combobox
                  options={uniqueHotelOptions}
                  value={hotelName}
                  onChange={handleHotelSelect}
                  placeholder="Type to search hotels..."
                />
              </FieldWrapper>

              {/* Room Type Selection - Always visible */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Room Type
                </label>
                <select
                  className={`w-full p-3 border rounded-lg focus:ring-1 focus:ring-blue-500 ${
                    hotelName
                      ? "border-gray-300 bg-white focus:border-blue-500"
                      : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  }`}
                  value={roomType}
                  onChange={(e) => handleRoomTypeSelect(e.target.value)}
                  disabled={!hotelName}
                >
                  <option value="">
                    {hotelName ? "Select room type" : "Select hotel first"}
                  </option>
                  {availableRoomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {!hotelName && (
                  <p className="text-xs text-gray-400 mt-1">
                    Select a hotel first to see available room types
                  </p>
                )}
              </FieldWrapper>

              {/* Dates */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Check-in Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </FieldWrapper>

              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Check-out Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </FieldWrapper>

              {/* Client Name */}
              <FieldWrapper className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Client Name
                </label>
                <input
                  type="text"
                  placeholder="Enter client name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value.toUpperCase())}
                />
              </FieldWrapper>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button fullWidth size="lg" icon={Calculator} onClick={calculate}>
                Calculate Costs
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="secondary"
                icon={Trash2}
                onClick={clearForm}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="calc-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calculator size={20} className="text-green-600" />
                  Calculation Results
                </h2>
                <Button variant="success" icon={Printer} onClick={handlePrint}>
                  Print Report
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Hotel Details & Stay Information */}
                <div className="space-y-6">
                  {/* Hotel Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Hotel Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Hotel Name</span>
                        <span className="font-medium text-right">
                          {result.hotelName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Category</span>
                        <span className="font-medium">{result.category}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Room Type</span>
                        <span className="font-medium">{result.roomType}</span>
                      </div>
                      {result.address && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">Address</span>
                          <span className="font-medium text-right max-w-xs">
                            {result.address}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Agent Name</span>
                        <span className="font-medium">{result.agentName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      Location Information
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">City:</span>
                        <span className="font-medium">{result.city}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium">{result.area}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Navigation size={14} />
                          Distance from Center:
                        </span>
                        <span className="font-medium">
                          {result.distance} m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stay Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Stay Information
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Check-in Date:</span>
                        <span className="font-medium">{result.checkIn}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Check-out Date:</span>
                        <span className="font-medium">{result.checkOut}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Nights:</span>
                        <span className="font-medium text-lg">
                          {result.totalNights} night
                          {result.totalNights !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Cost Breakdown */}
                <div className="space-y-6">
                  {/* Per Night Costs */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Per Night Costs
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Price per night</span>
                        <span className="font-medium">
                          ${result.perNightPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Agent cost per night
                        </span>
                        <span className="font-medium text-orange-600">
                          ${result.agentCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">
                          Company cost per night
                        </span>
                        <span className="font-medium text-purple-600">
                          ${result.companyCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Costs */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Total Costs
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Total nights price
                        </span>
                        <span className="font-medium">
                          ${result.totalNightsPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Total agent cost</span>
                        <span className="font-medium text-red-600">
                          ${result.totalAgentCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Total company cost
                        </span>
                        <span className="font-medium text-green-600">
                          ${result.totalCompanyCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3 mt-4">
                        <span className="text-gray-700 font-semibold">
                          Total final cost
                        </span>
                        <span className="font-bold text-lg text-blue-700">
                          ${result.totalFinalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && (
            <div className="calc-card p-8 text-center">
              <Calculator size={48} className="mx-auto text-brand-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No Calculation Yet
              </h3>
              <p className="text-sm text-gray-400">
                Select a hotel, choose room type, set dates, then click
                "Calculate Costs" to see results
              </p>
            </div>
          )}
        </div>

        {/* ============ PROFESSIONAL PRINT-ONLY REPORT ============ */}
        {result && (
          <div id="hotel-print-report">
            {/* Header — first (and only) page */}
            <div
              style={{
                textAlign: "center",
                borderBottom: "2px solid #000",
                paddingBottom: "16px",
                marginBottom: "24px",
              }}
            >
              <img
                src={logo}
                alt="AlBuraq Global"
                style={{ width: "64px", height: "64px", margin: "0 auto 8px" }}
              />
              <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>
                {COMPANY_NAME}
              </h1>
              <p style={{ fontSize: "14px", marginTop: "10px" }}>
                <strong>Report Title:</strong> Hotel Booking Cost Report
              </p>
              <p style={{ fontSize: "14px" }}>
                <strong>Client Name:</strong> {result.clientName || "N/A"}
              </p>
            </div>

            {/* Body — customer-facing details only, no internal cost breakdown */}
            <div style={{ fontSize: "13px" }}>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  borderBottom: "1px solid #000",
                  paddingBottom: "4px",
                }}
              >
                Hotel &amp; Stay Details
              </h2>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                }}
              >
                <tbody>
                  {[
                    ["Hotel Name", result.hotelName],
                    ["Category", result.category],
                    ["Room Type", result.roomType],
                    ["Address", result.address || "N/A"],
                    ["City", result.city],
                    ["Area", result.area],
                    ["Distance from Center", `${result.distance} m`],
                    ["Check-in Date", result.checkIn],
                    ["Check-out Date", result.checkOut],
                    [
                      "Total Nights",
                      `${result.totalNights} night${
                        result.totalNights !== 1 ? "s" : ""
                      }`,
                    ],
                  ].map(([label, val]) => (
                    <tr key={label}>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "8px 10px",
                          fontWeight: "bold",
                          width: "40%",
                        }}
                      >
                        {label}
                      </td>
                      <td style={{ border: "1px solid #000", padding: "8px 10px" }}>
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  borderBottom: "1px solid #000",
                  paddingBottom: "4px",
                }}
              >
                Cost Summary
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "8px 10px",
                        fontWeight: "bold",
                        width: "40%",
                      }}
                    >
                      Price per Night
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px 10px" }}>
                      ${result.perNightPrice.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "10px",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      Grand Total
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "10px",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      ${result.totalFinalCost.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer — first (and only) page */}
            <div
              style={{
                marginTop: "32px",
                paddingTop: "12px",
                borderTop: "2px solid #000",
                fontSize: "11px",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              <p>
                <strong>Website:</strong> {COMPANY_WEBSITE}
              </p>
              <p>
                <strong>Address:</strong> {COMPANY_ADDRESS}
              </p>
              <p>
                <strong>Contact Numbers:</strong> {COMPANY_PHONES.join("  |  ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

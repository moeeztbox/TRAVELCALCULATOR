import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Hotel,
  Calendar,
  Calculator,
  Building,
  Bed,
  User,
  DollarSign,
  Printer,
  Trash2,
  MapPin,
  Navigation,
} from "lucide-react";

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
  const [result, setResult] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);

  // New fields for location
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [distance, setDistance] = useState("");

  const categories = ["5-star", "4-star", "3-star", "2-star", "1-star"];

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/hotels");
      const data = await response.json();
      if (data.success) {
        setHotels(data.data);
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
    }
  };

  const handleHotelSelect = (hotel) => {
    setHotelName(hotel.hotelName);
    setCategory(hotel.category);
    setAgentName(hotel.agentName);
    setCity(hotel.city || "");
    setArea(hotel.area || "");
    setDistance(hotel.distance || "");

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
      // Basic information
      hotelName,
      category,
      roomType,
      agentName,

      // Location information
      city,
      area,
      distance,

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
    setHotelName("");
    setCategory("");
    setRoomType("");
    setAgentName("");
    setAgentCost("");
    setCompanyCost("");
    setPrice("");
    setCheckIn("");
    setCheckOut("");
    setCity("");
    setArea("");
    setDistance("");
    setResult(null);
    setAvailableRoomTypes([]);
  };

  const FieldWrapper = ({ children, className = "" }) => (
    <div className={`space-y-1 ${className}`}>{children}</div>
  );

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Print Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Hotel Calculator
              </h1>
              <p className="text-gray-500 text-sm">
                Calculate hotel costs and commissions
              </p>
            </div>
          </div>

          {/* Print Button - Only shown when there's a result */}
          {result && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer size={18} />
              Print Report
            </button>
          )}
        </div>

        {/* Input Section */}
        <div className="space-y-2">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Hotel Selection */}
              <FieldWrapper className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Hotel
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={hotelName}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      // Clear everything if "Choose a hotel" is selected
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
                      setAvailableRoomTypes([]);
                    } else {
                      const hotel = hotels.find(
                        (h) => h.hotelName === e.target.value
                      );
                      if (hotel) handleHotelSelect(hotel);
                    }
                  }}
                >
                  <option value="">Choose a hotel</option>
                  {hotels
                    .filter(
                      (hotel, index, self) =>
                        index ===
                        self.findIndex((h) => h.hotelName === hotel.hotelName)
                    ) // Get unique hotels by name
                    .map((hotel) => (
                      <option key={hotel._id} value={hotel.hotelName}>
                        {hotel.hotelName}
                      </option>
                    ))}
                </select>
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                onClick={calculate}
              >
                <Calculator size={18} />
                Calculate Costs
              </button>
              <button
                className="flex-1 bg-gray-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                onClick={clearForm}
              >
                <Trash2 size={18} />
                Clear
              </button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calculator size={20} className="text-green-600" />
                Calculation Results
              </h2>

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
                          {result.distance} km
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
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <Calculator size={48} className="mx-auto text-gray-300 mb-4" />
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
      </div>
    </div>
  );
}

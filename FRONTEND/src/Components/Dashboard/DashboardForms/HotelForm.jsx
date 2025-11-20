import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export default function HotelCalculator() {
  const navigate = useNavigate();

  // today date in yyyy-mm-dd format
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

  const categories = ["5-star", "4-star", "3-star", "2-star", "1-star"];
  const roomTypes = ["sharing", "quad", "double", "single"];

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
    setRoomType(hotel.roomType);
    setAgentName(hotel.agentName);
    setAgentCost(hotel.agentCost);
    setCompanyCost(hotel.companyCost);
    setPrice(hotel.price);
  };

  const calculate = () => {
    if (!hotelName || !roomType || !checkIn || !checkOut || !price) return;

    const nights =
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

    if (nights <= 0) {
      alert("Checkout date must be after check-in date!");
      return;
    }

    const perNightPrice = parseFloat(price);
    const totalAgentCost = perNightPrice * nights;
    const totalCompanyCost = parseFloat(companyCost) * nights;

    setResult({
      nights,
      perNight: perNightPrice,
      agentCost: totalAgentCost,
      companyCost: totalCompanyCost,
    });
  };

  return (
    <div className="p-6 w-full mx-auto">
      {/* Header */}

      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center cursor-pointer gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <h1 className="text-2xl font-bold">Hotel Calculator</h1>

      {/* Rest of your component continues here... */}

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Hotel Selection */}
        <select
          className="border p-2 rounded"
          value={hotelName}
          onChange={(e) => {
            const hotel = hotels.find(h => h.hotelName === e.target.value);
            if (hotel) handleHotelSelect(hotel);
          }}
        >
          <option value="">Select Hotel</option>
          {hotels.map((hotel) => (
            <option key={hotel._id} value={hotel.hotelName}>
              {hotel.hotelName}
            </option>
          ))}
        </select>

        {/* Category */}
        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled
        >
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Room Type */}
        <select
          className="border p-2 rounded"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          disabled
        >
          <option value="">Room Type</option>
          {roomTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Agent Name */}
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Agent Name"
          value={agentName}
          disabled
        />

        {/* Agent Cost */}
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Agent Cost"
          value={agentCost}
          disabled
        />

        {/* Company Cost */}
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Company Cost"
          value={companyCost}
          disabled
        />

        {/* Price */}
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Price"
          value={price}
          disabled
        />

        {/* Check In */}
        <input
          type="date"
          className="border p-2 rounded"
          value={checkIn}
          min={today}
          onChange={(e) => setCheckIn(e.target.value)}
        />

        {/* Check Out */}
        <input
          type="date"
          className="border p-2 rounded"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>

      {/* Submit */}
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded"
        onClick={calculate}
      >
        Submit
      </button>

      {/* Results Table */}
      {result && (
        <div className="mt-8">
          {/* Dates */}
          <p className="font-semibold mb-2">
            Check-in: {checkIn} | Check-out: {checkOut}
          </p>

          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Hotel Name</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Room Type</th>
                <th className="border p-2">Agent Name</th>
                <th className="border p-2">Price Per Night</th>
                <th className="border p-2">Total Nights</th>
                <th className="border p-2">Agent Cost</th>
                <th className="border p-2">Company Cost</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border p-2">{hotelName}</td>
                <td className="border p-2">{category}</td>
                <td className="border p-2">{roomType}</td>
                <td className="border p-2">{agentName}</td>
                <td className="border p-2">{result.perNight}</td>
                <td className="border p-2">{result.nights}</td>
                <td className="border p-2">{result.agentCost.toFixed(2)}</td>
                <td className="border p-2">{result.companyCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

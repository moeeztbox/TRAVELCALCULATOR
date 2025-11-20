import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function HotelCalculator() {
  const navigate = useNavigate();

  // today date in yyyy-mm-dd format
  const today = new Date().toISOString().split("T")[0];

  const [hotelName, setHotelName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [result, setResult] = useState(null);

  const hotelPrices = {
    "Al Haram Hotel": 200,
    "Hilton Makkah": 350,
    "Pullman Zamzam": 250,
  };

  const roomTypes = {
    "Quad Sharing": 1,
    "Triple Sharing": 1.2,
    "Double Sharing": 1.5,
  };

  const calculate = () => {
    if (!hotelName || !roomType || !checkIn || !checkOut) return;

    const nights =
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

    if (nights <= 0) {
      alert("Checkout date must be after check-in date!");
      return;
    }

    const basePrice = hotelPrices[hotelName] || 0;
    const roomMultiplier = roomTypes[roomType] || 1;

    const perNight = basePrice * roomMultiplier;

    const agentCost = perNight * nights;
    const companyCost = agentCost * 1.1;

    setResult({
      nights,
      perNight,
      agentCost,
      totalAgent: agentCost,
      companyCost,
      totalCompany: companyCost,
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

      {/* Inputs (One Row) */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={hotelName}
          onChange={(e) => setHotelName(e.target.value)}
        >
          <option value="">Select Hotel</option>
          <option value="Al Haram Hotel">Al Haram Hotel</option>
          <option value="Hilton Makkah">Hilton Makkah</option>
          <option value="Pullman Zamzam">Pullman Zamzam</option>
        </select>

        <select
          className="border p-2 rounded"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
        >
          <option value="">Select Room Type</option>
          <option value="Quad Sharing">Quad Sharing</option>
          <option value="Triple Sharing">Triple Sharing</option>
          <option value="Double Sharing">Double Sharing</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={checkIn}
          min={today} // 🔥 restrict past dates
          onChange={(e) => setCheckIn(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={checkOut}
          min={checkIn || today} // 🔥 checkout cannot be before check-in
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
                <th className="border p-2">Hotel</th>
                <th className="border p-2">Room Type</th>
                <th className="border p-2">Per Night Price</th>
                <th className="border p-2">Total Nights</th>
                <th className="border p-2">Agent Cost</th>
                <th className="border p-2">Total Agent Cost</th>
                <th className="border p-2">Company Cost</th>
                <th className="border p-2">Total Company Cost</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border p-2">{hotelName}</td>
                <td className="border p-2">{roomType}</td>
                <td className="border p-2">{result.perNight}</td>
                <td className="border p-2">{result.nights}</td>
                <td className="border p-2">{result.agentCost}</td>
                <td className="border p-2">{result.totalAgent}</td>
                <td className="border p-2">{result.companyCost}</td>
                <td className="border p-2">{result.totalCompany}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

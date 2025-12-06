import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export default function TransportCalculator() {
  const navigate = useNavigate();

  const [carType, setCarType] = useState("");
  const [tripType, setTripType] = useState("");
  const [route, setRoute] = useState("");

  const [result, setResult] = useState(null);
  const [transports, setTransports] = useState([]);

  // ROUTE OPTIONS
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
      const response = await fetch("http://localhost:5000/api/transports");
      const data = await response.json();
      if (data.success) {
        setTransports(data.data);
      }
    } catch (err) {
      console.error("Error fetching transports:", err);
    }
  };

  // Clear all inputs
  const clearAll = () => {
    setCarType("");
    setTripType("");
    setRoute("");
    setResult(null);
  };

  // Calculate selected transport
  const calculate = () => {
    if (!carType || !tripType || !route) {
      alert("Please select all fields");
      return;
    }

    // Find matching transport from DB
    const selected = transports.find(
      (t) =>
        t.carType === carType && t.tripType === tripType && t.route === route
    );

    if (!selected) {
      alert("No transport found for this combination!");
      return;
    }

    // TOTAL PRICE LOGIC
    let finalPrice = selected.price;

    if (tripType === "roundtrip") {
      finalPrice = selected.price * 2;
    }

    setResult({
      ...selected,
      finalPrice,
    });
  };

  const getRouteOptions = () =>
    tripType === "roundtrip" ? roundTripRoutes : oneWayRoutes;

  return (
    <div className="p-6 w-full mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <h1 className="text-2xl font-bold mb-4">Transport Calculator</h1>

      {/* INPUT ROW */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Car Type */}
        <select
          className="border p-2 rounded"
          value={carType}
          onChange={(e) => setCarType(e.target.value)}
        >
          <option value="">Car Type</option>
          {[...new Set(transports.map((t) => t.carType))].map((ct) => (
            <option key={ct} value={ct}>
              {ct}
            </option>
          ))}
        </select>

        {/* Trip Type */}
        <select
          className="border p-2 rounded"
          value={tripType}
          onChange={(e) => {
            setTripType(e.target.value);
            setRoute("");
          }}
        >
          <option value="">Trip Type</option>
          <option value="oneway">One Way</option>
          <option value="roundtrip">Round Trip</option>
        </select>

        {/* Route */}
        <select
          className="border p-2 rounded"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          disabled={!tripType}
        >
          <option value="">Select Route</option>
          {tripType &&
            getRouteOptions().map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
        </select>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={clearAll}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear
          </button>
          <button
            onClick={calculate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Calculate
          </button>
        </div>
      </div>

      {/* OUTPUT TABLE */}
      {result && (
        <div className="mt-8">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Car Type</th>
                <th className="border p-2">Capacity</th>
                <th className="border p-2">Trip Type</th>
                <th className="border p-2">Route</th>
                <th className="border p-2">Agent Name</th>
                <th className="border p-2">Agent Cost</th>
                <th className="border p-2">Company Cost</th>
                <th className="border p-2">Car Price</th>
                <th className="border p-2">Final Total Price</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border p-2">{result.carType}</td>
                <td className="border p-2">{result.capacity}</td>
                <td className="border p-2">{result.tripType}</td>
                <td className="border p-2">{result.route}</td>
                <td className="border p-2">{result.agentName}</td>
                <td className="border p-2">{result.agentCost}</td>
                <td className="border p-2">{result.companyCost}</td>
                <td className="border p-2">{result.price}</td>
                <td className="border p-2 font-bold">{result.finalPrice}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

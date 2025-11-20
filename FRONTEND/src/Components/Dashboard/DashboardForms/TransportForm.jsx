import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export default function TransportCalculator() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [transportName, setTransportName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentCost, setAgentCost] = useState("");
  const [companyCost, setCompanyCost] = useState("");
  const [price, setPrice] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [result, setResult] = useState(null);
  const [transports, setTransports] = useState([]);

  const vehicleTypes = ["Bus", "Coaster", "Hiace", "Car", "SUV", "Van"];

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/transports");
      const data = await response.json();
      if (data.success) {
        console.log(data.data);
        setTransports(data.data);
      }
    } catch (err) {
      console.error("Error fetching transports:", err);
    }
    
  };

  const handleSelect = (transport) => {
    setTransportName(transport.transportName);
    setVehicleType(transport.vehicleType);
    setAgentName(transport.agentName);
    setAgentCost(transport.agentCost);
    setCompanyCost(transport.companyCost);
    setPrice(transport.price);
  };

  const calculate = () => {
    if (!transportName || !startDate || !endDate || !price) return;

    const days =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

    if (days <= 0) {
      alert("End date must be after start date!");
      return;
    }

    const perDayRate = parseFloat(price);
    const totalAgentCost = perDayRate * days;
    const totalCompanyCost = parseFloat(companyCost) * days;

    setResult({
      days,
      perDayRate,
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

      <h1 className="text-2xl font-bold mb-4">Transport Calculator</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Transport Selection */}
        <select
          className="border p-2 rounded"
          value={transportName}
          onChange={(e) => {
            const t = transports.find(
              (tr) => tr.transportName === e.target.value
            );
            if (t) handleSelect(t);
          }}
        >
          <option value="">Select Transport</option>
          {transports.map((t) => (
            <option key={t._id} value={t.transportName}>
              {t.transportName}
            </option>
          ))}
        </select>

        {/* Vehicle Type */}
        <select
          className="border p-2 rounded"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          disabled
        >
          <option value="">Vehicle Type</option>
          {vehicleTypes.map((type) => (
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

        {/* Rate (Per Day) */}
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Price Per Day"
          value={price}
          disabled
        />

        {/* Start Date */}
        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          min={today}
          onChange={(e) => setStartDate(e.target.value)}
        />

        {/* End Date */}
        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          min={startDate || today}
          onChange={(e) => setEndDate(e.target.value)}
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
          <p className="font-semibold mb-2">
            Start: {startDate} | End: {endDate}
          </p>

          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Transport</th>
                <th className="border p-2">Vehicle Type</th>
                <th className="border p-2">Agent</th>
                <th className="border p-2">Rate Per Day</th>
                <th className="border p-2">Total Days</th>
                <th className="border p-2">Agent Cost</th>
                <th className="border p-2">Company Cost</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border p-2">{transportName}</td>
                <td className="border p-2">{vehicleType}</td>
                <td className="border p-2">{agentName}</td>
                <td className="border p-2">{result.perDayRate}</td>
                <td className="border p-2">{result.days}</td>
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

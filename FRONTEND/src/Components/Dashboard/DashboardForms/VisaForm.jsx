import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VisaForm() {
  const navigate = useNavigate();

  const [visas, setVisas] = useState([]);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [category, setCategory] = useState("");
  const [passenger, setPassenger] = useState("");
  const [agentName, setAgentName] = useState("");
  const [price, setPrice] = useState("");
  const [companyCost, setCompanyCost] = useState("");
  const [agentCost, setAgentCost] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchVisas();
  }, []);

  const fetchVisas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/visas");
      const data = await res.json();
      if (data.success) setVisas(data.data || []);
    } catch (err) {
      console.error("Error fetching visas:", err);
    }
  };

  const handleVisaSelect = (visaId) => {
    const visa = visas.find((v) => v._id === visaId);
    if (!visa) return;
    setSelectedVisa(visa);
    setCategory(visa.category || "");
    setPassenger(visa.passenger || "");
    setAgentName(visa.agentName || "");
    setPrice(visa.price ?? "");
    setCompanyCost(visa.companyCost ?? "");
    setAgentCost(visa.agentCost ?? "");
    setResult(null);
  };

  const calculate = () => {
    if (!price) return;
    const p = parseFloat(price) || 0;
    const comp = parseFloat(companyCost) || 0;
    const agent = parseFloat(agentCost) || 0;

    setResult({ total: p, companyCost: comp, agentCost: agent });
  };

  return (
    <div className="p-6 w-full mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center cursor-pointer gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      <h1 className="text-2xl font-bold mb-4">Visa Calculator</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <select
          className="border p-2 rounded"
          onChange={(e) => handleVisaSelect(e.target.value)}
          value={selectedVisa?._id || ""}
        >
          <option value="">Select Visa</option>
          {visas.map((v) => (
            <option key={v._id} value={v._id}>
              {v.agentName} — {v.category} — {v.passenger}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Category</option>
          <option value="with massar">with massar</option>
          <option value="without massar">without massar</option>
        </select>

        <select
          className="border p-2 rounded"
          value={passenger}
          onChange={(e) => setPassenger(e.target.value)}
        >
          <option value="">Passenger</option>
          <option value="adult">adult</option>
          <option value="infant">infant</option>
        </select>

        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Agent Name"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
        />

        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Company Cost"
          value={companyCost}
          onChange={(e) => setCompanyCost(e.target.value)}
        />

        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Agent Cost"
          value={agentCost}
          onChange={(e) => setAgentCost(e.target.value)}
        />
      </div>

      <button className="bg-blue-600 text-white px-6 py-2 rounded" onClick={calculate}>
        Calculate
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Result</h2>
          <div className="bg-white p-4 rounded shadow">
            <p>
              <strong>Total Price:</strong> {result.total}
            </p>
            <p>
              <strong>Company Cost:</strong> {result.companyCost}
            </p>
            <p>
              <strong>Agent Cost:</strong> {result.agentCost}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TicketForm() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");

  const [airlineName, setAirlineName] = useState("");
  const [category, setCategory] = useState("");
  const [passenger, setPassenger] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentCost, setAgentCost] = useState("");
  const [companyCost, setCompanyCost] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tickets");
      const data = await res.json();
      if (data.success) setTickets(data.data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const handleSelect = (id) => {
    const t = tickets.find((x) => x._id === id);
    if (!t) return;
    setSelectedTicketId(id);
    setAirlineName(t.airlineName || "");
    setCategory(t.category || "");
    setPassenger(t.passenger || "");
    setWeight(t.weight ?? "");
    setPrice(t.price ?? "");
    setAgentName(t.agentName || "");
    setAgentCost(t.agentCost ?? "");
    setCompanyCost(t.companyCost ?? "");
    setResult(null);
  };

  const calculate = () => {
    if (!price) return;
    const p = parseFloat(price) || 0;
    const agent = parseFloat(agentCost) || 0;
    const comp = parseFloat(companyCost) || 0;
    setResult({ price: p, agentCost: agent, companyCost: comp });
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

      <h1 className="text-2xl font-bold mb-4">Ticket Calculator</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <select className="border p-2 rounded" value={selectedTicketId} onChange={(e) => handleSelect(e.target.value)}>
          <option value="">Select Ticket</option>
          {tickets.map((t) => (
            <option key={t._id} value={t._id}>
              {t.airlineName} — {t.category} — {t.passenger}
            </option>
          ))}
        </select>

        <input type="text" className="border p-2 rounded" placeholder="Airline Name" value={airlineName} onChange={(e) => setAirlineName(e.target.value)} />

        <select className="border p-2 rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Category</option>
          <option value="Group Ticket">Group Ticket</option>
          <option value="System Ticket">System Ticket</option>
        </select>

        <select className="border p-2 rounded" value={passenger} onChange={(e) => setPassenger(e.target.value)}>
          <option value="">Passenger</option>
          <option value="adult">adult</option>
          <option value="infant">infant</option>
        </select>

        <input type="number" className="border p-2 rounded" placeholder="Weight (KG)" value={weight} onChange={(e) => setWeight(e.target.value)} />

        <input type="number" className="border p-2 rounded" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />

        <input type="text" className="border p-2 rounded" placeholder="Agent Name" value={agentName} onChange={(e) => setAgentName(e.target.value)} />

        <input type="number" className="border p-2 rounded" placeholder="Agent Cost" value={agentCost} onChange={(e) => setAgentCost(e.target.value)} />

        <input type="number" className="border p-2 rounded" placeholder="Company Cost" value={companyCost} onChange={(e) => setCompanyCost(e.target.value)} />
      </div>

      <button className="bg-blue-600 text-white px-6 py-2 rounded" onClick={calculate}>Calculate</button>

      {result && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Result</h2>
          <div className="bg-white p-4 rounded shadow">
            <p><strong>Price:</strong> {result.price}</p>
            <p><strong>Agent Cost:</strong> {result.agentCost}</p>
            <p><strong>Company Cost:</strong> {result.companyCost}</p>
          </div>
        </div>
      )}
    </div>
  );
}

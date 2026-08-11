import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Plane, Calculator, Printer, Trash2, Package } from "lucide-react";
import PageHeader from "../../UI/PageHeader";
import Button from "../../UI/Button";

// Module scope (not inside the component) so its identity is stable across
// renders — otherwise React remounts this subtree (and loses input focus)
// on every keystroke. See HotelForm.jsx for the full explanation.
const FieldWrapper = ({ children, className = "" }) => (
  <div className={`space-y-1 ${className}`}>{children}</div>
);

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
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [result, setResult] = useState(null);

  // Check if a ticket is selected from dropdown
  const isTicketSelected = selectedTicketId !== "";

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tickets", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const handleSelect = (ticket) => {
    setSelectedTicketId(ticket._id);
    setAirlineName(ticket.airlineName);
    setCategory(ticket.category);
    setPassenger(ticket.passenger);
    setWeight(ticket.weight || "");
    setPrice(ticket.price || "");
    setAgentName(ticket.agentName);
    setAgentCost(ticket.agentCost || "");
    setCompanyCost(ticket.companyCost || "");
    setValidFrom(
      ticket.validFrom
        ? new Date(ticket.validFrom).toISOString().split("T")[0]
        : ""
    );
    setValidTo(
      ticket.validTo ? new Date(ticket.validTo).toISOString().split("T")[0] : ""
    );
  };

  const calculate = () => {
    if (!airlineName || !category || !passenger || !price) {
      alert("Please fill all required fields!");
      return;
    }

    const ticketPrice = parseFloat(price);
    const agentCostValue = parseFloat(agentCost) || 0;
    const companyCostValue = parseFloat(companyCost) || 0;

    // Calculate all costs
    const totalCost = ticketPrice + agentCostValue + companyCostValue;

    setResult({
      // Basic information
      airlineName,
      category,
      passenger,
      agentName,

      // Weight information
      weight,

      // Validity information
      validFrom: formatDate(validFrom),
      validTo: formatDate(validTo),

      // Costs
      ticketPrice,
      agentCost: agentCostValue,
      companyCost: companyCostValue,

      // Total calculation
      totalCost,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const clearForm = () => {
    setSelectedTicketId("");
    setAirlineName("");
    setCategory("");
    setPassenger("");
    setWeight("");
    setPrice("");
    setAgentName("");
    setAgentCost("");
    setCompanyCost("");
    setValidFrom("");
    setValidTo("");
    setResult(null);
  };

  return (
    <div className="calc">
      <div className="max-w-6xl mx-auto">
        {/* Header with Print Button */}
        <div className="mb-8">
          <PageHeader
            title="Ticket Calculator"
            subtitle="Calculate ticket costs and commissions"
            icon={Plane}
            onBack={() => navigate("/dashboard")}
            actions={
              result && (
                <Button variant="secondary" icon={Printer} onClick={handlePrint}>
                  Print Report
                </Button>
              )
            }
          />
        </div>

        {/* Input Section */}
        <div className="space-y-2">
          <div className="calc-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Ticket Selection - ALWAYS ENABLED */}
              <FieldWrapper className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Ticket
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={selectedTicketId}
                  onChange={(e) => {
                    if (e.target.value === "") {
                      clearForm();
                    } else {
                      const ticket = tickets.find(
                        (t) => t._id === e.target.value
                      );
                      if (ticket) {
                        handleSelect(ticket);
                      }
                    }
                  }}
                >
                  <option value="">Choose a ticket</option>
                  {tickets.map((ticket) => (
                    <option key={ticket._id} value={ticket._id}>
                      {ticket.airlineName} — {ticket.category} —{" "}
                      {ticket.passenger}
                    </option>
                  ))}
                </select>
                {!isTicketSelected ? (
                  <p className="text-xs text-gray-500 mt-1">
                    Select a ticket to populate all fields
                  </p>
                ) : (
                  <p className="text-xs text-blue-600 mt-1">
                    Ticket selected - All fields are read-only
                  </p>
                )}
              </FieldWrapper>

              {/* Airline Name - ALWAYS DISABLED (only populated by dropdown) */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Airline Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Will be auto-filled"
                  value={airlineName}
                  readOnly
                />
              </FieldWrapper>

              {/* Category - ALWAYS DISABLED */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={category}
                  disabled
                >
                  <option value="">Will be auto-filled</option>
                  <option value="Group Ticket">Group Ticket</option>
                  <option value="System Ticket">System Ticket</option>
                </select>
              </FieldWrapper>

              {/* Passenger Type - ALWAYS DISABLED */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Passenger Type
                </label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={passenger}
                  disabled
                >
                  <option value="">Will be auto-filled</option>
                  <option value="adult">Adult</option>
                  <option value="infant">Infant</option>
                  <option value="child">Child</option>
                </select>
              </FieldWrapper>

              {/* Weight - ALWAYS DISABLED */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Weight (KG)
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Will be auto-filled"
                  value={weight}
                  readOnly
                />
              </FieldWrapper>

              {/* Price - ALWAYS DISABLED */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Will be auto-filled"
                  value={price}
                  readOnly
                />
              </FieldWrapper>

              {/* Agent Name - ALWAYS DISABLED */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Agent Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Will be auto-filled"
                  value={agentName}
                  readOnly
                />
              </FieldWrapper>

              {/* Agent Cost - ALWAYS DISABLED */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Agent Cost
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Will be auto-filled"
                  value={agentCost}
                  readOnly
                />
              </FieldWrapper>

              {/* Company Cost - ALWAYS DISABLED */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Company Cost
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Will be auto-filled"
                  value={companyCost}
                  readOnly
                />
              </FieldWrapper>

              {/* Valid From Date - ALWAYS DISABLED */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Valid From
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={validFrom}
                  readOnly
                />
              </FieldWrapper>

              {/* Valid To Date - ALWAYS DISABLED */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Valid To
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={validTo}
                  readOnly
                />
              </FieldWrapper>
            </div>

            {/* Action Buttons - Enabled only when ticket is selected */}
            <div className="flex gap-3 mt-6">
              <Button
                fullWidth
                size="lg"
                icon={Calculator}
                onClick={calculate}
                disabled={!isTicketSelected}
              >
                Calculate Costs
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="secondary"
                icon={Trash2}
                onClick={clearForm}
                disabled={!isTicketSelected}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="calc-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calculator size={20} className="text-green-600" />
                Calculation Results
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Ticket Details & Validity Information */}
                <div className="space-y-6">
                  {/* Ticket Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Ticket Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Airline Name</span>
                        <span className="font-medium text-right">
                          {result.airlineName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Category</span>
                        <span className="font-medium">{result.category}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Passenger Type</span>
                        <span className="font-medium">{result.passenger}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Agent Name</span>
                        <span className="font-medium">{result.agentName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Weight Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <Package size={16} className="text-blue-600" />
                      Weight Information
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Baggage Weight:</span>
                        <span className="font-medium">{result.weight} KG</span>
                      </div>
                    </div>
                  </div>

                  {/* Validity Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Validity Information
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Valid From:</span>
                        <span className="font-medium">{result.validFrom}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Valid To:</span>
                        <span className="font-medium">{result.validTo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Cost Breakdown */}
                <div className="space-y-6">
                  {/* Cost Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Cost Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Ticket Price</span>
                        <span className="font-medium">
                          ${result.ticketPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Agent Cost</span>
                        <span className="font-medium text-orange-600">
                          ${result.agentCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Company Cost</span>
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
                        <span className="text-gray-600">Ticket Price</span>
                        <span className="font-medium">
                          ${result.ticketPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Agent Cost</span>
                        <span className="font-medium text-red-600">
                          ${result.agentCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Company Cost</span>
                        <span className="font-medium text-green-600">
                          ${result.companyCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3 mt-4">
                        <span className="text-gray-700 font-semibold">
                          Total Final Cost
                        </span>
                        <span className="font-bold text-lg text-blue-700">
                          ${result.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State - Only show when no ticket is selected */}
          {!result && !isTicketSelected && (
            <div className="calc-card p-8 text-center">
              <Plane size={48} className="mx-auto text-brand-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Select a Ticket
              </h3>
              <p className="text-sm text-gray-400">
                Choose a ticket from the dropdown to populate all fields and
                calculate costs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

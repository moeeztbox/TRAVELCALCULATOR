import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Calculator, Trash2, Printer } from "lucide-react";

export default function VisaForm() {
  const navigate = useNavigate();

  // States for visa data
  const [visaData, setVisaData] = useState([]); // fetched from backend
  const [adultVisa, setAdultVisa] = useState(null); // selected adult visa
  const [infantVisa, setInfantVisa] = useState(null); // selected infant visa

  const [personAdult, setPersonAdult] = useState("");
  const [personInfant, setPersonInfant] = useState("");

  const [result, setResult] = useState(null);

  // Fetch visas from backend
  useEffect(() => {
    fetchVisas();
  }, []);

  const fetchVisas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/visas");
      const data = await res.json();
      if (data.success) {
        setVisaData(data.data);
      }
    } catch (err) {
      console.error("Error fetching visas:", err);
    }
  };

  // Handle adult visa selection
  const handleAdultVisaSelect = (id) => {
    const visa = visaData.find((v) => v._id === id);
    setAdultVisa(visa);
  };

  // Handle infant visa selection
  const handleInfantVisaSelect = (id) => {
    const visa = visaData.find((v) => v._id === id);
    setInfantVisa(visa);
  };

  // Calculate totals
  const calculateVisa = () => {
    if (!adultVisa || !infantVisa || !personAdult || !personInfant) {
      alert("Please select visas and enter number of passengers!");
      return;
    }

    const totalVisaPriceAdult = adultVisa.price * parseInt(personAdult);
    const totalVisaPriceInfant = infantVisa.price * parseInt(personInfant);

    const totalAgentCostAdult = adultVisa.agentCost * parseInt(personAdult);
    const totalAgentCostInfant = infantVisa.agentCost * parseInt(personInfant);

    const totalCompanyCostAdult = adultVisa.companyCost * parseInt(personAdult);
    const totalCompanyCostInfant =
      infantVisa.companyCost * parseInt(personInfant);

    const totalFinalCost =
      totalVisaPriceAdult +
      totalVisaPriceInfant +
      totalAgentCostAdult +
      totalAgentCostInfant +
      totalCompanyCostAdult +
      totalCompanyCostInfant;

    setResult({
      adult: {
        passengerType: "Adult",
        visaCategory: adultVisa.category,
        numPassengers: parseInt(personAdult),
        visaPricePerPerson: adultVisa.price,
        totalVisaPrice: totalVisaPriceAdult,
        agentCostPerPerson: adultVisa.agentCost,
        totalAgentCost: totalAgentCostAdult,
        companyCostPerPerson: adultVisa.companyCost,
        totalCompanyCost: totalCompanyCostAdult,
        agentName: adultVisa.agentName,
      },
      infant: {
        passengerType: "Infant",
        visaCategory: infantVisa.category,
        numPassengers: parseInt(personInfant),
        visaPricePerPerson: infantVisa.price,
        totalVisaPrice: totalVisaPriceInfant,
        agentCostPerPerson: infantVisa.agentCost,
        totalAgentCost: totalAgentCostInfant,
        companyCostPerPerson: infantVisa.companyCost,
        totalCompanyCost: totalCompanyCostInfant,
        agentName: infantVisa.agentName,
      },
      totalFinalCost,
    });
  };

  const handlePrint = () => window.print();

  const clearForm = () => {
    setAdultVisa(null);
    setInfantVisa(null);
    setPersonAdult("");
    setPersonInfant("");
    setResult(null);
  };

  const FieldWrapper = ({ children, className = "" }) => (
    <div className={`space-y-1 ${className}`}>{children}</div>
  );

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
                Visa Form
              </h1>
              <p className="text-gray-500 text-sm">
                Select visas and number of passengers
              </p>
            </div>
          </div>

          {result && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer size={18} /> Print Report
            </button>
          )}
        </div>

        {/* Input Form */}
        <div className="space-y-6 bg-white rounded-xl p-6 border border-gray-200">
          {/* Adult Selection */}
          <h2 className="text-lg font-semibold text-gray-800">Adult Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldWrapper>
              <label>Passenger Type</label>
              <input
                type="text"
                disabled
                value="Adult"
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
              />
            </FieldWrapper>

            <FieldWrapper>
              <label>Visa Type</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={adultVisa?._id || ""}
                onChange={(e) => handleAdultVisaSelect(e.target.value)}
              >
                <option value="">Select Visa</option>
                {visaData
                  .filter((v) => v.passenger === "adult")
                  .map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.category} - {v.agentName}
                    </option>
                  ))}
              </select>
            </FieldWrapper>

            <FieldWrapper>
              <label>Number of Adults</label>
              <input
                type="number"
                value={personAdult}
                onChange={(e) => setPersonAdult(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </FieldWrapper>
          </div>

          {/* Infant Selection */}
          <h2 className="text-lg font-semibold text-gray-800 mt-4">
            Infant Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldWrapper>
              <label>Passenger Type</label>
              <input
                type="text"
                disabled
                value="Infant"
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
              />
            </FieldWrapper>

            <FieldWrapper>
              <label>Visa Type</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={infantVisa?._id || ""}
                onChange={(e) => handleInfantVisaSelect(e.target.value)}
              >
                <option value="">Select Visa</option>
                {visaData
                  .filter((v) => v.passenger === "infant")
                  .map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.category} - {v.agentName}
                    </option>
                  ))}
              </select>
            </FieldWrapper>

            <FieldWrapper>
              <label>Number of Infants</label>
              <input
                type="number"
                value={personInfant}
                onChange={(e) => setPersonInfant(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </FieldWrapper>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 col-span-full">
              <button
                className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                onClick={calculateVisa}
              >
                <Calculator size={18} /> Calculate
              </button>
              <button
                className="flex-1 bg-gray-500 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                onClick={clearForm}
              >
                <Trash2 size={18} /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        {result && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator size={20} className="text-green-600" /> Visa
              Calculation Results
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Adult Output */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Adult</h3>
                <div className="flex justify-between">
                  <span>Passenger Type:</span>
                  <span>{result.adult.passengerType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visa Category:</span>
                  <span>{result.adult.visaCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of Adults:</span>
                  <span>{result.adult.numPassengers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visa Price per Adult:</span>
                  <span>${result.adult.visaPricePerPerson.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Visa Price:</span>
                  <span>${result.adult.totalVisaPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agent Cost per Adult:</span>
                  <span>${result.adult.agentCostPerPerson.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Agent Cost:</span>
                  <span>${result.adult.totalAgentCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Company Cost per Adult:</span>
                  <span>${result.adult.companyCostPerPerson.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Company Cost:</span>
                  <span>${result.adult.totalCompanyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agent Name:</span>
                  <span>{result.adult.agentName}</span>
                </div>
              </div>

              {/* Infant Output */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Infant</h3>
                <div className="flex justify-between">
                  <span>Passenger Type:</span>
                  <span>{result.infant.passengerType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visa Category:</span>
                  <span>{result.infant.visaCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of Infants:</span>
                  <span>{result.infant.numPassengers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visa Price per Infant:</span>
                  <span>${result.infant.visaPricePerPerson.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Visa Price:</span>
                  <span>${result.infant.totalVisaPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agent Cost per Infant:</span>
                  <span>${result.infant.agentCostPerPerson.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Agent Cost:</span>
                  <span>${result.infant.totalAgentCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Company Cost per Infant:</span>
                  <span>${result.infant.companyCostPerPerson.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Company Cost:</span>
                  <span>${result.infant.totalCompanyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Agent Name:</span>
                  <span>{result.infant.agentName}</span>
                </div>
              </div>

              {/* Total Final Cost */}
              <div className="col-span-full mt-4 p-4 bg-gray-50 rounded-lg flex justify-between font-bold text-blue-700">
                <span>Total Final Cost</span>
                <span>${result.totalFinalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

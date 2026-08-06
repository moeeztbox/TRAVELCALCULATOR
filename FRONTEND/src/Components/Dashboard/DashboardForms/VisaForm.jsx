import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Calculator, Trash2, Printer, FileText } from "lucide-react";
import PageHeader from "../../UI/PageHeader";
import Button from "../../UI/Button";

// Module scope (not inside the component) so its identity is stable across
// renders — otherwise React remounts this subtree (and loses input focus)
// on every keystroke. See HotelForm.jsx for the full explanation.
const FieldWrapper = ({ children, className = "" }) => (
  <div className={`space-y-1 ${className}`}>{children}</div>
);

export default function VisaForm() {
  const navigate = useNavigate();

  const [visaData, setVisaData] = useState([]);
  const [adultVisa, setAdultVisa] = useState(null);
  const [infantVisa, setInfantVisa] = useState(null);
  const [personAdult, setPersonAdult] = useState("");
  const [personInfant, setPersonInfant] = useState("");
  const [result, setResult] = useState(null);

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

  const handleAdultVisaSelect = (id) => {
    const visa = visaData.find((v) => v._id === id);
    setAdultVisa(visa);
  };

  const handleInfantVisaSelect = (id) => {
    const visa = visaData.find((v) => v._id === id);
    setInfantVisa(visa);
  };

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

  return (
    <div className="calc">
      <div className="max-w-6xl mx-auto">
        {/* Header with Print Button */}
        <div className="mb-8">
          <PageHeader
            title="Visa Calculator"
            subtitle="Calculate visa costs and commissions"
            icon={FileText}
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

        {/* Input Section - EXACTLY LIKE HOTEL FORM LAYOUT */}
        <div className="space-y-2">
          <div className="calc-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Adult Visa Selection */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Adult Visa Category
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={adultVisa?._id || ""}
                  onChange={(e) => handleAdultVisaSelect(e.target.value)}
                >
                  <option value="">Select adult visa</option>
                  {visaData
                    .filter((v) => v.passenger === "adult")
                    .map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.category} - {v.agentName}
                      </option>
                    ))}
                </select>
              </FieldWrapper>

              {/* Number of Adults */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Number of Adults
                </label>
                <input
                  type="number"
                  min="0"
                  value={personAdult}
                  onChange={(e) => setPersonAdult(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter number"
                />
              </FieldWrapper>

              {/* Infant Visa Selection */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Infant Visa Category
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={infantVisa?._id || ""}
                  onChange={(e) => handleInfantVisaSelect(e.target.value)}
                >
                  <option value="">Select infant visa</option>
                  {visaData
                    .filter((v) => v.passenger === "infant")
                    .map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.category} - {v.agentName}
                      </option>
                    ))}
                </select>
              </FieldWrapper>

              {/* Number of Infants */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Number of Infants
                </label>
                <input
                  type="number"
                  min="0"
                  value={personInfant}
                  onChange={(e) => setPersonInfant(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter number"
                />
              </FieldWrapper>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                fullWidth
                size="lg"
                icon={Calculator}
                onClick={calculateVisa}
                disabled={
                  !adultVisa || !infantVisa || !personAdult || !personInfant
                }
              >
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

          {/* Results Section - EXACTLY LIKE HOTEL FORM LAYOUT */}
          {result && (
            <div className="calc-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calculator size={20} className="text-green-600" />
                Calculation Results
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Adult Visa Details */}
                <div className="space-y-6">
                  {/* Adult Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Adult Visa Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Passenger Type</span>
                        <span className="font-medium text-right">
                          {result.adult.passengerType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Visa Category</span>
                        <span className="font-medium">
                          {result.adult.visaCategory}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Number of Passengers
                        </span>
                        <span className="font-medium">
                          {result.adult.numPassengers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Agent Name</span>
                        <span className="font-medium">
                          {result.adult.agentName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Adult Per Person Costs */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Per Person Costs (Adult)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Visa price per person
                        </span>
                        <span className="font-medium">
                          ${result.adult.visaPricePerPerson.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Agent cost per person
                        </span>
                        <span className="font-medium text-orange-600">
                          ${result.adult.agentCostPerPerson.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">
                          Company cost per person
                        </span>
                        <span className="font-medium text-purple-600">
                          ${result.adult.companyCostPerPerson.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Infant Visa Details */}
                <div className="space-y-6">
                  {/* Infant Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Infant Visa Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Passenger Type</span>
                        <span className="font-medium text-right">
                          {result.infant.passengerType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Visa Category</span>
                        <span className="font-medium">
                          {result.infant.visaCategory}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Number of Passengers
                        </span>
                        <span className="font-medium">
                          {result.infant.numPassengers}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Agent Name</span>
                        <span className="font-medium">
                          {result.infant.agentName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Infant Per Person Costs */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Per Person Costs (Infant)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Visa price per person
                        </span>
                        <span className="font-medium">
                          ${result.infant.visaPricePerPerson.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Agent cost per person
                        </span>
                        <span className="font-medium text-orange-600">
                          ${result.infant.agentCostPerPerson.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">
                          Company cost per person
                        </span>
                        <span className="font-medium text-purple-600">
                          ${result.infant.companyCostPerPerson.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Costs - EXACTLY LIKE HOTEL FORM */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Total Costs
                </h3>
                <div className="space-y-3">
                  {/* Adult Totals */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Total adult visa price
                    </span>
                    <span className="font-medium">
                      ${result.adult.totalVisaPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Total adult agent cost
                    </span>
                    <span className="font-medium text-red-600">
                      ${result.adult.totalAgentCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Total adult company cost
                    </span>
                    <span className="font-medium text-green-600">
                      ${result.adult.totalCompanyCost.toFixed(2)}
                    </span>
                  </div>

                  {/* Infant Totals */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Total infant visa price
                    </span>
                    <span className="font-medium">
                      ${result.infant.totalVisaPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Total infant agent cost
                    </span>
                    <span className="font-medium text-red-600">
                      ${result.infant.totalAgentCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">
                      Total infant company cost
                    </span>
                    <span className="font-medium text-green-600">
                      ${result.infant.totalCompanyCost.toFixed(2)}
                    </span>
                  </div>

                  {/* Final Total - EXACTLY LIKE HOTEL FORM */}
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
          )}

          {/* Empty State - EXACTLY LIKE HOTEL FORM */}
          {!result && (
            <div className="calc-card p-8 text-center">
              <Calculator size={48} className="mx-auto text-brand-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {adultVisa && infantVisa && personAdult && personInfant
                  ? "Ready to Calculate"
                  : "No Calculation Yet"}
              </h3>
              <p className="text-sm text-gray-400">
                {adultVisa && infantVisa && personAdult && personInfant
                  ? "Click 'Calculate Costs' to see results"
                  : "Select visas for adults and infants, enter passenger counts, then click 'Calculate Costs' to see results"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

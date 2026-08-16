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

const CATEGORIES = ["Adult", "Child", "Infant"];

const emptySelections = () => ({
  Adult: { visaId: "", count: "" },
  Child: { visaId: "", count: "" },
  Infant: { visaId: "", count: "" },
});

export default function VisaForm() {
  const navigate = useNavigate();

  const [visaData, setVisaData] = useState([]);
  const [selections, setSelections] = useState(emptySelections());
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchVisas();
  }, []);

  const fetchVisas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/visas", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setVisaData(data.data);
      }
    } catch (err) {
      console.error("Error fetching visas:", err);
    }
  };

  const updateSelection = (category, field, value) => {
    setSelections((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  const hasAnySelection = CATEGORIES.some(
    (cat) => selections[cat].visaId || selections[cat].count
  );

  const calculateVisa = () => {
    const incomplete = CATEGORIES.some(
      (cat) =>
        (selections[cat].visaId && !selections[cat].count) ||
        (!selections[cat].visaId && selections[cat].count)
    );

    if (incomplete) {
      alert(
        "Please provide both a visa selection and a passenger count for each category you use."
      );
      return;
    }

    const active = CATEGORIES.filter(
      (cat) => selections[cat].visaId && selections[cat].count
    );

    if (active.length === 0) {
      alert("Please select at least one visa category and enter passenger count!");
      return;
    }

    const breakdown = active.map((cat) => {
      const visa = visaData.find((v) => v._id === selections[cat].visaId);
      const count = parseInt(selections[cat].count, 10);
      const visaTotal = visa.price * count;
      const hotelBRNTotal = visa.hotelBRN ? (visa.hotelBRNPrice || 0) * count : 0;
      const foodBRNTotal = visa.foodBRN ? (visa.foodBRNPrice || 0) * count : 0;
      const categoryTotal = visaTotal + hotelBRNTotal + foodBRNTotal;

      return {
        category: cat,
        agentName: visa.agentName,
        count,
        pricePerPerson: visa.price,
        visaTotal,
        hotelBRN: visa.hotelBRN,
        hotelBRNPrice: visa.hotelBRNPrice,
        hotelBRNTotal,
        foodBRN: visa.foodBRN,
        foodBRNPrice: visa.foodBRNPrice,
        foodBRNTotal,
        categoryTotal,
      };
    });

    const totalFinalCost = breakdown.reduce(
      (sum, b) => sum + b.categoryTotal,
      0
    );

    setResult({ breakdown, totalFinalCost });
  };

  const handlePrint = () => window.print();

  const clearForm = () => {
    setSelections(emptySelections());
    setResult(null);
  };

  return (
    <div className="calc">
      <div className="max-w-6xl mx-auto">
        {/* Header with Print Button */}
        <div className="mb-8">
          <PageHeader
            title="Visa Calculator"
            subtitle="Calculate visa costs by category"
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

        {/* Input Section */}
        <div className="space-y-2">
          <div className="calc-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {cat}
                  </h3>
                  <FieldWrapper>
                    <label className="text-sm font-medium text-gray-700">
                      {cat} Visa
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={selections[cat].visaId}
                      onChange={(e) =>
                        updateSelection(cat, "visaId", e.target.value)
                      }
                    >
                      <option value="">Select {cat.toLowerCase()} visa</option>
                      {visaData
                        .filter((v) => v.category === cat)
                        .map((v) => (
                          <option key={v._id} value={v._id}>
                            {v.agentName} — ${v.price}
                          </option>
                        ))}
                    </select>
                  </FieldWrapper>

                  <FieldWrapper>
                    <label className="text-sm font-medium text-gray-700">
                      Number of {cat}s
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={selections[cat].count}
                      onChange={(e) =>
                        updateSelection(cat, "count", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter number"
                    />
                  </FieldWrapper>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                fullWidth
                size="lg"
                icon={Calculator}
                onClick={calculateVisa}
                disabled={!hasAnySelection}
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

          {/* Results Section */}
          {result && (
            <div className="calc-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calculator size={20} className="text-green-600" />
                Calculation Results
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {result.breakdown.map((b) => (
                  <div key={b.category}>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      {b.category} Visa Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Agent Name</span>
                        <span className="font-medium">{b.agentName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Number of Passengers
                        </span>
                        <span className="font-medium">{b.count}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">
                          Visa price per person
                        </span>
                        <span className="font-medium">
                          ${b.pricePerPerson.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Total visa price</span>
                        <span className="font-medium">
                          ${b.visaTotal.toFixed(2)}
                        </span>
                      </div>
                      {b.hotelBRN && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">
                            Hotel BRN ({b.count} × ${b.hotelBRNPrice})
                          </span>
                          <span className="font-medium text-orange-600">
                            ${b.hotelBRNTotal.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {b.foodBRN && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">
                            Food BRN ({b.count} × ${b.foodBRNPrice})
                          </span>
                          <span className="font-medium text-orange-600">
                            ${b.foodBRNTotal.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 font-semibold">
                          {b.category} Total
                        </span>
                        <span className="font-bold text-blue-700">
                          ${b.categoryTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Total */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                  <span className="text-gray-700 font-semibold">
                    Total final cost
                  </span>
                  <span className="font-bold text-lg text-blue-700">
                    ${result.totalFinalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && (
            <div className="calc-card p-8 text-center">
              <Calculator size={48} className="mx-auto text-brand-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {hasAnySelection ? "Ready to Calculate" : "No Calculation Yet"}
              </h3>
              <p className="text-sm text-gray-400">
                {hasAnySelection
                  ? "Click 'Calculate Costs' to see results"
                  : "Select a visa and passenger count for Adult, Child, and/or Infant, then click 'Calculate Costs' to see results"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

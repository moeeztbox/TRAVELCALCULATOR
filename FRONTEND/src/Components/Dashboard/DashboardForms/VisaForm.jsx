import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Calculator, Trash2, Printer, FileText, Save } from "lucide-react";
import PageHeader from "../../UI/PageHeader";
import Button from "../../UI/Button";
import ValidationErrors from "../../UI/ValidationErrors";
import SaveToHistoryModal from "../../UI/SaveToHistoryModal";
import PrintReportShell from "../../UI/PrintReportShell";
import { API_BASE_URL } from "../../../config/api";
import { saveCalculation } from "../../../utils/savedCalculations";
import { toUpper } from "../../../utils/text";

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
  const [clientName, setClientName] = useState("");
  const [result, setResult] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVisas();
  }, []);

  const fetchVisas = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/visas`, {
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

  // Per-category validity: a category is either untouched (both empty, fine
  // to leave optional), or fully complete with a valid whole-number count.
  // Any category with only one side filled, or a count of 0/negative/NaN,
  // blocks calculation until fixed.
  const categoryStates = CATEGORIES.map((cat) => {
    const { visaId, count } = selections[cat];
    const hasVisa = !!visaId;
    const hasCount = count !== "" && count !== null && count !== undefined;
    const countNum = Number(count);
    const countValid =
      hasCount && Number.isFinite(countNum) && Number.isInteger(countNum) && countNum > 0;
    return { cat, hasVisa, hasCount, countValid };
  });

  const completeCategories = categoryStates.filter(
    (c) => c.hasVisa && c.hasCount && c.countValid
  );
  const incompleteCategories = categoryStates.filter(
    (c) => (c.hasVisa || c.hasCount) && !(c.hasVisa && c.hasCount && c.countValid)
  );

  const validationErrors = [];
  categoryStates.forEach(({ cat, hasVisa, hasCount, countValid }) => {
    if (hasVisa && !hasCount) {
      validationErrors.push(`Enter a passenger count for ${cat}.`);
    } else if (!hasVisa && hasCount) {
      validationErrors.push(`Select a visa for ${cat}.`);
    } else if (hasVisa && hasCount && !countValid) {
      validationErrors.push(
        `${cat} passenger count must be a whole number greater than 0.`
      );
    }
  });
  if (validationErrors.length === 0 && completeCategories.length === 0) {
    validationErrors.push(
      "Select at least one visa category and enter a passenger count."
    );
  }

  const invalidPriceCategories = completeCategories.filter((c) => {
    const visa = visaData.find((v) => v._id === selections[c.cat].visaId);
    return !visa || !(Number.isFinite(visa.price) && visa.price > 0);
  });
  invalidPriceCategories.forEach((c) => {
    validationErrors.push(`Selected ${c.cat} visa has no valid price.`);
  });

  const canCalculate =
    incompleteCategories.length === 0 &&
    completeCategories.length > 0 &&
    invalidPriceCategories.length === 0;

  const calculateVisa = () => {
    if (!canCalculate) return;

    const active = completeCategories.map((c) => c.cat);

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

    setResult({ clientName, breakdown, totalFinalCost });
  };

  const handlePrint = () => window.print();

  const handleSaveConfirm = async (name) => {
    if (saving) return;
    if (!name.trim()) {
      alert("Please enter a client name.");
      return;
    }
    setSaving(true);
    try {
      const data = await saveCalculation({
        type: "visa",
        clientName: name.trim(),
        snapshot: result,
        total: result.totalFinalCost,
      });
      if (data.success) {
        alert(`Saved to history as ${data.data.referenceNumber}`);
        setShowSaveModal(false);
      } else {
        alert(data.message || "Error saving to history");
      }
    } catch (err) {
      console.error("Error saving to history:", err);
      alert("Error saving to history");
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setSelections(emptySelections());
    setClientName("");
    setResult(null);
  };

  return (
    <div className="calc">
      {/* PRINT CSS — same convention as HotelForm.jsx: the on-screen working
          view is hidden from print entirely, only the dedicated report
          block prints. */}
      <style>
        {`
          @media print {
            #visa-print-report {
              display: block !important;
              max-width: 720px;
              margin: 0 auto;
            }
          }
          #visa-print-report { display: none; }
        `}
      </style>

      <div className="max-w-6xl mx-auto no-print">
        {/* Header with Print Button */}
        <div className="mb-8">
          <PageHeader
            title="Visa Calculator"
            subtitle="Calculate visa costs by category"
            icon={FileText}
            onBack={() => navigate("/dashboard")}
            actions={
              result && (
                <>
                  <Button
                    variant="secondary"
                    icon={Save}
                    onClick={() => setShowSaveModal(true)}
                  >
                    Save
                  </Button>
                  <Button variant="secondary" icon={Printer} onClick={handlePrint}>
                    Print Report
                  </Button>
                </>
              )
            }
          />
        </div>

        {/* Input Section */}
        <div className="space-y-2">
          <div className="calc-card p-6">
            <FieldWrapper className="mb-4 md:max-w-xs">
              <label className="text-sm font-medium text-gray-700">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(toUpper(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter client name"
              />
            </FieldWrapper>

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

            {hasAnySelection && (
              <div className="mt-4">
                <ValidationErrors messages={validationErrors} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                fullWidth
                size="lg"
                icon={Calculator}
                onClick={calculateVisa}
                disabled={!canCalculate}
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calculator size={20} className="text-green-600" />
                  Calculation Results
                </h2>
                {result.clientName && (
                  <span className="text-sm text-gray-600">
                    Client: <span className="font-medium text-gray-900">{result.clientName}</span>
                  </span>
                )}
              </div>

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

      {/* PRINT-ONLY REPORT — one clean Excel-style table, one row per
          visa category actually used. */}
      {result && (
        <div id="visa-print-report">
          <PrintReportShell
            reportTitle="Visa Cost Report"
            clientName={result.clientName || "N/A"}
          >
            <table className="print-report-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Agent Name</th>
                  <th className="center">Passengers</th>
                  <th className="num">Price/Person</th>
                  <th className="num">Visa Total</th>
                  <th className="num">Hotel BRN</th>
                  <th className="num">Food BRN</th>
                  <th className="num">Category Total</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((b) => (
                  <tr key={b.category}>
                    <td>{b.category}</td>
                    <td>{b.agentName}</td>
                    <td className="center">{b.count}</td>
                    <td className="num">${b.pricePerPerson.toFixed(2)}</td>
                    <td className="num">${b.visaTotal.toFixed(2)}</td>
                    <td className="num">
                      {b.hotelBRN ? `$${b.hotelBRNTotal.toFixed(2)}` : "—"}
                    </td>
                    <td className="num">
                      {b.foodBRN ? `$${b.foodBRNTotal.toFixed(2)}` : "—"}
                    </td>
                    <td className="num">${b.categoryTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="grand-total">
                  <td colSpan={7} className="num">
                    Total Final Cost
                  </td>
                  <td className="num">${result.totalFinalCost.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </PrintReportShell>
        </div>
      )}

      <SaveToHistoryModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleSaveConfirm}
        label="Client Name"
        defaultValue={clientName}
        saving={saving}
      />
    </div>
  );
}

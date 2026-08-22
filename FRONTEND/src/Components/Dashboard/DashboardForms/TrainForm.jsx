import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Train as TrainIcon,
  Calculator,
  Printer,
  Trash2,
  Route as RouteIcon,
  MapPin,
  Navigation,
  User,
  Save,
} from "lucide-react";
import PageHeader from "../../UI/PageHeader";
import Button from "../../UI/Button";
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

export default function TrainCalculator() {
  const navigate = useNavigate();

  const [trainName, setTrainName] = useState("");
  const [trainClass, setTrainClass] = useState("");
  const [route, setRoute] = useState("");
  const [clientName, setClientName] = useState("");
  const [result, setResult] = useState(null);
  const [trains, setTrains] = useState([]);
  const [availableTrainNames, setAvailableTrainNames] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trains`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setTrains(data.data);
        const uniqueNames = [...new Set(data.data.map((t) => t.trainName))];
        setAvailableTrainNames(uniqueNames);
      }
    } catch (err) {
      console.error("Error fetching trains:", err);
    }
  };

  const handleTrainNameSelect = (selectedName) => {
    setTrainName(selectedName);
    setTrainClass("");
    setRoute("");
    setResult(null);

    const classesForName = trains
      .filter((t) => t.trainName === selectedName)
      .map((t) => t.trainClass);
    setAvailableClasses([...new Set(classesForName)]);
    setAvailableRoutes([]);
  };

  const handleClassSelect = (selectedClass) => {
    setTrainClass(selectedClass);
    setRoute("");
    setResult(null);

    const routesForNameAndClass = trains
      .filter((t) => t.trainName === trainName && t.trainClass === selectedClass)
      .map((t) => t.route);
    setAvailableRoutes([...new Set(routesForNameAndClass)]);
  };

  const handleRouteSelect = (selectedRoute) => {
    setRoute(selectedRoute);
    setResult(null);
  };

  const calculate = () => {
    if (!trainName || !trainClass || !route) {
      alert("Please select all fields!");
      return;
    }

    const selectedTrain = trains.find(
      (t) =>
        t.trainName === trainName &&
        t.trainClass === trainClass &&
        t.route === route
    );

    if (!selectedTrain) {
      alert("No train found for this combination!");
      return;
    }

    const price = parseFloat(selectedTrain.price);

    setResult({
      clientName,
      trainName: selectedTrain.trainName,
      route: selectedTrain.route,
      departure: selectedTrain.departure,
      arrival: selectedTrain.arrival,
      trainClass: selectedTrain.trainClass,
      agentName: selectedTrain.agentName,
      price,
      totalCost: price,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveConfirm = async (name) => {
    if (saving) return;
    if (!name.trim()) {
      alert("Please enter a client name.");
      return;
    }
    setSaving(true);
    try {
      const data = await saveCalculation({
        type: "trainTicket",
        clientName: name.trim(),
        snapshot: result,
        total: result.totalCost,
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
    setTrainName("");
    setTrainClass("");
    setRoute("");
    setClientName("");
    setResult(null);
    setAvailableClasses([]);
    setAvailableRoutes([]);
  };

  return (
    <div className="calc">
      {/* PRINT CSS — same convention as HotelForm.jsx: the on-screen working
          view is hidden from print entirely, only the dedicated report
          block prints. */}
      <style>
        {`
          @media print {
            #train-print-report {
              display: block !important;
              max-width: 720px;
              margin: 0 auto;
            }
          }
          #train-print-report { display: none; }
        `}
      </style>

      <div className="max-w-6xl mx-auto no-print">
        {/* Header with Print Button */}
        <div className="mb-8">
          <PageHeader
            title="Train Calculator"
            subtitle="Calculate train fares by route and class"
            icon={TrainIcon}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Train Name Selection */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Train Name
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={trainName}
                  onChange={(e) => handleTrainNameSelect(e.target.value)}
                >
                  <option value="">Choose train</option>
                  {availableTrainNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </FieldWrapper>

              {/* Class Selection */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Class
                </label>
                <select
                  className={`w-full p-3 border rounded-lg focus:ring-1 focus:ring-blue-500 ${
                    trainName
                      ? "border-gray-300 bg-white focus:border-blue-500"
                      : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  }`}
                  value={trainClass}
                  onChange={(e) => handleClassSelect(e.target.value)}
                  disabled={!trainName}
                >
                  <option value="">
                    {trainName ? "Select class" : "Select train first"}
                  </option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {!trainName && (
                  <p className="text-xs text-gray-400 mt-1">
                    Select a train first
                  </p>
                )}
              </FieldWrapper>

              {/* Route Selection */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Route
                </label>
                <select
                  className={`w-full p-3 border rounded-lg focus:ring-1 focus:ring-blue-500 ${
                    trainName && trainClass
                      ? "border-gray-300 bg-white focus:border-blue-500"
                      : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  }`}
                  value={route}
                  onChange={(e) => handleRouteSelect(e.target.value)}
                  disabled={!trainName || !trainClass}
                >
                  <option value="">
                    {trainName && trainClass
                      ? "Select route"
                      : "Select train and class first"}
                  </option>
                  {availableRoutes.map((routeItem) => (
                    <option key={routeItem} value={routeItem}>
                      {routeItem}
                    </option>
                  ))}
                </select>
                {(!trainName || !trainClass) && (
                  <p className="text-xs text-gray-400 mt-1">
                    Select train and class first
                  </p>
                )}
              </FieldWrapper>

              {/* Client Name */}
              <FieldWrapper>
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                fullWidth
                size="lg"
                icon={Calculator}
                onClick={calculate}
                disabled={!trainName || !trainClass || !route}
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

          {/* Results Section - Only shown after clicking Calculate */}
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
                {/* Left Column - Train Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <TrainIcon size={16} className="text-blue-600" />
                      Train Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Train Name</span>
                        <span className="font-medium text-right">
                          {result.trainName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-1">
                          <RouteIcon size={14} />
                          Route
                        </span>
                        <span className="font-medium text-right max-w-xs">
                          {result.route}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-1">
                          <MapPin size={14} />
                          Departure
                        </span>
                        <span className="font-medium">{result.departure}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Navigation size={14} />
                          Arrival
                        </span>
                        <span className="font-medium">{result.arrival}</span>
                      </div>
                    </div>
                  </div>

                  {/* Agent Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <User size={16} className="text-green-600" />
                      Agent Information
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Agent Name:</span>
                        <span className="font-medium">{result.agentName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Cost Breakdown */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Pricing Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Class</span>
                        <span className="font-medium">{result.trainClass}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Costs */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      Total Costs
                    </h3>
                    <div className="space-y-3">
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

          {/* Empty State - Shows when no fields selected OR after clear */}
          {!result && (
            <div className="calc-card p-8 text-center">
              <TrainIcon size={48} className="mx-auto text-brand-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {trainName && trainClass && route
                  ? "Ready to Calculate"
                  : "No Calculation Yet"}
              </h3>
              <p className="text-sm text-gray-400">
                {trainName && trainClass && route
                  ? "Click 'Calculate Costs' to see the results"
                  : "Select train, class, and route, then click 'Calculate Costs' to see results"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PRINT-ONLY REPORT — one clean Excel-style, one-row table. */}
      {result && (
        <div id="train-print-report">
          <PrintReportShell
            reportTitle="Train Ticket Cost Report"
            clientName={result.clientName || "N/A"}
          >
            <table className="print-report-table">
              <thead>
                <tr>
                  <th>Train Name</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Class</th>
                  <th>Agent Name</th>
                  <th className="num">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.trainName}</td>
                  <td>{result.route}</td>
                  <td>{result.departure}</td>
                  <td>{result.arrival}</td>
                  <td>{result.trainClass}</td>
                  <td>{result.agentName}</td>
                  <td className="num">${result.totalCost.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="grand-total">
                  <td colSpan={6} className="num">
                    Total Cost
                  </td>
                  <td className="num">${result.totalCost.toFixed(2)}</td>
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

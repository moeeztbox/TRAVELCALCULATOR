import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Car,
  Calculator,
  Printer,
  Trash2,
  Users,
  Route as RouteIcon,
  ArrowRightLeft,
  DollarSign,
  User,
} from "lucide-react";
import PageHeader from "../../UI/PageHeader";
import Button from "../../UI/Button";
import { API_BASE_URL } from "../../../config/api";

// Module scope (not inside the component) so its identity is stable across
// renders — otherwise React remounts this subtree (and loses input focus)
// on every keystroke. See HotelForm.jsx for the full explanation.
const FieldWrapper = ({ children, className = "" }) => (
  <div className={`space-y-1 ${className}`}>{children}</div>
);

export default function TransportCalculator() {
  const navigate = useNavigate();

  const [carType, setCarType] = useState("");
  const [tripType, setTripType] = useState("");
  const [route, setRoute] = useState("");
  const [result, setResult] = useState(null);
  const [transports, setTransports] = useState([]);
  const [availableCarTypes, setAvailableCarTypes] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState([]);

  const tripTypes = [
    { value: "oneway", label: "One Way" },
    { value: "roundtrip", label: "Round Trip" },
  ];

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transports`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setTransports(data.data);
        const uniqueCarTypes = [...new Set(data.data.map((t) => t.carType))];
        setAvailableCarTypes(uniqueCarTypes);
      }
    } catch (err) {
      console.error("Error fetching transports:", err);
    }
  };

  const handleCarTypeSelect = (selectedCarType) => {
    setCarType(selectedCarType);
    setRoute(""); // Reset route when car type changes
    setResult(null); // Clear result when changing selections

    // Filter available routes for this car type
    const routesForCarType = transports
      .filter((t) => t.carType === selectedCarType)
      .map((t) => t.route);
    setAvailableRoutes([...new Set(routesForCarType)]);
  };

  const handleTripTypeSelect = (selectedTripType) => {
    setTripType(selectedTripType);
    setRoute(""); // Reset route when trip type changes
    setResult(null); // Clear result when changing selections

    // Filter routes based on car type and trip type
    if (carType) {
      const routesForCarAndTrip = transports
        .filter((t) => t.carType === carType && t.tripType === selectedTripType)
        .map((t) => t.route);
      setAvailableRoutes([...new Set(routesForCarAndTrip)]);
    }
  };

  const handleRouteSelect = (selectedRoute) => {
    setRoute(selectedRoute);
    setResult(null); // Clear result when changing route
  };

  const calculate = () => {
    if (!carType || !tripType || !route) {
      alert("Please select all fields!");
      return;
    }

    // Find matching transport from DB
    const selectedTransport = transports.find(
      (t) =>
        t.carType === carType && t.tripType === tripType && t.route === route
    );

    if (!selectedTransport) {
      alert("No transport found for this combination!");
      return;
    }

    // Calculate results
    const basePrice = parseFloat(selectedTransport.price);

    // Calculate final price
    let finalPrice = basePrice;
    if (tripType === "roundtrip") {
      finalPrice = basePrice * 2;
    }

    setResult({
      carType: selectedTransport.carType,
      capacity: selectedTransport.capacity,
      tripType: selectedTransport.tripType,
      route: selectedTransport.route,
      agentName: selectedTransport.agentName,
      luggage: selectedTransport.luggage,
      price: basePrice,
      finalPrice: finalPrice,
      totalCost: finalPrice,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const clearForm = () => {
    setCarType("");
    setTripType("");
    setRoute("");
    setResult(null);
    setAvailableRoutes([]);
  };

  return (
    <div className="calc">
      <div className="max-w-6xl mx-auto">
        {/* Header with Print Button */}
        <div className="mb-8">
          <PageHeader
            title="Transport Calculator"
            subtitle="Calculate transport costs and commissions"
            icon={Car}
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
              {/* Car Type Selection */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Car Type
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={carType}
                  onChange={(e) => handleCarTypeSelect(e.target.value)}
                >
                  <option value="">Choose car type</option>
                  {availableCarTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FieldWrapper>

              {/* Trip Type Selection */}
              <FieldWrapper>
                <label className="text-sm font-medium text-gray-700">
                  Trip Type
                </label>
                <select
                  className={`w-full p-3 border rounded-lg focus:ring-1 focus:ring-blue-500 ${
                    carType
                      ? "border-gray-300 bg-white focus:border-blue-500"
                      : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  }`}
                  value={tripType}
                  onChange={(e) => handleTripTypeSelect(e.target.value)}
                  disabled={!carType}
                >
                  <option value="">
                    {carType ? "Select trip type" : "Select car type first"}
                  </option>
                  {tripTypes
                    .filter((type) =>
                      transports.some(
                        (t) =>
                          t.carType === carType && t.tripType === type.value
                      )
                    )
                    .map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                </select>
                {!carType && (
                  <p className="text-xs text-gray-400 mt-1">
                    Select a car type first
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
                    carType && tripType
                      ? "border-gray-300 bg-white focus:border-blue-500"
                      : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  }`}
                  value={route}
                  onChange={(e) => handleRouteSelect(e.target.value)}
                  disabled={!carType || !tripType}
                >
                  <option value="">
                    {carType && tripType
                      ? "Select route"
                      : "Select car type and trip type first"}
                  </option>
                  {availableRoutes.map((routeItem) => (
                    <option key={routeItem} value={routeItem}>
                      {routeItem}
                    </option>
                  ))}
                </select>
                {(!carType || !tripType) && (
                  <p className="text-xs text-gray-400 mt-1">
                    Select car type and trip type first
                  </p>
                )}
              </FieldWrapper>

              {/* Placeholder for alignment */}
              <div></div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                fullWidth
                size="lg"
                icon={Calculator}
                onClick={calculate}
                disabled={!carType || !tripType || !route}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calculator size={20} className="text-green-600" />
                Calculation Results
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Transport Details */}
                <div className="space-y-6">
                  {/* Transport Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <Car size={16} className="text-blue-600" />
                      Transport Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Car Type</span>
                        <span className="font-medium text-right">
                          {result.carType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Users size={14} />
                          Capacity
                        </span>
                        <span className="font-medium">
                          {result.capacity} passengers
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center gap-1">
                          <ArrowRightLeft size={14} />
                          Trip Type
                        </span>
                        <span className="font-medium">
                          {result.tripType === "oneway"
                            ? "One Way"
                            : "Round Trip"}
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
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Luggage</span>
                        <span className="font-medium">
                          {result.luggage} Bags
                        </span>
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
                  {/* Pricing Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                      <DollarSign size={16} className="text-purple-600" />
                      Pricing Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Base Price</span>
                        <span className="font-medium">
                          ${result.price.toFixed(2)}
                        </span>
                      </div>
                      {result.tripType === "roundtrip" && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">
                            Round Trip Factor
                          </span>
                          <span className="font-medium">× 2</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Transport Price</span>
                        <span className="font-medium text-blue-600">
                          ${result.finalPrice.toFixed(2)}
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
              <Car size={48} className="mx-auto text-brand-200 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {carType && tripType && route
                  ? "Ready to Calculate"
                  : "No Calculation Yet"}
              </h3>
              <p className="text-sm text-gray-400">
                {carType && tripType && route
                  ? "Click 'Calculate Costs' to see the results"
                  : "Select car type, trip type, and route, then click 'Calculate Costs' to see results"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

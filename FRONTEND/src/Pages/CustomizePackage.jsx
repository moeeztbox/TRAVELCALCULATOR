import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  Plane,
  Car,
  MapPin,
  Calculator,
  Printer,
  Trash2,
  PackageCheck,
  Landmark,
} from "lucide-react";
import { Field, inputClass } from "../Components/Main/FormControls";
import PageHeader from "../Components/UI/PageHeader";
import Button from "../Components/UI/Button";

const API = "http://localhost:5000/api";

// Common Ziyarat locations with an indicative charge (SAR) per person.
const ZIYARAT_LOCATIONS = [
  { name: "Masjid Quba", charge: 30 },
  { name: "Masjid Qiblatain", charge: 30 },
  { name: "Jannat-ul-Baqi", charge: 0 },
  { name: "Cave of Hira", charge: 50 },
  { name: "Cave of Thawr", charge: 50 },
  { name: "Jabal al-Noor", charge: 40 },
  { name: "Jabal Uhud", charge: 40 },
  { name: "Masjid al-Jinn", charge: 25 },
  { name: "Jannat al-Mualla", charge: 0 },
  { name: "Battle of Uhud Site", charge: 35 },
];

const money = (n) => `SAR ${Number(n || 0).toLocaleString()}`;

// Normalize a transport record's route (can be a string or legacy object)
const routeLabel = (t) => {
  if (typeof t.route === "string") return t.route;
  if (t.route && (t.route.from || t.route.to))
    return `${t.route.from || ""}${t.route.from && t.route.to ? " → " : ""}${
      t.route.to || ""
    }`;
  return t.routeString || "";
};

const CustomizePackage = () => {
  const navigate = useNavigate();

  // Listings loaded from backend
  const [hotels, setHotels] = useState([]);
  const [visas, setVisas] = useState([]);
  const [flights, setFlights] = useState([]);
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [packageName, setPackageName] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [totalNights, setTotalNights] = useState("");

  const [makkahHotelId, setMakkahHotelId] = useState("");
  const [makkahNights, setMakkahNights] = useState("");
  const [makkahPersons, setMakkahPersons] = useState("");
  const [madinahHotelId, setMadinahHotelId] = useState("");
  const [madinahNights, setMadinahNights] = useState("");
  const [madinahPersons, setMadinahPersons] = useState("");

  const [visaId, setVisaId] = useState("");
  const [flightId, setFlightId] = useState("");
  const [transportId, setTransportId] = useState("");
  const [transportPassengers, setTransportPassengers] = useState("");

  const [selectedZiyarat, setSelectedZiyarat] = useState([]);

  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [h, v, f, t] = await Promise.all([
          fetch(`${API}/hotels`).then((r) => r.json()),
          fetch(`${API}/visas`).then((r) => r.json()),
          fetch(`${API}/tickets`).then((r) => r.json()),
          fetch(`${API}/transports`).then((r) => r.json()),
        ]);
        if (h.success) setHotels(h.data || []);
        if (v.success) setVisas(v.data || []);
        if (f.success) setFlights(f.data || []);
        if (t.success) setTransports(t.data || []);
      } catch (err) {
        console.error("Error loading listings:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const makkahHotels = hotels.filter((h) => h.city === "Makkah");
  const madinahHotels = hotels.filter((h) => h.city === "Madinah");

  const findById = (arr, id) => arr.find((x) => x._id === id) || null;

  // Safely coerce a value to a positive number (guards against "", 0,
  // negative, and non-numeric input causing NaN/Infinity downstream).
  const toPositiveNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const toggleZiyarat = (name) => {
    setSelectedZiyarat((prev) =>
      prev.includes(name) ? prev.filter((z) => z !== name) : [...prev, name]
    );
  };

  const calculate = () => {
    if (!packageName) {
      alert("Please enter a package name.");
      return;
    }
    if (!makkahHotelId && !madinahHotelId && !visaId && !flightId && !transportId) {
      alert("Please select at least one service to build your package.");
      return;
    }

    const makkahHotel = findById(hotels, makkahHotelId);
    const madinahHotel = findById(hotels, madinahHotelId);
    const visa = findById(visas, visaId);
    const flight = findById(flights, flightId);
    const transport = findById(transports, transportId);

    // Per-person hotel cost for the full stay: (Hotel Price / Persons) × Nights
    const makkahNightsNum = toPositiveNumber(makkahNights);
    const makkahPersonsNum = toPositiveNumber(makkahPersons);
    const makkahPerPersonPrice =
      makkahHotel && makkahPersonsNum > 0
        ? Number(makkahHotel.price) / makkahPersonsNum
        : 0;
    const makkahCost = makkahPerPersonPrice * makkahNightsNum;

    const madinahNightsNum = toPositiveNumber(madinahNights);
    const madinahPersonsNum = toPositiveNumber(madinahPersons);
    const madinahPerPersonPrice =
      madinahHotel && madinahPersonsNum > 0
        ? Number(madinahHotel.price) / madinahPersonsNum
        : 0;
    const madinahCost = madinahPerPersonPrice * madinahNightsNum;

    // Hotels' contribution to the package total is the sum of each city's
    // per-person total — never the original/full hotel prices.
    const hotelCost = makkahCost + madinahCost;

    const visaCost = visa ? Number(visa.price) : 0;
    const flightCost = flight ? Number(flight.price) : 0;

    // Transport cost per person: Transport Price / Total Passengers
    const transportPassengersNum = toPositiveNumber(transportPassengers);
    const transportCost =
      transport && transportPassengersNum > 0
        ? Number(transport.price) / transportPassengersNum
        : 0;

    const ziyaratItems = ZIYARAT_LOCATIONS.filter((z) =>
      selectedZiyarat.includes(z.name)
    );
    const ziyaratCost = ziyaratItems.reduce((sum, z) => sum + z.charge, 0);

    const grandTotal =
      hotelCost + visaCost + flightCost + transportCost + ziyaratCost;

    setResult({
      packageName,
      totalDays,
      totalNights,
      makkahHotel,
      makkahNights: makkahNightsNum,
      makkahPersons: makkahPersonsNum,
      makkahPerPersonPrice,
      makkahCost,
      madinahHotel,
      madinahNights: madinahNightsNum,
      madinahPersons: madinahPersonsNum,
      madinahPerPersonPrice,
      madinahCost,
      visa,
      flight,
      transport,
      transportRoute: transport ? routeLabel(transport) : "",
      transportPassengers: transportPassengersNum,
      ziyaratItems,
      costs: {
        hotelCost,
        visaCost,
        flightCost,
        transportCost,
        ziyaratCost,
        grandTotal,
      },
    });

    // Scroll to the generated summary
    setTimeout(() => {
      document
        .getElementById("package-summary")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const clearAll = () => {
    setPackageName("");
    setTotalDays("");
    setTotalNights("");
    setMakkahHotelId("");
    setMakkahNights("");
    setMakkahPersons("");
    setMadinahHotelId("");
    setMadinahNights("");
    setMadinahPersons("");
    setVisaId("");
    setFlightId("");
    setTransportId("");
    setTransportPassengers("");
    setSelectedZiyarat([]);
    setResult(null);
  };

  const handlePrint = () => {
    const navElements = document.querySelectorAll(
      'nav, header, [role="navigation"]'
    );
    navElements.forEach((el) => (el.style.display = "none"));
    window.print();
    setTimeout(() => {
      navElements.forEach((el) => (el.style.display = ""));
    }, 100);
  };

  return (
    <div className="p-4 w-full">
      {/* PRINT CSS */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            nav, header, footer, [role="navigation"] { display: none !important; }
            body { -webkit-print-color-adjust: exact; background: white !important; }
            * { box-shadow: none !important; }
            #package-summary { border: 1px solid #000 !important; }
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 no-print">
          <PageHeader
            title="Customize Package"
            subtitle="Build your own package from available listings"
            icon={PackageCheck}
            onBack={() => navigate("/dashboard")}
          />
        </div>

        {loading ? (
          <div className="calc-card p-8 text-center text-muted no-print">
            Loading listings...
          </div>
        ) : (
          <div className="space-y-6 no-print">
            {/* PACKAGE BASICS */}
            <div className="calc-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                <PackageCheck size={20} className="text-red-600" />
                Package Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Package Name" required>
                  <input
                    type="text"
                    placeholder="My Custom Umrah Package"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Total Days">
                  <input
                    type="number"
                    placeholder="e.g. 14"
                    value={totalDays}
                    onChange={(e) => setTotalDays(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Total Nights">
                  <input
                    type="number"
                    placeholder="e.g. 13"
                    value={totalNights}
                    onChange={(e) => setTotalNights(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            {/* HOTELS */}
            <div className="calc-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                <Building2 size={20} className="text-blue-600" />
                Hotels
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Makkah */}
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                    Makkah Hotel
                  </p>
                  <div className="space-y-3">
                    <select
                      value={makkahHotelId}
                      onChange={(e) => setMakkahHotelId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Makkah hotel</option>
                      {makkahHotels.map((h) => (
                        <option key={h._id} value={h._id}>
                          {h.hotelName} · {h.roomType} · {money(h.price)}/night
                        </option>
                      ))}
                    </select>
                    <Field label="Nights in Makkah">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={makkahNights}
                        onChange={(e) => setMakkahNights(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Persons">
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 2"
                        value={makkahPersons}
                        onChange={(e) => setMakkahPersons(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                {/* Madinah */}
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                    Madinah Hotel
                  </p>
                  <div className="space-y-3">
                    <select
                      value={madinahHotelId}
                      onChange={(e) => setMadinahHotelId(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Madinah hotel</option>
                      {madinahHotels.map((h) => (
                        <option key={h._id} value={h._id}>
                          {h.hotelName} · {h.roomType} · {money(h.price)}/night
                        </option>
                      ))}
                    </select>
                    <Field label="Nights in Madinah">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={madinahNights}
                        onChange={(e) => setMadinahNights(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Persons">
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 2"
                        value={madinahPersons}
                        onChange={(e) => setMadinahPersons(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            {/* VISA / FLIGHT / TRANSPORT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="calc-card p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                  <FileText size={18} className="text-blue-600" />
                  Visa
                </h2>
                <select
                  value={visaId}
                  onChange={(e) => setVisaId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select visa</option>
                  {visas.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.category} · {v.passenger} · {money(v.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="calc-card p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                  <Plane size={18} className="text-blue-600" />
                  Flight
                </h2>
                <select
                  value={flightId}
                  onChange={(e) => setFlightId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select flight</option>
                  {flights.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.airlineName} · {f.category} · {money(f.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="calc-card p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                  <Car size={18} className="text-blue-600" />
                  Transport
                </h2>
                <select
                  value={transportId}
                  onChange={(e) => setTransportId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select transport</option>
                  {transports.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.carType} · {routeLabel(t)} · {money(t.price)}
                    </option>
                  ))}
                </select>
                <div className="mt-3">
                  <Field label="Total Passengers">
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 4"
                      value={transportPassengers}
                      onChange={(e) => setTransportPassengers(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ZIYARAT */}
            <div className="calc-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                <Landmark size={20} className="text-blue-600" />
                Ziyarat Locations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ZIYARAT_LOCATIONS.map((z) => {
                  const checked = selectedZiyarat.includes(z.name);
                  return (
                    <label
                      key={z.name}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 cursor-pointer transition ${
                        checked
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm text-gray-800">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleZiyarat(z.name)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        {z.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {z.charge ? money(z.charge) : "Free"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="calc-card p-6">
              <div className="flex gap-3">
                <Button
                  fullWidth
                  size="lg"
                  icon={Calculator}
                  onClick={calculate}
                >
                  Calculate Cost
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  icon={Trash2}
                  onClick={clearAll}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* GENERATED PACKAGE SUMMARY */}
        {result && (
          <div
            id="package-summary"
            className="bg-surface rounded-2xl border border-hair shadow-soft mt-8 overflow-hidden animate-fade-in-up"
          >
            {/* Summary header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-hair bg-linear-to-r from-brand-50 to-surface">
              <div>
                <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                  Custom Package
                </p>
                <h2 className="text-2xl font-extrabold text-ink">
                  {result.packageName}
                </h2>
                <p className="text-sm text-muted mt-1">
                  {result.totalDays || "—"} Days · {result.totalNights || "—"}{" "}
                  Nights
                </p>
              </div>
              <Button
                variant="success"
                icon={Printer}
                onClick={handlePrint}
                className="no-print"
              >
                Print
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* LEFT: selections */}
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <Building2 size={16} className="text-blue-600" /> Hotels
                  </h3>
                  <div className="space-y-2 text-sm">
                    <SummaryRow
                      label="Makkah"
                      value={
                        result.makkahHotel
                          ? `${result.makkahHotel.hotelName} (${result.makkahNights} nights, ${result.makkahPersons} persons)`
                          : "Not selected"
                      }
                    />
                    <SummaryRow
                      label="Madinah"
                      value={
                        result.madinahHotel
                          ? `${result.madinahHotel.hotelName} (${result.madinahNights} nights, ${result.madinahPersons} persons)`
                          : "Not selected"
                      }
                    />
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FileText size={16} className="text-blue-600" /> Services
                  </h3>
                  <div className="space-y-2 text-sm">
                    <SummaryRow
                      label="Visa"
                      value={
                        result.visa
                          ? `${result.visa.category} (${result.visa.passenger})`
                          : "Not selected"
                      }
                    />
                    <SummaryRow
                      label="Flight"
                      value={
                        result.flight
                          ? `${result.flight.airlineName} · ${result.flight.category}`
                          : "Not selected"
                      }
                    />
                    <SummaryRow
                      label="Transport"
                      value={
                        result.transport
                          ? `${result.transport.carType} · ${result.transportRoute} (${result.transportPassengers} passengers)`
                          : "Not selected"
                      }
                    />
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <MapPin size={16} className="text-blue-600" /> Ziyarat
                  </h3>
                  {result.ziyaratItems.length ? (
                    <div className="flex flex-wrap gap-2">
                      {result.ziyaratItems.map((z) => (
                        <span
                          key={z.name}
                          className="text-xs bg-blue-50 text-blue-700 rounded-full px-3 py-1 border border-blue-100"
                        >
                          {z.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No ziyarat locations selected
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT: cost breakdown */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  Cost Breakdown
                </h3>

                {/* Per-hotel / per-transport pricing detail */}
                <div className="space-y-3 mb-4">
                  {result.makkahHotel && (
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Makkah Hotel
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <DetailRow
                          label="Original Price"
                          value={money(result.makkahHotel.price)}
                        />
                        <DetailRow
                          label="Persons"
                          value={result.makkahPersons || 0}
                        />
                        <DetailRow
                          label="Per Person Price"
                          value={money(result.makkahPerPersonPrice)}
                        />
                        <DetailRow
                          label="Nights"
                          value={result.makkahNights || 0}
                        />
                        <DetailRow
                          label="Total for Makkah (Per Person)"
                          value={money(result.makkahCost)}
                          bold
                        />
                      </div>
                    </div>
                  )}

                  {result.madinahHotel && (
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Madinah Hotel
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <DetailRow
                          label="Original Price"
                          value={money(result.madinahHotel.price)}
                        />
                        <DetailRow
                          label="Persons"
                          value={result.madinahPersons || 0}
                        />
                        <DetailRow
                          label="Per Person Price"
                          value={money(result.madinahPerPersonPrice)}
                        />
                        <DetailRow
                          label="Nights"
                          value={result.madinahNights || 0}
                        />
                        <DetailRow
                          label="Total for Madinah (Per Person)"
                          value={money(result.madinahCost)}
                          bold
                        />
                      </div>
                    </div>
                  )}

                  {result.transport && (
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Transport
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <DetailRow
                          label="Original Price"
                          value={money(result.transport.price)}
                        />
                        <DetailRow
                          label="Total Passengers"
                          value={result.transportPassengers || 0}
                        />
                        <DetailRow
                          label="Per Person Price"
                          value={money(result.costs.transportCost)}
                          bold
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                  <CostRow
                    label="Hotels Total (Per Person)"
                    value={result.costs.hotelCost}
                    bold
                  />
                  <CostRow label="Visa" value={result.costs.visaCost} />
                  <CostRow label="Flight" value={result.costs.flightCost} />
                  <CostRow
                    label="Transport (Per Person)"
                    value={result.costs.transportCost}
                  />
                  <CostRow label="Ziyarat" value={result.costs.ziyaratCost} />
                  <div className="flex justify-between items-center px-4 py-4 bg-brand-600 text-white rounded-b-xl">
                    <span className="font-semibold">Grand Total</span>
                    <span className="text-xl font-extrabold">
                      {money(result.costs.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between items-center gap-4 border-b border-gray-100 pb-2">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900 text-right">{value}</span>
  </div>
);

const DetailRow = ({ label, value, bold = false }) => (
  <div className="flex justify-between items-center gap-3">
    <span className={bold ? "font-semibold text-gray-800" : "text-gray-500"}>
      {label}
    </span>
    <span className={bold ? "font-bold text-gray-900" : "font-medium text-gray-700"}>
      {value}
    </span>
  </div>
);

const CostRow = ({ label, value, bold = false }) => (
  <div
    className={`flex justify-between items-center px-4 py-3 ${
      bold ? "bg-gray-50" : ""
    }`}
  >
    <span className={bold ? "font-semibold text-gray-800" : "text-gray-600"}>
      {label}
    </span>
    <span className={bold ? "font-bold text-gray-900" : "font-medium"}>
      {money(value)}
    </span>
  </div>
);

export default CustomizePackage;

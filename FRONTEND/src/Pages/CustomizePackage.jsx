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
import SearchableCombobox from "../Components/UI/SearchableCombobox";

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

// Flatten a calculated `result` into the row shape the printable Excel-style
// table needs. Only categories that were actually selected/entered appear —
// unselected categories are simply omitted, never shown as broken/blank rows.
const buildPrintRows = (result) => {
  const rows = [];

  if (result.makkahHotel) {
    rows.push({
      category: "Makkah Hotel",
      item: `${result.makkahHotel.hotelName}${
        result.makkahHotel.isCustom ? " (Custom)" : ""
      }`,
      original: money(result.makkahHotel.price),
      persons: result.makkahPersons || "-",
      perPerson: money(result.makkahPerPersonPrice),
      nights: result.makkahNights || "-",
      total: money(result.makkahCost),
    });
  }

  if (result.madinahHotel) {
    rows.push({
      category: "Madinah Hotel",
      item: `${result.madinahHotel.hotelName}${
        result.madinahHotel.isCustom ? " (Custom)" : ""
      }`,
      original: money(result.madinahHotel.price),
      persons: result.madinahPersons || "-",
      perPerson: money(result.madinahPerPersonPrice),
      nights: result.madinahNights || "-",
      total: money(result.madinahCost),
    });
  }

  if (result.visa) {
    rows.push({
      category: "Visa",
      item: `${result.visa.category}${
        result.visa.isCustom ? " (Custom)" : ""
      }`,
      original: money(result.visa.price),
      persons: "-",
      perPerson: money(result.costs.visaCost),
      nights: "-",
      total: money(result.costs.visaCost),
    });
  }

  if (result.flight) {
    rows.push({
      category: "Flight",
      item: `${result.flight.airlineName}${
        result.flight.isCustom ? " (Custom)" : ""
      }`,
      original: money(result.flight.price),
      persons: "-",
      perPerson: money(result.costs.flightCost),
      nights: "-",
      total: money(result.costs.flightCost),
    });
  }

  if (result.transport) {
    rows.push({
      category: "Transport",
      item: `${result.transport.carType}${
        result.transport.isCustom ? " (Custom)" : ""
      }`,
      original: money(result.transport.price),
      persons: result.transportPassengers || "-",
      perPerson: money(result.costs.transportCost),
      nights: "-",
      total: money(result.costs.transportCost),
    });
  }

  if (result.ziyaratItems && result.ziyaratItems.length) {
    rows.push({
      category: "Ziyarat",
      item: result.ziyaratItems.map((z) => z.name).join(", "),
      original: money(result.costs.ziyaratCost),
      persons: "-",
      perPerson: money(result.costs.ziyaratCost),
      nights: "-",
      total: money(result.costs.ziyaratCost),
    });
  }

  return rows;
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

  // Makkah hotel — `*Selected` holds the matched database record (or null
  // when the typed text is a temporary custom hotel not backed by an ID).
  const [makkahHotelText, setMakkahHotelText] = useState("");
  const [makkahHotelSelected, setMakkahHotelSelected] = useState(null);
  const [makkahHotelPrice, setMakkahHotelPrice] = useState("");
  const [makkahNights, setMakkahNights] = useState("");
  const [makkahPersons, setMakkahPersons] = useState("");

  // Madinah hotel
  const [madinahHotelText, setMadinahHotelText] = useState("");
  const [madinahHotelSelected, setMadinahHotelSelected] = useState(null);
  const [madinahHotelPrice, setMadinahHotelPrice] = useState("");
  const [madinahNights, setMadinahNights] = useState("");
  const [madinahPersons, setMadinahPersons] = useState("");

  // Visa
  const [visaTypeText, setVisaTypeText] = useState("");
  const [visaSelected, setVisaSelected] = useState(null);
  const [visaPrice, setVisaPrice] = useState("");

  // Flight
  const [flightText, setFlightText] = useState("");
  const [flightSelected, setFlightSelected] = useState(null);
  const [flightPrice, setFlightPrice] = useState("");

  // Transport
  const [transportText, setTransportText] = useState("");
  const [transportSelected, setTransportSelected] = useState(null);
  const [transportPrice, setTransportPrice] = useState("");
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

  // Safely coerce a value to a positive number (guards against "", 0,
  // negative, and non-numeric input causing NaN/Infinity downstream).
  const toPositiveNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  // Safely coerce a price to a non-negative number.
  const safePrice = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  // Resolve a combobox field to either the selected database record
  // (isCustom: false) or a temporary custom item built from the typed
  // text + manually entered price (isCustom: true). Custom items are
  // never persisted — they only exist in this component's state.
  const resolveItem = (text, selected, priceInput, labelField) => {
    if (selected) return { ...selected, isCustom: false };
    const trimmed = (text || "").trim();
    if (!trimmed) return null;
    return {
      [labelField]: trimmed,
      price: safePrice(priceInput),
      isCustom: true,
      _id: null,
    };
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

    const makkahHotel = resolveItem(
      makkahHotelText,
      makkahHotelSelected,
      makkahHotelPrice,
      "hotelName"
    );
    const madinahHotel = resolveItem(
      madinahHotelText,
      madinahHotelSelected,
      madinahHotelPrice,
      "hotelName"
    );
    const visa = resolveItem(visaTypeText, visaSelected, visaPrice, "category");
    const flight = resolveItem(
      flightText,
      flightSelected,
      flightPrice,
      "airlineName"
    );
    const transport = resolveItem(
      transportText,
      transportSelected,
      transportPrice,
      "carType"
    );

    if (!makkahHotel && !madinahHotel && !visa && !flight && !transport) {
      alert("Please add at least one service to build your package.");
      return;
    }

    // Per-person hotel cost for the full stay: (Hotel Price / Persons) × Nights
    const makkahNightsNum = toPositiveNumber(makkahNights);
    const makkahPersonsNum = toPositiveNumber(makkahPersons);
    const makkahPerPersonPrice =
      makkahHotel && makkahPersonsNum > 0
        ? safePrice(makkahHotel.price) / makkahPersonsNum
        : 0;
    const makkahCost = makkahPerPersonPrice * makkahNightsNum;

    const madinahNightsNum = toPositiveNumber(madinahNights);
    const madinahPersonsNum = toPositiveNumber(madinahPersons);
    const madinahPerPersonPrice =
      madinahHotel && madinahPersonsNum > 0
        ? safePrice(madinahHotel.price) / madinahPersonsNum
        : 0;
    const madinahCost = madinahPerPersonPrice * madinahNightsNum;

    // Hotels' contribution to the package total is the sum of each city's
    // per-person total — never the original/full hotel prices.
    const hotelCost = makkahCost + madinahCost;

    const visaCost = visa ? safePrice(visa.price) : 0;
    const flightCost = flight ? safePrice(flight.price) : 0;

    // Transport cost per person: Transport Price / Total Passengers
    const transportPassengersNum = toPositiveNumber(transportPassengers);
    const transportCost =
      transport && transportPassengersNum > 0
        ? safePrice(transport.price) / transportPassengersNum
        : 0;

    const ziyaratItems = ZIYARAT_LOCATIONS.filter((z) =>
      selectedZiyarat.includes(z.name)
    );
    const ziyaratCost = ziyaratItems.reduce((sum, z) => sum + z.charge, 0);

    // Grand total is strictly per-person: every component above is already
    // a per-person figure (hotels divided by persons, transport divided by
    // passengers), so summing them yields the price for one person.
    const grandTotal =
      hotelCost + visaCost + flightCost + transportCost + ziyaratCost;

    setResult({
      packageName,
      totalDays,
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

    setMakkahHotelText("");
    setMakkahHotelSelected(null);
    setMakkahHotelPrice("");
    setMakkahNights("");
    setMakkahPersons("");

    setMadinahHotelText("");
    setMadinahHotelSelected(null);
    setMadinahHotelPrice("");
    setMadinahNights("");
    setMadinahPersons("");

    setVisaTypeText("");
    setVisaSelected(null);
    setVisaPrice("");

    setFlightText("");
    setFlightSelected(null);
    setFlightPrice("");

    setTransportText("");
    setTransportSelected(null);
    setTransportPrice("");
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

  const printRows = result ? buildPrintRows(result) : [];

  return (
    <div className="p-4 w-full">
      {/* PRINT CSS */}
      <style>
        {`
          .print-only-summary { display: none; }

          @media print {
            .no-print { display: none !important; }
            nav, header, footer, [role="navigation"] { display: none !important; }
            body { -webkit-print-color-adjust: exact; background: white !important; }
            * { box-shadow: none !important; }
            #package-summary { border: 1px solid #000 !important; }
            .screen-only-summary { display: none !important; }
            .print-only-summary { display: block !important; }

            .print-summary-table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              font-size: 11px;
            }
            .print-summary-table th,
            .print-summary-table td {
              border: 1px solid #000;
              padding: 6px 8px;
              word-wrap: break-word;
              overflow-wrap: break-word;
              vertical-align: top;
              text-align: left;
            }
            .print-summary-table thead th {
              background: #eee !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-weight: 700;
            }
            .print-summary-table .num { text-align: right; }
            .print-summary-table .center { text-align: center; }
            .print-summary-table tfoot td {
              font-weight: 700;
            }
            .print-summary-table tfoot .grand-total td {
              background: #eee !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-size: 13px;
            }
            .print-summary-table tbody tr { page-break-inside: avoid; }
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Field label="Hotel Name">
                      <SearchableCombobox
                        value={makkahHotelText}
                        onTextChange={(text) => {
                          setMakkahHotelText(text);
                          setMakkahHotelSelected(null);
                        }}
                        onSelect={(hotel) => {
                          setMakkahHotelSelected(hotel);
                          setMakkahHotelText(hotel.hotelName);
                          setMakkahHotelPrice(String(hotel.price ?? ""));
                        }}
                        options={makkahHotels}
                        getLabel={(h) => h.hotelName}
                        getSubLabel={(h) =>
                          `${h.roomType ? h.roomType + " · " : ""}${money(
                            h.price
                          )}/night`
                        }
                        placeholder="Search or type a Makkah hotel"
                        isSelected={!!makkahHotelSelected}
                      />
                    </Field>
                    <Field
                      label={
                        makkahHotelSelected
                          ? "Price / Night (from database)"
                          : "Price / Night (custom)"
                      }
                    >
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={makkahHotelPrice}
                        onChange={(e) => setMakkahHotelPrice(e.target.value)}
                        readOnly={!!makkahHotelSelected}
                        disabled={!!makkahHotelSelected}
                        className={`${inputClass} ${
                          makkahHotelSelected
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    </Field>
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
                    <Field label="Hotel Name">
                      <SearchableCombobox
                        value={madinahHotelText}
                        onTextChange={(text) => {
                          setMadinahHotelText(text);
                          setMadinahHotelSelected(null);
                        }}
                        onSelect={(hotel) => {
                          setMadinahHotelSelected(hotel);
                          setMadinahHotelText(hotel.hotelName);
                          setMadinahHotelPrice(String(hotel.price ?? ""));
                        }}
                        options={madinahHotels}
                        getLabel={(h) => h.hotelName}
                        getSubLabel={(h) =>
                          `${h.roomType ? h.roomType + " · " : ""}${money(
                            h.price
                          )}/night`
                        }
                        placeholder="Search or type a Madinah hotel"
                        isSelected={!!madinahHotelSelected}
                      />
                    </Field>
                    <Field
                      label={
                        madinahHotelSelected
                          ? "Price / Night (from database)"
                          : "Price / Night (custom)"
                      }
                    >
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={madinahHotelPrice}
                        onChange={(e) => setMadinahHotelPrice(e.target.value)}
                        readOnly={!!madinahHotelSelected}
                        disabled={!!madinahHotelSelected}
                        className={`${inputClass} ${
                          madinahHotelSelected
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    </Field>
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
                <div className="space-y-3">
                  <Field label="Visa Type">
                    <SearchableCombobox
                      value={visaTypeText}
                      onTextChange={(text) => {
                        setVisaTypeText(text);
                        setVisaSelected(null);
                      }}
                      onSelect={(v) => {
                        setVisaSelected(v);
                        setVisaTypeText(v.category);
                        setVisaPrice(String(v.price ?? ""));
                      }}
                      options={visas}
                      getLabel={(v) => v.category}
                      getSubLabel={(v) => `${v.passenger} · ${money(v.price)}`}
                      placeholder="Search or type a visa type"
                      isSelected={!!visaSelected}
                    />
                  </Field>
                  <Field
                    label={visaSelected ? "Price (from database)" : "Price (custom)"}
                  >
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={visaPrice}
                      onChange={(e) => setVisaPrice(e.target.value)}
                      readOnly={!!visaSelected}
                      disabled={!!visaSelected}
                      className={`${inputClass} ${
                        visaSelected
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </Field>
                </div>
              </div>

              <div className="calc-card p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                  <Plane size={18} className="text-blue-600" />
                  Flight
                </h2>
                <div className="space-y-3">
                  <Field label="Flight">
                    <SearchableCombobox
                      value={flightText}
                      onTextChange={(text) => {
                        setFlightText(text);
                        setFlightSelected(null);
                      }}
                      onSelect={(f) => {
                        setFlightSelected(f);
                        setFlightText(f.airlineName);
                        setFlightPrice(String(f.price ?? ""));
                      }}
                      options={flights}
                      getLabel={(f) => f.airlineName}
                      getSubLabel={(f) => `${f.category} · ${money(f.price)}`}
                      placeholder="Search or type a flight"
                      isSelected={!!flightSelected}
                    />
                  </Field>
                  <Field
                    label={
                      flightSelected ? "Price (from database)" : "Price (custom)"
                    }
                  >
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={flightPrice}
                      onChange={(e) => setFlightPrice(e.target.value)}
                      readOnly={!!flightSelected}
                      disabled={!!flightSelected}
                      className={`${inputClass} ${
                        flightSelected
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </Field>
                </div>
              </div>

              <div className="calc-card p-6">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                  <Car size={18} className="text-blue-600" />
                  Transport
                </h2>
                <div className="space-y-3">
                  <Field label="Transport">
                    <SearchableCombobox
                      value={transportText}
                      onTextChange={(text) => {
                        setTransportText(text);
                        setTransportSelected(null);
                      }}
                      onSelect={(t) => {
                        setTransportSelected(t);
                        setTransportText(t.carType);
                        setTransportPrice(String(t.price ?? ""));
                      }}
                      options={transports}
                      getLabel={(t) => t.carType}
                      getSubLabel={(t) => `${routeLabel(t)} · ${money(t.price)}`}
                      placeholder="Search or type a transport option"
                      isSelected={!!transportSelected}
                    />
                  </Field>
                  <Field
                    label={
                      transportSelected
                        ? "Price (from database)"
                        : "Price (custom)"
                    }
                  >
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={transportPrice}
                      onChange={(e) => setTransportPrice(e.target.value)}
                      readOnly={!!transportSelected}
                      disabled={!!transportSelected}
                      className={`${inputClass} ${
                        transportSelected
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </Field>
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
                  {result.totalDays || "—"} Days · Price shown is per person
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

            <div className="screen-only-summary grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
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
                          ? `${result.makkahHotel.hotelName}${
                              result.makkahHotel.isCustom ? " (Custom)" : ""
                            } (${result.makkahNights} nights, ${
                              result.makkahPersons
                            } persons)`
                          : "Not selected"
                      }
                    />
                    <SummaryRow
                      label="Madinah"
                      value={
                        result.madinahHotel
                          ? `${result.madinahHotel.hotelName}${
                              result.madinahHotel.isCustom ? " (Custom)" : ""
                            } (${result.madinahNights} nights, ${
                              result.madinahPersons
                            } persons)`
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
                          ? `${result.visa.category}${
                              result.visa.isCustom ? " (Custom)" : ""
                            } · ${money(result.costs.visaCost)}`
                          : "Not selected"
                      }
                    />
                    <SummaryRow
                      label="Flight"
                      value={
                        result.flight
                          ? `${result.flight.airlineName}${
                              result.flight.isCustom ? " (Custom)" : ""
                            } · ${money(result.costs.flightCost)}`
                          : "Not selected"
                      }
                    />
                    <SummaryRow
                      label="Transport"
                      value={
                        result.transport
                          ? `${result.transport.carType}${
                              result.transport.isCustom
                                ? " (Custom)"
                                : ` · ${routeLabel(result.transport)}`
                            } (${result.transportPassengers} passengers)`
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
                  Cost Breakdown (Per Person)
                </h3>

                {/* Per-item pricing detail */}
                <div className="space-y-3 mb-4">
                  {result.makkahHotel && (
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Makkah Hotel
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <DetailRow
                          label="Hotel"
                          value={`${result.makkahHotel.hotelName}${
                            result.makkahHotel.isCustom ? " (Custom)" : ""
                          }`}
                        />
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
                          label="Hotel"
                          value={`${result.madinahHotel.hotelName}${
                            result.madinahHotel.isCustom ? " (Custom)" : ""
                          }`}
                        />
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

                  {result.visa && (
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Visa
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <DetailRow
                          label="Visa Type"
                          value={`${result.visa.category}${
                            result.visa.isCustom ? " (Custom)" : ""
                          }`}
                        />
                        <DetailRow
                          label="Price"
                          value={money(result.costs.visaCost)}
                          bold
                        />
                      </div>
                    </div>
                  )}

                  {result.flight && (
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Flight
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <DetailRow
                          label="Flight"
                          value={`${result.flight.airlineName}${
                            result.flight.isCustom ? " (Custom)" : ""
                          }`}
                        />
                        <DetailRow
                          label="Price"
                          value={money(result.costs.flightCost)}
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
                          label="Transport"
                          value={`${result.transport.carType}${
                            result.transport.isCustom ? " (Custom)" : ""
                          }`}
                        />
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
                    <span className="font-semibold">
                      Grand Total (Per Person)
                    </span>
                    <span className="text-xl font-extrabold">
                      {money(result.costs.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PRINT-ONLY: Excel-style result table */}
            <div className="print-only-summary px-6 pb-6">
              <table className="print-summary-table">
                <colgroup>
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "27%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "14%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Selected Item</th>
                    <th className="num">Original Price</th>
                    <th className="center">Persons / Passengers</th>
                    <th className="num">Per Person Price</th>
                    <th className="center">Nights</th>
                    <th className="num">Total Per Person</th>
                  </tr>
                </thead>
                <tbody>
                  {printRows.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.category}</td>
                      <td>{row.item}</td>
                      <td className="num">{row.original}</td>
                      <td className="center">{row.persons}</td>
                      <td className="num">{row.perPerson}</td>
                      <td className="center">{row.nights}</td>
                      <td className="num">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6} className="num">
                      Total Hotels Per Person
                    </td>
                    <td className="num">{money(result.costs.hotelCost)}</td>
                  </tr>
                  <tr className="grand-total">
                    <td colSpan={6} className="num">
                      Final Package Total Per Person
                    </td>
                    <td className="num">{money(result.costs.grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
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

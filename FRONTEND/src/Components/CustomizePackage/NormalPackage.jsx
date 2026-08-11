import React, { useState, useEffect } from "react";
import {
  Building2,
  FileText,
  Plane,
  Car,
  Calculator,
  Printer,
  Trash2,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";
import { Field, inputClass } from "../Main/FormControls";
import Button from "../UI/Button";
import SearchableCombobox from "../UI/SearchableCombobox";
import useDualCurrencyPrice from "./useDualCurrencyPrice";

const API = "http://localhost:5000/api";

const money = (n) => `SAR ${Number(n || 0).toLocaleString()}`;
const moneyPKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;
// A SAR figure shown alongside its PKR equivalent. PKR is always derived by
// multiplying the SAR figure by the conversion rate at display time — this
// is the only place the multiplication happens, so every PKR number shown
// (per-person prices, totals, the grand total) is guaranteed to stay
// mathematically consistent with its SAR counterpart × the current rate.
const dual = (sarAmount, rate) => `${money(sarAmount)} | ${moneyPKR(sarAmount * rate)}`;

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
  const rate = result.conversionRate;
  const rows = [];

  if (result.makkahHotel) {
    rows.push({
      category: "Makkah Hotel",
      item: `${result.makkahHotel.hotelName}${
        result.makkahHotel.isCustom ? " (Custom)" : ""
      }`,
      originalSAR: money(result.makkahHotel.price),
      originalPKR: moneyPKR(result.makkahHotel.price * rate),
      persons: result.makkahPersons || "-",
      nights: result.makkahNights || "-",
      perPersonSAR: money(result.makkahPerPersonPrice),
      perPersonPKR: moneyPKR(result.makkahPerPersonPrice * rate),
      totalSAR: money(result.makkahCost),
      totalPKR: moneyPKR(result.makkahCost * rate),
    });
  }

  if (result.madinahHotel) {
    rows.push({
      category: "Madinah Hotel",
      item: `${result.madinahHotel.hotelName}${
        result.madinahHotel.isCustom ? " (Custom)" : ""
      }`,
      originalSAR: money(result.madinahHotel.price),
      originalPKR: moneyPKR(result.madinahHotel.price * rate),
      persons: result.madinahPersons || "-",
      nights: result.madinahNights || "-",
      perPersonSAR: money(result.madinahPerPersonPrice),
      perPersonPKR: moneyPKR(result.madinahPerPersonPrice * rate),
      totalSAR: money(result.madinahCost),
      totalPKR: moneyPKR(result.madinahCost * rate),
    });
  }

  if (result.visa) {
    rows.push({
      category: "Visa",
      item: `${result.visa.category}${
        result.visa.isCustom ? " (Custom)" : ""
      }`,
      originalSAR: money(result.visa.price),
      originalPKR: moneyPKR(result.visa.price * rate),
      persons: "-",
      nights: "-",
      perPersonSAR: money(result.costs.visaCost),
      perPersonPKR: moneyPKR(result.costs.visaCost * rate),
      totalSAR: money(result.costs.visaCost),
      totalPKR: moneyPKR(result.costs.visaCost * rate),
    });
  }

  if (result.flight) {
    rows.push({
      category: "Flight",
      item: `${result.flight.airlineName}${
        result.flight.isCustom ? " (Custom)" : ""
      }`,
      originalSAR: money(result.flight.price),
      originalPKR: moneyPKR(result.flight.price * rate),
      persons: "-",
      nights: "-",
      perPersonSAR: money(result.costs.flightCost),
      perPersonPKR: moneyPKR(result.costs.flightCost * rate),
      totalSAR: money(result.costs.flightCost),
      totalPKR: moneyPKR(result.costs.flightCost * rate),
    });
  }

  if (result.transport) {
    rows.push({
      category: "Transport",
      item: `${result.transport.carType}${
        result.transport.isCustom ? " (Custom)" : ""
      }`,
      originalSAR: money(result.transport.price),
      originalPKR: moneyPKR(result.transport.price * rate),
      persons: result.transportPassengers || "-",
      nights: "-",
      perPersonSAR: money(result.costs.transportCost),
      perPersonPKR: moneyPKR(result.costs.transportCost * rate),
      totalSAR: money(result.costs.transportCost),
      totalPKR: moneyPKR(result.costs.transportCost * rate),
    });
  }

  return rows;
};

const NormalPackage = () => {
  // Listings loaded from backend
  const [hotels, setHotels] = useState([]);
  const [visas, setVisas] = useState([]);
  const [flights, setFlights] = useState([]);
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [packageName, setPackageName] = useState("");
  const [totalDays, setTotalDays] = useState("");

  // Manually entered conversion rate: 1 SAR = ? PKR. Never fetched live.
  const [conversionRate, setConversionRate] = useState("");

  // Safely coerce a value to a positive number (guards against "", 0,
  // negative, and non-numeric input causing NaN/Infinity downstream).
  const toPositiveNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const conversionRateNum = toPositiveNumber(conversionRate);

  // Makkah hotel — `*Selected` holds the matched database record (or null
  // when the typed text is a temporary custom hotel not backed by an ID).
  const [makkahHotelText, setMakkahHotelText] = useState("");
  const [makkahHotelSelected, setMakkahHotelSelected] = useState(null);
  const makkahHotelPrice = useDualCurrencyPrice(conversionRateNum);
  const [makkahNights, setMakkahNights] = useState("");
  const [makkahPersons, setMakkahPersons] = useState("");

  // Madinah hotel
  const [madinahHotelText, setMadinahHotelText] = useState("");
  const [madinahHotelSelected, setMadinahHotelSelected] = useState(null);
  const madinahHotelPrice = useDualCurrencyPrice(conversionRateNum);
  const [madinahNights, setMadinahNights] = useState("");
  const [madinahPersons, setMadinahPersons] = useState("");

  // Visa
  const [visaTypeText, setVisaTypeText] = useState("");
  const [visaSelected, setVisaSelected] = useState(null);
  const visaPrice = useDualCurrencyPrice(conversionRateNum);

  // Flight
  const [flightText, setFlightText] = useState("");
  const [flightSelected, setFlightSelected] = useState(null);
  const flightPrice = useDualCurrencyPrice(conversionRateNum);

  // Transport
  const [transportText, setTransportText] = useState("");
  const [transportSelected, setTransportSelected] = useState(null);
  const transportPrice = useDualCurrencyPrice(conversionRateNum);
  const [transportPassengers, setTransportPassengers] = useState("");

  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const opts = { credentials: "include" };
        const [h, v, f, t] = await Promise.all([
          fetch(`${API}/hotels`, opts).then((r) => r.json()),
          fetch(`${API}/visas`, opts).then((r) => r.json()),
          fetch(`${API}/tickets`, opts).then((r) => r.json()),
          fetch(`${API}/transports`, opts).then((r) => r.json()),
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

  // Safely coerce a price to a non-negative number.
  const safePrice = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  // Resolve a combobox field to either the selected database record
  // (isCustom: false) or a temporary custom item built from the typed
  // text + manually entered SAR price (isCustom: true). Custom items are
  // never persisted — they only exist in this component's state.
  const resolveItem = (text, selected, sarPriceInput, labelField) => {
    if (selected) return { ...selected, isCustom: false };
    const trimmed = (text || "").trim();
    if (!trimmed) return null;
    return {
      [labelField]: trimmed,
      price: safePrice(sarPriceInput),
      isCustom: true,
      _id: null,
    };
  };

  // Total Days vs. Makkah/Madinah nights validation. A short stay/long
  // package tolerance of 1–2 days (e.g. arrival/departure days that don't
  // count as a hotel night) is allowed; anything else is flagged. This is
  // only enforced once the user has actually started entering nights —
  // a Visa/Flight-only package with no hotel nights is never blocked by it.
  const makkahNightsNum = toPositiveNumber(makkahNights);
  const madinahNightsNum = toPositiveNumber(madinahNights);
  const totalDaysNum = toPositiveNumber(totalDays);
  const nightsEntered = makkahNightsNum > 0 || madinahNightsNum > 0;
  const combinedNights = makkahNightsNum + madinahNightsNum;
  const nightsDifference = totalDaysNum - combinedNights;
  const nightsValidationError = !nightsEntered
    ? ""
    : totalDaysNum <= 0
    ? "Enter a valid Total Days to validate the Makkah/Madinah nights."
    : nightsDifference !== 1 && nightsDifference !== 2
    ? "Makkah and Madinah nights do not match the Total Days."
    : "";

  // Conversion Rate validation. Only required once at least one priced
  // category is actually being used — a blank form never shows this error.
  const pricingInUse = !!(
    makkahHotelText.trim() ||
    madinahHotelText.trim() ||
    visaTypeText.trim() ||
    flightText.trim() ||
    transportText.trim()
  );
  const conversionRateError = !pricingInUse
    ? ""
    : conversionRate === ""
    ? "Enter a Conversion Rate to calculate PKR prices."
    : conversionRateNum <= 0
    ? "Conversion Rate must be a positive number."
    : "";

  const calculate = () => {
    if (!packageName) {
      alert("Please enter a package name.");
      return;
    }

    if (nightsValidationError) {
      alert(nightsValidationError);
      return;
    }

    if (conversionRateError) {
      alert(conversionRateError);
      return;
    }

    const makkahHotel = resolveItem(
      makkahHotelText,
      makkahHotelSelected,
      makkahHotelPrice.sar,
      "hotelName"
    );
    const madinahHotel = resolveItem(
      madinahHotelText,
      madinahHotelSelected,
      madinahHotelPrice.sar,
      "hotelName"
    );
    const visa = resolveItem(
      visaTypeText,
      visaSelected,
      visaPrice.sar,
      "category"
    );
    const flight = resolveItem(
      flightText,
      flightSelected,
      flightPrice.sar,
      "airlineName"
    );
    const transport = resolveItem(
      transportText,
      transportSelected,
      transportPrice.sar,
      "carType"
    );

    if (!makkahHotel && !madinahHotel && !visa && !flight && !transport) {
      alert("Please add at least one service to build your package.");
      return;
    }

    // Per-person hotel cost for the full stay: (Hotel Price / Persons) × Nights
    const makkahPersonsNum = toPositiveNumber(makkahPersons);
    const makkahPerPersonPrice =
      makkahHotel && makkahPersonsNum > 0
        ? safePrice(makkahHotel.price) / makkahPersonsNum
        : 0;
    const makkahCost = makkahPerPersonPrice * makkahNightsNum;

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

    // Grand total is strictly per-person: every component above is already
    // a per-person figure (hotels divided by persons, transport divided by
    // passengers), so summing them yields the price for one person. PKR
    // equivalents are derived from these SAR figures at display time only.
    const grandTotal = hotelCost + visaCost + flightCost + transportCost;

    setResult({
      packageName,
      totalDays,
      conversionRate: conversionRateNum,
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
      costs: {
        hotelCost,
        visaCost,
        flightCost,
        transportCost,
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
    setConversionRate("");

    setMakkahHotelText("");
    setMakkahHotelSelected(null);
    makkahHotelPrice.reset();
    setMakkahNights("");
    setMakkahPersons("");

    setMadinahHotelText("");
    setMadinahHotelSelected(null);
    madinahHotelPrice.reset();
    setMadinahNights("");
    setMadinahPersons("");

    setVisaTypeText("");
    setVisaSelected(null);
    visaPrice.reset();

    setFlightText("");
    setFlightSelected(null);
    flightPrice.reset();

    setTransportText("");
    setTransportSelected(null);
    transportPrice.reset();
    setTransportPassengers("");

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
  const canCalculate = !nightsValidationError && !conversionRateError;

  return (
    <>
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
              font-size: 10px;
            }
            .print-summary-table th,
            .print-summary-table td {
              border: 1px solid #000;
              padding: 5px 6px;
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
              font-size: 12px;
            }
            .print-summary-table tbody tr { page-break-inside: avoid; }
          }
        `}
      </style>

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
                  min="1"
                  placeholder="e.g. 14"
                  value={totalDays}
                  onChange={(e) => setTotalDays(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Conversion Rate (1 SAR = ? PKR)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 75"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            {(nightsValidationError || conversionRateError) && (
              <div className="mt-4 space-y-2">
                {nightsValidationError && (
                  <ValidationBanner message={nightsValidationError} />
                )}
                {conversionRateError && (
                  <ValidationBanner message={conversionRateError} />
                )}
              </div>
            )}
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
                        makkahHotelPrice.setFromDatabase(hotel.price);
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
                  <DualPriceFields
                    isDbLocked={!!makkahHotelSelected}
                    priceState={makkahHotelPrice}
                  />
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
                        madinahHotelPrice.setFromDatabase(hotel.price);
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
                  <DualPriceFields
                    isDbLocked={!!madinahHotelSelected}
                    priceState={madinahHotelPrice}
                  />
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
                      visaPrice.setFromDatabase(v.price);
                    }}
                    options={visas}
                    getLabel={(v) => v.category}
                    getSubLabel={(v) => `${v.passenger} · ${money(v.price)}`}
                    placeholder="Search or type a visa type"
                    isSelected={!!visaSelected}
                  />
                </Field>
                <DualPriceFields
                  isDbLocked={!!visaSelected}
                  priceState={visaPrice}
                />
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
                      flightPrice.setFromDatabase(f.price);
                    }}
                    options={flights}
                    getLabel={(f) => f.airlineName}
                    getSubLabel={(f) => `${f.category} · ${money(f.price)}`}
                    placeholder="Search or type a flight"
                    isSelected={!!flightSelected}
                  />
                </Field>
                <DualPriceFields
                  isDbLocked={!!flightSelected}
                  priceState={flightPrice}
                />
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
                      transportPrice.setFromDatabase(t.price);
                    }}
                    options={transports}
                    getLabel={(t) => t.carType}
                    getSubLabel={(t) => `${routeLabel(t)} · ${money(t.price)}`}
                    placeholder="Search or type a transport option"
                    isSelected={!!transportSelected}
                  />
                </Field>
                <DualPriceFields
                  isDbLocked={!!transportSelected}
                  priceState={transportPrice}
                />
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

          {/* ACTIONS */}
          <div className="calc-card p-6">
            <div className="flex gap-3">
              <Button
                fullWidth
                size="lg"
                icon={Calculator}
                onClick={calculate}
                disabled={!canCalculate}
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
                {result.totalDays || "—"} Days · 1 SAR = {result.conversionRate}{" "}
                PKR · Price shown is per person
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
                          } · ${dual(result.costs.visaCost, result.conversionRate)}`
                        : "Not selected"
                    }
                  />
                  <SummaryRow
                    label="Flight"
                    value={
                      result.flight
                        ? `${result.flight.airlineName}${
                            result.flight.isCustom ? " (Custom)" : ""
                          } · ${dual(result.costs.flightCost, result.conversionRate)}`
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
            </div>

            {/* RIGHT: cost breakdown */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Cost Breakdown (Per Person) — SAR | PKR
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
                        value={dual(result.makkahHotel.price, result.conversionRate)}
                      />
                      <DetailRow
                        label="Persons"
                        value={result.makkahPersons || 0}
                      />
                      <DetailRow
                        label="Per Person / Night"
                        value={dual(
                          result.makkahPerPersonPrice,
                          result.conversionRate
                        )}
                      />
                      <DetailRow
                        label="Nights"
                        value={result.makkahNights || 0}
                      />
                      <DetailRow
                        label="Total for Makkah (Per Person)"
                        value={dual(result.makkahCost, result.conversionRate)}
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
                        value={dual(
                          result.madinahHotel.price,
                          result.conversionRate
                        )}
                      />
                      <DetailRow
                        label="Persons"
                        value={result.madinahPersons || 0}
                      />
                      <DetailRow
                        label="Per Person / Night"
                        value={dual(
                          result.madinahPerPersonPrice,
                          result.conversionRate
                        )}
                      />
                      <DetailRow
                        label="Nights"
                        value={result.madinahNights || 0}
                      />
                      <DetailRow
                        label="Total for Madinah (Per Person)"
                        value={dual(result.madinahCost, result.conversionRate)}
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
                        value={dual(result.costs.visaCost, result.conversionRate)}
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
                        value={dual(result.costs.flightCost, result.conversionRate)}
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
                        value={dual(
                          result.transport.price,
                          result.conversionRate
                        )}
                      />
                      <DetailRow
                        label="Total Passengers"
                        value={result.transportPassengers || 0}
                      />
                      <DetailRow
                        label="Per Person Price"
                        value={dual(
                          result.costs.transportCost,
                          result.conversionRate
                        )}
                        bold
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                <CostRow
                  label="Hotels Total (Per Person)"
                  value={dual(result.costs.hotelCost, result.conversionRate)}
                  bold
                />
                <CostRow
                  label="Visa"
                  value={dual(result.costs.visaCost, result.conversionRate)}
                />
                <CostRow
                  label="Flight"
                  value={dual(result.costs.flightCost, result.conversionRate)}
                />
                <CostRow
                  label="Transport (Per Person)"
                  value={dual(
                    result.costs.transportCost,
                    result.conversionRate
                  )}
                />
                <div className="flex flex-col gap-1 px-4 py-4 bg-brand-600 text-white rounded-b-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      Grand Total (Per Person) — SAR
                    </span>
                    <span className="text-xl font-extrabold">
                      {money(result.costs.grandTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/85">
                    <span className="text-sm font-medium">
                      Grand Total (Per Person) — PKR
                    </span>
                    <span className="text-lg font-bold">
                      {moneyPKR(
                        result.costs.grandTotal * result.conversionRate
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PRINT-ONLY: Excel-style result table */}
          <div className="print-only-summary px-6 pb-6">
            <table className="print-summary-table">
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Item</th>
                  <th className="num">Original SAR</th>
                  <th className="num">Original PKR</th>
                  <th className="center">Persons</th>
                  <th className="center">Nights</th>
                  <th className="num">Per Person SAR</th>
                  <th className="num">Per Person PKR</th>
                  <th className="num">Total SAR</th>
                  <th className="num">Total PKR</th>
                </tr>
              </thead>
              <tbody>
                {printRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.category}</td>
                    <td>{row.item}</td>
                    <td className="num">{row.originalSAR}</td>
                    <td className="num">{row.originalPKR}</td>
                    <td className="center">{row.persons}</td>
                    <td className="center">{row.nights}</td>
                    <td className="num">{row.perPersonSAR}</td>
                    <td className="num">{row.perPersonPKR}</td>
                    <td className="num">{row.totalSAR}</td>
                    <td className="num">{row.totalPKR}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={8} className="num">
                    Total Hotels Per Person
                  </td>
                  <td className="num">{money(result.costs.hotelCost)}</td>
                  <td className="num">
                    {moneyPKR(result.costs.hotelCost * result.conversionRate)}
                  </td>
                </tr>
                <tr className="grand-total">
                  <td colSpan={8} className="num">
                    Final Package Total Per Person — SAR / PKR
                  </td>
                  <td className="num">{money(result.costs.grandTotal)}</td>
                  <td className="num">
                    {moneyPKR(
                      result.costs.grandTotal * result.conversionRate
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

// Two side-by-side inputs for the same price in SAR and PKR. When locked
// (an existing database record is selected) both are read-only and show the
// database SAR price plus its live PKR equivalent. When unlocked (custom
// item), editing either field derives the other via `priceState`.
const DualPriceFields = ({ isDbLocked, priceState }) => {
  const lockedClass = isDbLocked
    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
    : "";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label={isDbLocked ? "Price SAR (database)" : "Price SAR (custom)"}>
        <input
          type="number"
          min="0"
          placeholder="0"
          value={priceState.sar}
          onChange={(e) => priceState.setSar(e.target.value)}
          readOnly={isDbLocked}
          disabled={isDbLocked}
          className={`${inputClass} ${lockedClass}`}
        />
      </Field>
      <Field label={isDbLocked ? "Price PKR (database)" : "Price PKR (custom)"}>
        <input
          type="number"
          min="0"
          placeholder="0"
          value={priceState.pkr}
          onChange={(e) => priceState.setPkr(e.target.value)}
          readOnly={isDbLocked}
          disabled={isDbLocked}
          className={`${inputClass} ${lockedClass}`}
        />
      </Field>
    </div>
  );
};

const ValidationBanner = ({ message }) => (
  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
    <span>{message}</span>
  </div>
);

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
      {value}
    </span>
  </div>
);

export default NormalPackage;

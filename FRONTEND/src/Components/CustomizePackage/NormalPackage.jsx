import React, { useState, useEffect } from "react";
import {
  Building2,
  FileText,
  Plane,
  Car,
  Train,
  Sparkles,
  ListChecks,
  Plus,
  Calculator,
  Printer,
  Trash2,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";
import { Field, inputClass } from "../Main/FormControls";
import Button from "../UI/Button";
import SearchableCombobox from "../UI/SearchableCombobox";
import useDualCurrencyPrice, { toPKR, toSAR } from "./useDualCurrencyPrice";

const API = "http://localhost:5000/api";
const MAX_MISC_ITEMS = 5;

const money = (n) => `SAR ${Number(n || 0).toLocaleString()}`;
const moneyPKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;
// Two already-computed SAR/PKR figures shown side by side. This never
// performs a conversion itself — Original and Selling sides use different
// rates, so every SAR/PKR pair must arrive pre-converted from the single
// canonical calculation (buildServiceRecord below), not be recomputed ad
// hoc at display time.
const pair = (sar, pkr) => `${money(sar)} | ${moneyPKR(pkr)}`;
// A service's profit, shown in its own native currency ONLY (never both) —
// color-coded green/red for profit/loss.
const profitDisplay = (service) => (
  <span className={service.profitNative < 0 ? "text-red-600" : "text-emerald-600"}>
    {service.nativeCurrency === "PKR"
      ? moneyPKR(service.profitNative)
      : money(service.profitNative)}
  </span>
);

// Normalize a transport record's route (can be a string or legacy object)
const routeLabel = (t) => {
  if (typeof t.route === "string") return t.route;
  if (t.route && (t.route.from || t.route.to))
    return `${t.route.from || ""}${t.route.from && t.route.to ? " → " : ""}${
      t.route.to || ""
    }`;
  return t.routeString || "";
};

// The single canonical per-service calculation (see task requirement to
// avoid separately-drifting totals). Every included service — a hotel, a
// visa, a flight, transport, a train ticket, or a misc item — has one
// "native" currency (the currency its price is actually quoted/entered in):
// SAR for everything except Flight, which is quoted in PKR. Callers pass in
// the already-computed originalSAR/originalPKR/sellingSAR/sellingPKR pair
// (each side using its own single rate — Conversion Rate for Original,
// Selling Conversion Rate for Selling), so this function never performs a
// conversion itself. Profit is ALWAYS the subtraction of the two native-
// currency raw values (never a cross-rate SAR-minus-derived-SAR or
// PKR-minus-derived-PKR), which is the only subtraction that can't be
// contaminated by Original and Selling using different rates.
const buildServiceRecord = (
  name,
  isCustom,
  nativeCurrency, // "SAR" | "PKR"
  originalSAR,
  originalPKR,
  sellingSAR,
  sellingPKR,
  meta = {}
) => ({
  name,
  isCustom,
  nativeCurrency,
  originalSAR,
  originalPKR,
  sellingSAR,
  sellingPKR,
  profitNative:
    nativeCurrency === "PKR" ? sellingPKR - originalPKR : sellingSAR - originalSAR,
  ...meta,
});

// Customer-facing print rows — selling side only, always. No original
// price, no cost conversion rate, and no profit field is ever read here.
const buildPrintRows = (result) => {
  const rows = [];

  if (result.makkahService) {
    const s = result.makkahService;
    rows.push({
      category: "Makkah Hotel",
      item: `${s.name}${s.isCustom ? " (Custom)" : ""}`,
      persons: s.persons || "-",
      nights: s.nights || "-",
      sellingSAR: money(s.sellingPerPersonPerNight),
      sellingPKR: moneyPKR(s.sellingPerPersonPerNightPKR),
      totalSAR: money(s.sellingSAR),
      totalPKR: moneyPKR(s.sellingPKR),
    });
  }

  if (result.madinahService) {
    const s = result.madinahService;
    rows.push({
      category: "Madinah Hotel",
      item: `${s.name}${s.isCustom ? " (Custom)" : ""}`,
      persons: s.persons || "-",
      nights: s.nights || "-",
      sellingSAR: money(s.sellingPerPersonPerNight),
      sellingPKR: moneyPKR(s.sellingPerPersonPerNightPKR),
      totalSAR: money(s.sellingSAR),
      totalPKR: moneyPKR(s.sellingPKR),
    });
  }

  if (result.visaService) {
    const s = result.visaService;
    rows.push({
      category: "Visa",
      item: `${s.name}${s.isCustom ? " (Custom)" : ""}`,
      persons: "-",
      nights: "-",
      sellingSAR: money(s.sellingSAR),
      sellingPKR: moneyPKR(s.sellingPKR),
      totalSAR: money(s.sellingSAR),
      totalPKR: moneyPKR(s.sellingPKR),
    });
  }

  if (result.flightService) {
    const s = result.flightService;
    rows.push({
      category: "Flight",
      item: `${s.name}${s.isCustom ? " (Custom)" : ""}`,
      persons: "-",
      nights: "-",
      sellingSAR: money(s.sellingSAR),
      sellingPKR: moneyPKR(s.sellingPKR),
      totalSAR: money(s.sellingSAR),
      totalPKR: moneyPKR(s.sellingPKR),
    });
  }

  if (result.transportService) {
    const s = result.transportService;
    rows.push({
      category: "Transport",
      item: `${s.name}${s.isCustom ? " (Custom)" : ""}`,
      persons: s.passengers || "-",
      nights: "-",
      sellingSAR: money(s.sellingSAR),
      sellingPKR: moneyPKR(s.sellingPKR),
      totalSAR: money(s.sellingSAR),
      totalPKR: moneyPKR(s.sellingPKR),
    });
  }

  if (result.trainTicketService) {
    const s = result.trainTicketService;
    rows.push({
      category: "Train Ticket",
      item: s.name,
      persons: "-",
      nights: "-",
      sellingSAR: money(s.sellingSAR),
      sellingPKR: moneyPKR(s.sellingPKR),
      totalSAR: money(s.sellingSAR),
      totalPKR: moneyPKR(s.sellingPKR),
    });
  }

  result.miscServices.forEach((s) => {
    rows.push({
      category: "Miscellaneous",
      item: s.name,
      persons: "-",
      nights: "-",
      sellingSAR: money(s.sellingSAR),
      sellingPKR: moneyPKR(s.sellingPKR),
      totalSAR: money(s.sellingSAR),
      totalPKR: moneyPKR(s.sellingPKR),
    });
  });

  return rows;
};

const createMiscItem = () => ({
  id: `misc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: "",
  originalSAR: "",
  originalPKR: "",
  originalSource: "sar",
  sellingSAR: "",
  sellingPKR: "",
  sellingSource: "sar",
});

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

  // Two independent, manually entered rates. Conversion Rate governs every
  // Original (cost) price; Selling Conversion Rate governs every Selling
  // price. Neither is ever used for the other side's math.
  const [conversionRate, setConversionRate] = useState("");
  const [sellingConversionRate, setSellingConversionRate] = useState("");

  // The number of people the WHOLE package is being sold to — distinct from
  // Makkah/Madinah Persons and Transport's Total Passengers, which only
  // ever feed the per-service per-person math. This field is applied only
  // once, after the complete per-person package has already been
  // calculated, to produce the "all passengers" group totals.
  const [totalPassengers, setTotalPassengers] = useState("");

  // Safely coerce a value to a positive number (guards against "", 0,
  // negative, and non-numeric input causing NaN/Infinity downstream).
  const toPositiveNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const conversionRateNum = toPositiveNumber(conversionRate);
  const sellingConversionRateNum = toPositiveNumber(sellingConversionRate);

  // Makkah hotel — `*Selected` holds the matched database record (or null
  // when the typed text is a temporary custom hotel not backed by an ID).
  const [makkahHotelText, setMakkahHotelText] = useState("");
  const [makkahHotelSelected, setMakkahHotelSelected] = useState(null);
  const makkahHotelPrice = useDualCurrencyPrice(conversionRateNum);
  const makkahSellingPrice = useDualCurrencyPrice(sellingConversionRateNum);
  const [makkahNights, setMakkahNights] = useState("");
  const [makkahPersons, setMakkahPersons] = useState("");

  // Madinah hotel
  const [madinahHotelText, setMadinahHotelText] = useState("");
  const [madinahHotelSelected, setMadinahHotelSelected] = useState(null);
  const madinahHotelPrice = useDualCurrencyPrice(conversionRateNum);
  const madinahSellingPrice = useDualCurrencyPrice(sellingConversionRateNum);
  const [madinahNights, setMadinahNights] = useState("");
  const [madinahPersons, setMadinahPersons] = useState("");

  // Optional services — Flight/Visa/Transport/Train Ticket/Miscellaneous
  // are all opt-in; a package can include just Hotels, just one of these,
  // or any mix.
  const [includeFlight, setIncludeFlight] = useState(false);
  const [includeVisa, setIncludeVisa] = useState(false);
  const [includeTransport, setIncludeTransport] = useState(false);
  const [includeTrainTicket, setIncludeTrainTicket] = useState(false);
  const [includeMisc, setIncludeMisc] = useState(false);

  // Visa
  const [visaTypeText, setVisaTypeText] = useState("");
  const [visaSelected, setVisaSelected] = useState(null);
  const visaPrice = useDualCurrencyPrice(conversionRateNum);
  const visaSellingPrice = useDualCurrencyPrice(sellingConversionRateNum);

  // Flight
  const [flightText, setFlightText] = useState("");
  const [flightSelected, setFlightSelected] = useState(null);
  const flightPrice = useDualCurrencyPrice(conversionRateNum);
  const flightSellingPrice = useDualCurrencyPrice(sellingConversionRateNum);

  // Transport
  const [transportText, setTransportText] = useState("");
  const [transportSelected, setTransportSelected] = useState(null);
  const transportPrice = useDualCurrencyPrice(conversionRateNum);
  const transportSellingPrice = useDualCurrencyPrice(sellingConversionRateNum);
  const [transportPassengers, setTransportPassengers] = useState("");

  // Train Ticket — no database source exists for this yet (the "tickets"
  // collection is airline tickets, already used by Flight above), so this
  // is a free-text, always-custom entry. Original/Selling Price still use
  // the same SAR/PKR conversion hook as every other item.
  const [trainTicketText, setTrainTicketText] = useState("");
  const trainTicketPrice = useDualCurrencyPrice(conversionRateNum);
  const trainTicketSellingPrice = useDualCurrencyPrice(sellingConversionRateNum);

  // Miscellaneous — up to MAX_MISC_ITEMS free-form temporary items (e.g.
  // Dates, Zam Zam, Ziyarat). Never saved to the database. Each item can't
  // use the useDualCurrencyPrice hook directly (hooks can't be called a
  // variable number of times for a dynamic list), so the same SAR<->PKR
  // synchronization logic is replicated here using the hook's own exported
  // toPKR/toSAR pure functions, applied over the whole array at once.
  const [miscItems, setMiscItems] = useState([]);

  const addMiscItem = () => {
    setMiscItems((prev) =>
      prev.length >= MAX_MISC_ITEMS ? prev : [...prev, createMiscItem()]
    );
  };

  const removeMiscItem = (id) => {
    setMiscItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateMiscItem = (id, field, value) => {
    setMiscItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "name") return { ...item, name: value };
        if (field === "originalSAR")
          return {
            ...item,
            originalSAR: value,
            originalSource: "sar",
            originalPKR: toPKR(value, conversionRateNum),
          };
        if (field === "originalPKR")
          return {
            ...item,
            originalPKR: value,
            originalSource: "pkr",
            originalSAR: toSAR(value, conversionRateNum),
          };
        if (field === "sellingSAR")
          return {
            ...item,
            sellingSAR: value,
            sellingSource: "sar",
            sellingPKR: toPKR(value, sellingConversionRateNum),
          };
        if (field === "sellingPKR")
          return {
            ...item,
            sellingPKR: value,
            sellingSource: "pkr",
            sellingSAR: toSAR(value, sellingConversionRateNum),
          };
        return item;
      })
    );
  };

  const handleToggleMisc = (checked) => {
    setIncludeMisc(checked);
    if (checked) {
      setMiscItems((prev) => (prev.length > 0 ? prev : [createMiscItem()]));
    } else {
      setMiscItems([]);
    }
  };

  // Re-derive every misc item's derived currency whenever the relevant rate
  // changes — mirrors useDualCurrencyPrice's own internal effect, just
  // applied across the whole array in one pass instead of per-item.
  useEffect(() => {
    setMiscItems((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((item) =>
        item.originalSource === "pkr"
          ? { ...item, originalSAR: toSAR(item.originalPKR, conversionRateNum) }
          : { ...item, originalPKR: toPKR(item.originalSAR, conversionRateNum) }
      );
    });
  }, [conversionRateNum]);

  useEffect(() => {
    setMiscItems((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((item) =>
        item.sellingSource === "pkr"
          ? { ...item, sellingSAR: toSAR(item.sellingPKR, sellingConversionRateNum) }
          : { ...item, sellingPKR: toPKR(item.sellingSAR, sellingConversionRateNum) }
      );
    });
  }, [sellingConversionRateNum]);

  // Unchecking an optional section also clears its temporary form state,
  // so a value left over from before it was hidden can never accidentally
  // leak into a later Calculate Cost run.
  const handleToggleVisa = (checked) => {
    setIncludeVisa(checked);
    if (!checked) {
      setVisaTypeText("");
      setVisaSelected(null);
      visaPrice.reset();
      visaSellingPrice.reset();
    }
  };

  const handleToggleFlight = (checked) => {
    setIncludeFlight(checked);
    if (!checked) {
      setFlightText("");
      setFlightSelected(null);
      flightPrice.reset();
      flightSellingPrice.reset();
    }
  };

  const handleToggleTransport = (checked) => {
    setIncludeTransport(checked);
    if (!checked) {
      setTransportText("");
      setTransportSelected(null);
      transportPrice.reset();
      transportSellingPrice.reset();
      setTransportPassengers("");
    }
  };

  const handleToggleTrainTicket = (checked) => {
    setIncludeTrainTicket(checked);
    if (!checked) {
      setTrainTicketText("");
      trainTicketPrice.reset();
      trainTicketSellingPrice.reset();
    }
  };

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

  // Total Days vs. Makkah/Madinah nights validation. Makkah Nights +
  // Madinah Nights must equal Total Days EXACTLY — no tolerance. This is
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
    : nightsDifference !== 0
    ? "Makkah Nights + Madinah Nights must equal Total Days exactly."
    : "";

  // Conversion Rate / Selling Conversion Rate validation. Only required
  // once at least one priced category is actually being used — a blank
  // form never shows these errors.
  const miscInUse =
    includeMisc && miscItems.some((item) => (item.name || "").trim());
  const pricingInUse = !!(
    makkahHotelText.trim() ||
    madinahHotelText.trim() ||
    visaTypeText.trim() ||
    flightText.trim() ||
    transportText.trim() ||
    trainTicketText.trim() ||
    miscInUse
  );
  const conversionRateError = !pricingInUse
    ? ""
    : conversionRate === ""
    ? "Enter a Conversion Rate to calculate original/cost PKR prices."
    : conversionRateNum <= 0
    ? "Conversion Rate must be a positive number."
    : "";
  const sellingConversionRateError = !pricingInUse
    ? ""
    : sellingConversionRate === ""
    ? "Enter a Selling Conversion Rate to calculate selling PKR prices."
    : sellingConversionRateNum <= 0
    ? "Selling Conversion Rate must be a positive number."
    : "";

  // Total Passengers — required before the all-passengers group totals can
  // be calculated. Whole number, > 0, never NaN/Infinity downstream.
  const totalPassengersNum = toPositiveNumber(totalPassengers);
  const totalPassengersError = !pricingInUse
    ? ""
    : totalPassengers === ""
    ? "Enter Total Passengers to calculate the all-passengers package total."
    : totalPassengersNum <= 0
    ? "Total Passengers must be greater than 0."
    : !Number.isInteger(totalPassengersNum)
    ? "Total Passengers must be a whole number."
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

    if (sellingConversionRateError) {
      alert(sellingConversionRateError);
      return;
    }

    if (totalPassengersError) {
      alert(totalPassengersError);
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
    // Unchecked optional sections are excluded outright — even if some
    // stale text/price were still sitting in state, it never reaches the
    // result, the totals, or the print output.
    const visa = includeVisa
      ? resolveItem(visaTypeText, visaSelected, visaPrice.sar, "category")
      : null;
    const flight = includeFlight
      ? resolveItem(flightText, flightSelected, flightPrice.sar, "airlineName")
      : null;
    const transport = includeTransport
      ? resolveItem(transportText, transportSelected, transportPrice.sar, "carType")
      : null;
    const trainTicket = includeTrainTicket
      ? resolveItem(trainTicketText, null, trainTicketPrice.sar, "name")
      : null;

    const miscResolved = includeMisc
      ? miscItems.reduce((acc, item) => {
          const trimmedName = (item.name || "").trim();
          if (trimmedName) {
            acc.push({
              name: trimmedName,
              originalSAR: safePrice(item.originalSAR),
              sellingSAR: safePrice(item.sellingSAR),
            });
          }
          return acc;
        }, [])
      : [];

    if (
      !makkahHotel &&
      !madinahHotel &&
      !visa &&
      !flight &&
      !transport &&
      !trainTicket &&
      miscResolved.length === 0
    ) {
      alert("Please add at least one service to build your package.");
      return;
    }

    // --- Makkah: SAR-native. (Price / Persons) × Nights, for both Original
    // and Selling, entirely in SAR; PKR is only ever a display conversion
    // of that SAR figure via the relevant side's rate. ---
    const makkahPersonsNum = toPositiveNumber(makkahPersons);
    const makkahOriginalPerPersonPerNight =
      makkahHotel && makkahPersonsNum > 0
        ? safePrice(makkahHotel.price) / makkahPersonsNum
        : 0;
    const makkahSellingPerPersonPerNight =
      makkahHotel && makkahPersonsNum > 0
        ? safePrice(makkahSellingPrice.sar) / makkahPersonsNum
        : 0;
    const makkahOriginalTotalSAR = makkahOriginalPerPersonPerNight * makkahNightsNum;
    const makkahSellingTotalSAR = makkahSellingPerPersonPerNight * makkahNightsNum;
    const makkahService = makkahHotel
      ? buildServiceRecord(
          makkahHotel.hotelName,
          makkahHotel.isCustom,
          "SAR",
          makkahOriginalTotalSAR,
          makkahOriginalTotalSAR * conversionRateNum,
          makkahSellingTotalSAR,
          makkahSellingTotalSAR * sellingConversionRateNum,
          {
            persons: makkahPersonsNum,
            nights: makkahNightsNum,
            // The raw hotel price as entered/selected (per night, before
            // dividing by Persons) — distinct from originalSAR/originalPKR
            // above, which are the fully-computed per-person total for the
            // whole stay.
            originalHotelPrice: safePrice(makkahHotel.price),
            originalHotelPricePKR: safePrice(makkahHotel.price) * conversionRateNum,
            originalPerPersonPerNight: makkahOriginalPerPersonPerNight,
            originalPerPersonPerNightPKR:
              makkahOriginalPerPersonPerNight * conversionRateNum,
            sellingPerPersonPerNight: makkahSellingPerPersonPerNight,
            sellingPerPersonPerNightPKR:
              makkahSellingPerPersonPerNight * sellingConversionRateNum,
          }
        )
      : null;

    // --- Madinah: identical structure, SAR-native ---
    const madinahPersonsNum = toPositiveNumber(madinahPersons);
    const madinahOriginalPerPersonPerNight =
      madinahHotel && madinahPersonsNum > 0
        ? safePrice(madinahHotel.price) / madinahPersonsNum
        : 0;
    const madinahSellingPerPersonPerNight =
      madinahHotel && madinahPersonsNum > 0
        ? safePrice(madinahSellingPrice.sar) / madinahPersonsNum
        : 0;
    const madinahOriginalTotalSAR =
      madinahOriginalPerPersonPerNight * madinahNightsNum;
    const madinahSellingTotalSAR =
      madinahSellingPerPersonPerNight * madinahNightsNum;
    const madinahService = madinahHotel
      ? buildServiceRecord(
          madinahHotel.hotelName,
          madinahHotel.isCustom,
          "SAR",
          madinahOriginalTotalSAR,
          madinahOriginalTotalSAR * conversionRateNum,
          madinahSellingTotalSAR,
          madinahSellingTotalSAR * sellingConversionRateNum,
          {
            persons: madinahPersonsNum,
            nights: madinahNightsNum,
            originalHotelPrice: safePrice(madinahHotel.price),
            originalHotelPricePKR: safePrice(madinahHotel.price) * conversionRateNum,
            originalPerPersonPerNight: madinahOriginalPerPersonPerNight,
            originalPerPersonPerNightPKR:
              madinahOriginalPerPersonPerNight * conversionRateNum,
            sellingPerPersonPerNight: madinahSellingPerPersonPerNight,
            sellingPerPersonPerNightPKR:
              madinahSellingPerPersonPerNight * sellingConversionRateNum,
          }
        )
      : null;

    // --- Visa: SAR-native, flat (never divided by persons — consistent with
    // the existing per-person package structure). ---
    const visaService = visa
      ? buildServiceRecord(
          visa.category,
          visa.isCustom,
          "SAR",
          safePrice(visa.price),
          safePrice(visa.price) * conversionRateNum,
          safePrice(visaSellingPrice.sar),
          safePrice(visaSellingPrice.sar) * sellingConversionRateNum
        )
      : null;

    // --- Flight: PKR-native — the ONLY service quoted in PKR. Its raw PKR
    // figures (already correctly synced by the useDualCurrencyPrice hooks,
    // however the user actually typed them) are read directly rather than
    // re-derived from SAR, so profit can be taken as a straight PKR
    // subtraction with no rounding drift from a redundant round-trip. ---
    const flightOriginalPKR = safePrice(flightPrice.pkr);
    const flightOriginalSAR =
      conversionRateNum > 0 ? flightOriginalPKR / conversionRateNum : 0;
    const flightSellingPKR = safePrice(flightSellingPrice.pkr);
    const flightSellingSAR =
      sellingConversionRateNum > 0 ? flightSellingPKR / sellingConversionRateNum : 0;
    const flightService = flight
      ? buildServiceRecord(
          flight.airlineName,
          flight.isCustom,
          "PKR",
          flightOriginalSAR,
          flightOriginalPKR,
          flightSellingSAR,
          flightSellingPKR
        )
      : null;

    // --- Transport: SAR-native. Price / Total Passengers, for both Original
    // and Selling. ---
    const transportPassengersNum = toPositiveNumber(transportPassengers);
    const transportOriginalPerPerson =
      transport && transportPassengersNum > 0
        ? safePrice(transport.price) / transportPassengersNum
        : 0;
    const transportSellingPerPerson =
      transport && transportPassengersNum > 0
        ? safePrice(transportSellingPrice.sar) / transportPassengersNum
        : 0;
    const transportService = transport
      ? buildServiceRecord(
          transport.carType,
          transport.isCustom,
          "SAR",
          transportOriginalPerPerson,
          transportOriginalPerPerson * conversionRateNum,
          transportSellingPerPerson,
          transportSellingPerPerson * sellingConversionRateNum,
          {
            passengers: transportPassengersNum,
            originalGroupPrice: safePrice(transport.price),
            originalGroupPricePKR: safePrice(transport.price) * conversionRateNum,
            sellingGroupPrice: safePrice(transportSellingPrice.sar),
            sellingGroupPricePKR:
              safePrice(transportSellingPrice.sar) * sellingConversionRateNum,
          }
        )
      : null;

    // --- Train Ticket: SAR-native, flat, always custom ---
    const trainTicketService = trainTicket
      ? buildServiceRecord(
          trainTicket.name,
          true,
          "SAR",
          safePrice(trainTicket.price),
          safePrice(trainTicket.price) * conversionRateNum,
          safePrice(trainTicketSellingPrice.sar),
          safePrice(trainTicketSellingPrice.sar) * sellingConversionRateNum
        )
      : null;

    // --- Miscellaneous: SAR-native (no per-item currency toggle exists yet,
    // so every item defaults to SAR — consistent with every other service
    // except Flight), flat, always custom, one record per named item. ---
    const miscServices = miscResolved.map((m) =>
      buildServiceRecord(
        m.name,
        true,
        "SAR",
        m.originalSAR,
        m.originalSAR * conversionRateNum,
        m.sellingSAR,
        m.sellingSAR * sellingConversionRateNum
      )
    );

    // Package totals are purely a sum over the canonical per-service
    // records above — nothing here is calculated independently, so there
    // is nothing that can drift out of sync with the per-service figures.
    const allServices = [
      makkahService,
      madinahService,
      visaService,
      flightService,
      transportService,
      trainTicketService,
      ...miscServices,
    ].filter(Boolean);

    const originalPackageTotalSAR = allServices.reduce(
      (sum, s) => sum + s.originalSAR,
      0
    );
    const originalPackageTotalPKR = allServices.reduce(
      (sum, s) => sum + s.originalPKR,
      0
    );
    const sellingPackageTotalSAR = allServices.reduce(
      (sum, s) => sum + s.sellingSAR,
      0
    );
    const sellingPackageTotalPKR = allServices.reduce(
      (sum, s) => sum + s.sellingPKR,
      0
    );

    // Profit is aggregated separately by native currency — SAR-native
    // profits are summed together, PKR-native profits are summed together,
    // and the two are NEVER added directly to each other (that would mix
    // amounts computed at two different rates). Only afterward, for a
    // single "how much did I make, in one number" presentation, is one
    // native subtotal converted into the other's currency — using the
    // Selling Conversion Rate as the presentation rate for both directions.
    const sarNativeServices = allServices.filter((s) => s.nativeCurrency === "SAR");
    const pkrNativeServices = allServices.filter((s) => s.nativeCurrency === "PKR");
    const nativeSARProfit = sarNativeServices.reduce(
      (sum, s) => sum + s.profitNative,
      0
    );
    const nativePKRProfit = pkrNativeServices.reduce(
      (sum, s) => sum + s.profitNative,
      0
    );
    const overallProfitSAR =
      nativeSARProfit +
      (sellingConversionRateNum > 0 ? nativePKRProfit / sellingConversionRateNum : 0);
    const overallProfitPKR =
      nativePKRProfit + nativeSARProfit * sellingConversionRateNum;

    // Total Passengers is applied ONLY here, once, to the already-complete
    // per-person package figures — never fed into any individual service's
    // math (Makkah/Madinah Persons and Transport's own Total Passengers
    // remain completely separate and are already baked into the per-person
    // totals above).
    setResult({
      packageName,
      totalDays,
      conversionRate: conversionRateNum,
      sellingConversionRate: sellingConversionRateNum,
      makkahService,
      madinahService,
      visaService,
      flightService,
      transportService,
      trainTicketService,
      miscServices,
      totals: {
        totalPassengers: totalPassengersNum,
        originalSAR: originalPackageTotalSAR,
        originalPKR: originalPackageTotalPKR,
        sellingSAR: sellingPackageTotalSAR,
        sellingPKR: sellingPackageTotalPKR,
        originalPKRAllPassengers: originalPackageTotalPKR * totalPassengersNum,
        sellingPKRAllPassengers: sellingPackageTotalPKR * totalPassengersNum,
        nativeSARProfit,
        nativePKRProfit,
        overallProfitSAR,
        overallProfitPKR,
        nativeSARProfitAllPassengers: nativeSARProfit * totalPassengersNum,
        nativePKRProfitAllPassengers: nativePKRProfit * totalPassengersNum,
        overallProfitSARAllPassengers: overallProfitSAR * totalPassengersNum,
        overallProfitPKRAllPassengers: overallProfitPKR * totalPassengersNum,
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
    setSellingConversionRate("");
    setTotalPassengers("");

    setMakkahHotelText("");
    setMakkahHotelSelected(null);
    makkahHotelPrice.reset();
    makkahSellingPrice.reset();
    setMakkahNights("");
    setMakkahPersons("");

    setMadinahHotelText("");
    setMadinahHotelSelected(null);
    madinahHotelPrice.reset();
    madinahSellingPrice.reset();
    setMadinahNights("");
    setMadinahPersons("");

    setIncludeVisa(false);
    setVisaTypeText("");
    setVisaSelected(null);
    visaPrice.reset();
    visaSellingPrice.reset();

    setIncludeFlight(false);
    setFlightText("");
    setFlightSelected(null);
    flightPrice.reset();
    flightSellingPrice.reset();

    setIncludeTransport(false);
    setTransportText("");
    setTransportSelected(null);
    transportPrice.reset();
    transportSellingPrice.reset();
    setTransportPassengers("");

    setIncludeTrainTicket(false);
    setTrainTicketText("");
    trainTicketPrice.reset();
    trainTicketSellingPrice.reset();

    setIncludeMisc(false);
    setMiscItems([]);

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
  const canCalculate =
    !nightsValidationError &&
    !conversionRateError &&
    !sellingConversionRateError &&
    !totalPassengersError;

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  placeholder="e.g. 74"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Selling Conversion Rate (1 SAR = ? PKR)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 76"
                  value={sellingConversionRate}
                  onChange={(e) => setSellingConversionRate(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Total Passengers">
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 5"
                  value={totalPassengers}
                  onChange={(e) => setTotalPassengers(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            {(nightsValidationError ||
              conversionRateError ||
              sellingConversionRateError ||
              totalPassengersError) && (
              <div className="mt-4 space-y-2">
                {nightsValidationError && (
                  <ValidationBanner message={nightsValidationError} />
                )}
                {conversionRateError && (
                  <ValidationBanner message={conversionRateError} />
                )}
                {sellingConversionRateError && (
                  <ValidationBanner message={sellingConversionRateError} />
                )}
                {totalPassengersError && (
                  <ValidationBanner message={totalPassengersError} />
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
                  <PriceGroups
                    isDbLocked={!!makkahHotelSelected}
                    originalPriceState={makkahHotelPrice}
                    sellingPriceState={makkahSellingPrice}
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
                  <PriceGroups
                    isDbLocked={!!madinahHotelSelected}
                    originalPriceState={madinahHotelPrice}
                    sellingPriceState={madinahSellingPrice}
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

          {/* OPTIONAL SERVICES */}
          <div className="calc-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <ListChecks size={20} className="text-blue-600" />
              Optional Services
            </h2>
            <div className="flex flex-wrap gap-3">
              <OptionalServiceToggle
                label="Flight"
                checked={includeFlight}
                onChange={handleToggleFlight}
              />
              <OptionalServiceToggle
                label="Visa"
                checked={includeVisa}
                onChange={handleToggleVisa}
              />
              <OptionalServiceToggle
                label="Transport"
                checked={includeTransport}
                onChange={handleToggleTransport}
              />
              <OptionalServiceToggle
                label="Train Ticket"
                checked={includeTrainTicket}
                onChange={handleToggleTrainTicket}
              />
              <OptionalServiceToggle
                label="Miscellaneous"
                checked={includeMisc}
                onChange={handleToggleMisc}
              />
            </div>
          </div>

          {/* FLIGHT / VISA / TRANSPORT / TRAIN TICKET — only the checked ones render */}
          {(includeFlight || includeVisa || includeTransport || includeTrainTicket) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {includeFlight && (
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
                    <PriceGroups
                      isDbLocked={!!flightSelected}
                      originalPriceState={flightPrice}
                      sellingPriceState={flightSellingPrice}
                    />
                  </div>
                </div>
              )}

              {includeVisa && (
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
                    <PriceGroups
                      isDbLocked={!!visaSelected}
                      originalPriceState={visaPrice}
                      sellingPriceState={visaSellingPrice}
                    />
                  </div>
                </div>
              )}

              {includeTransport && (
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
                    <PriceGroups
                      isDbLocked={!!transportSelected}
                      originalPriceState={transportPrice}
                      sellingPriceState={transportSellingPrice}
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
              )}

              {includeTrainTicket && (
                <div className="calc-card p-6">
                  <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
                    <Train size={18} className="text-blue-600" />
                    Train Ticket
                  </h2>
                  <div className="space-y-3">
                    <Field label="Train Ticket">
                      <input
                        type="text"
                        placeholder="e.g. Lahore → Karachi Express"
                        value={trainTicketText}
                        onChange={(e) => setTrainTicketText(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <PriceGroups
                      isDbLocked={false}
                      originalPriceState={trainTicketPrice}
                      sellingPriceState={trainTicketSellingPrice}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MISCELLANEOUS — up to MAX_MISC_ITEMS temporary items */}
          {includeMisc && (
            <div className="calc-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Sparkles size={20} className="text-blue-600" />
                  Miscellaneous
                </h2>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Plus}
                  onClick={addMiscItem}
                  disabled={miscItems.length >= MAX_MISC_ITEMS}
                >
                  Add Item
                </Button>
              </div>
              <div className="space-y-4">
                {miscItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Miscellaneous {idx + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeMiscItem(item.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        title="Remove this item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Field label="Name">
                        <input
                          type="text"
                          placeholder="e.g. Dates, Zam Zam, Ziyarat, Special Service"
                          value={item.name}
                          onChange={(e) =>
                            updateMiscItem(item.id, "name", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>
                      <PriceGroups
                        isDbLocked={false}
                        originalPriceState={{
                          sar: item.originalSAR,
                          pkr: item.originalPKR,
                          setSar: (v) => updateMiscItem(item.id, "originalSAR", v),
                          setPkr: (v) => updateMiscItem(item.id, "originalPKR", v),
                        }}
                        sellingPriceState={{
                          sar: item.sellingSAR,
                          pkr: item.sellingPKR,
                          setSar: (v) => updateMiscItem(item.id, "sellingSAR", v),
                          setPkr: (v) => updateMiscItem(item.id, "sellingPKR", v),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {miscItems.length >= MAX_MISC_ITEMS && (
                <p className="mt-3 text-xs text-gray-400">
                  Maximum of {MAX_MISC_ITEMS} miscellaneous items reached.
                </p>
              )}
            </div>
          )}

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
          {/* Summary header — shared between screen and print, so it must
              never mention the cost side (Conversion Rate/Original Price). */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-hair bg-linear-to-r from-brand-50 to-surface">
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                Custom Package
              </p>
              <h2 className="text-2xl font-extrabold text-ink">
                {result.packageName}
              </h2>
              <p className="text-sm text-muted mt-1">
                {result.totalDays || "—"} Days · Selling Rate: 1 SAR ={" "}
                {result.sellingConversionRate} PKR · Price shown is per person
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

          {/* SCREEN-ONLY: full internal/admin breakdown — Original, Selling
              and Profit for every included service. */}
          <div className="screen-only-summary p-6 space-y-4">
            <ServiceDetailCard
              title="Makkah Hotel"
              service={result.makkahService}
              extraRows={
                result.makkahService && (
                  <>
                    <DetailRow
                      label="Original Hotel Price"
                      value={pair(
                        result.makkahService.originalHotelPrice,
                        result.makkahService.originalHotelPricePKR
                      )}
                    />
                    <DetailRow label="Persons" value={result.makkahService.persons} />
                    <DetailRow label="Nights" value={result.makkahService.nights} />
                    <DetailRow
                      label="Original Per Person / Night"
                      value={pair(
                        result.makkahService.originalPerPersonPerNight,
                        result.makkahService.originalPerPersonPerNightPKR
                      )}
                    />
                    <DetailRow
                      label="Selling Per Person / Night"
                      value={pair(
                        result.makkahService.sellingPerPersonPerNight,
                        result.makkahService.sellingPerPersonPerNightPKR
                      )}
                    />
                  </>
                )
              }
            />

            <ServiceDetailCard
              title="Madinah Hotel"
              service={result.madinahService}
              extraRows={
                result.madinahService && (
                  <>
                    <DetailRow
                      label="Original Hotel Price"
                      value={pair(
                        result.madinahService.originalHotelPrice,
                        result.madinahService.originalHotelPricePKR
                      )}
                    />
                    <DetailRow label="Persons" value={result.madinahService.persons} />
                    <DetailRow label="Nights" value={result.madinahService.nights} />
                    <DetailRow
                      label="Original Per Person / Night"
                      value={pair(
                        result.madinahService.originalPerPersonPerNight,
                        result.madinahService.originalPerPersonPerNightPKR
                      )}
                    />
                    <DetailRow
                      label="Selling Per Person / Night"
                      value={pair(
                        result.madinahService.sellingPerPersonPerNight,
                        result.madinahService.sellingPerPersonPerNightPKR
                      )}
                    />
                  </>
                )
              }
            />

            <ServiceDetailCard title="Visa" service={result.visaService} />
            <ServiceDetailCard title="Flight" service={result.flightService} />

            <ServiceDetailCard
              title="Transport"
              service={result.transportService}
              extraRows={
                result.transportService && (
                  <>
                    <DetailRow
                      label="Total Passengers"
                      value={result.transportService.passengers}
                    />
                    <DetailRow
                      label="Original Group Price"
                      value={pair(
                        result.transportService.originalGroupPrice,
                        result.transportService.originalGroupPricePKR
                      )}
                    />
                    <DetailRow
                      label="Selling Group Price"
                      value={pair(
                        result.transportService.sellingGroupPrice,
                        result.transportService.sellingGroupPricePKR
                      )}
                    />
                  </>
                )
              }
            />

            <ServiceDetailCard title="Train Ticket" service={result.trainTicketService} />

            {result.miscServices.map((s, idx) => (
              <ServiceDetailCard
                key={idx}
                title={`Miscellaneous ${idx + 1}`}
                service={s}
              />
            ))}

            {/* PACKAGE TOTALS — PKR only; the SAR rows are dropped since
                Original/Selling Package Total in SAR mixed figures derived
                at two different rates would invite the same ambiguity the
                profit rule below exists to avoid. Total Passengers is
                applied here, once, on top of the already-complete
                per-person figures — it never touches any individual
                service's own math. */}
            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
              <CostRow
                label="Original Package Total (Per Person) — PKR"
                value={moneyPKR(result.totals.originalPKR)}
              />
              <CostRow
                label={`Original Package Total (All ${result.totals.totalPassengers} Passengers) — PKR`}
                value={moneyPKR(result.totals.originalPKRAllPassengers)}
                bold
              />
            </div>

            <div className="flex flex-col gap-1 px-4 py-4 bg-brand-600 text-white rounded-xl">
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  Selling Package Total (Per Person) — PKR
                </span>
                <span className="text-xl font-extrabold">
                  {moneyPKR(result.totals.sellingPKR)}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/85">
                <span className="text-sm font-medium">
                  Selling Package Total (All {result.totals.totalPassengers} Passengers) — PKR
                </span>
                <span className="text-lg font-bold">
                  {moneyPKR(result.totals.sellingPKRAllPassengers)}
                </span>
              </div>
            </div>

            {/* PROFIT BREAKDOWN — every included service's profit in its own
                native currency, then the two native subtotals kept strictly
                separate, then one overall equivalent presented in both
                currencies (converted using the Selling Conversion Rate).
                Everything in this box is PER PERSON. */}
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Profit Breakdown — Per Person
              </h3>
              <div className="space-y-1.5 text-sm">
                {result.makkahService && (
                  <DetailRow
                    label="Makkah Hotel Profit"
                    value={profitDisplay(result.makkahService)}
                  />
                )}
                {result.madinahService && (
                  <DetailRow
                    label="Madinah Hotel Profit"
                    value={profitDisplay(result.madinahService)}
                  />
                )}
                {result.visaService && (
                  <DetailRow
                    label="Visa Profit"
                    value={profitDisplay(result.visaService)}
                  />
                )}
                {result.flightService && (
                  <DetailRow
                    label="Flight Profit"
                    value={profitDisplay(result.flightService)}
                  />
                )}
                {result.transportService && (
                  <DetailRow
                    label="Transport Profit"
                    value={profitDisplay(result.transportService)}
                  />
                )}
                {result.trainTicketService && (
                  <DetailRow
                    label="Train Ticket Profit"
                    value={profitDisplay(result.trainTicketService)}
                  />
                )}
                {result.miscServices.map((s, idx) => (
                  <DetailRow
                    key={idx}
                    label={`Miscellaneous ${idx + 1} Profit (${s.name})`}
                    value={profitDisplay(s)}
                  />
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5 text-sm">
                <DetailRow
                  label="Total Native Profit (Per Person) — SAR"
                  value={
                    <span
                      className={
                        result.totals.nativeSARProfit < 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    >
                      {money(result.totals.nativeSARProfit)}
                    </span>
                  }
                  bold
                />
                <DetailRow
                  label="Total Native Profit (Per Person) — PKR"
                  value={
                    <span
                      className={
                        result.totals.nativePKRProfit < 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    >
                      {moneyPKR(result.totals.nativePKRProfit)}
                    </span>
                  }
                  bold
                />
              </div>
            </div>

            <div
              className={`flex flex-col gap-1 px-4 py-4 rounded-xl text-white ${
                result.totals.overallProfitSAR < 0 ? "bg-red-600" : "bg-emerald-600"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  Overall Profit Equivalent (Per Person) — SAR
                </span>
                <span className="text-xl font-extrabold">
                  {money(result.totals.overallProfitSAR)}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/85">
                <span className="text-sm font-medium">
                  Overall Profit Equivalent (Per Person) — PKR
                </span>
                <span className="text-lg font-bold">
                  {moneyPKR(result.totals.overallProfitPKR)}
                </span>
              </div>
            </div>

            {/* PROFIT — ALL PASSENGERS: the same native-currency figures
                above, multiplied by Total Passengers only at this final
                step — never used to inflate any individual service. */}
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Profit Breakdown — All {result.totals.totalPassengers} Passengers
              </h3>
              <div className="space-y-1.5 text-sm">
                <DetailRow
                  label="Total Native Profit (All Passengers) — SAR"
                  value={
                    <span
                      className={
                        result.totals.nativeSARProfitAllPassengers < 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    >
                      {money(result.totals.nativeSARProfitAllPassengers)}
                    </span>
                  }
                  bold
                />
                <DetailRow
                  label="Total Native Profit (All Passengers) — PKR"
                  value={
                    <span
                      className={
                        result.totals.nativePKRProfitAllPassengers < 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    >
                      {moneyPKR(result.totals.nativePKRProfitAllPassengers)}
                    </span>
                  }
                  bold
                />
              </div>
            </div>

            <div
              className={`flex flex-col gap-1 px-4 py-4 rounded-xl text-white ${
                result.totals.overallProfitSARAllPassengers < 0
                  ? "bg-red-600"
                  : "bg-emerald-600"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  Overall Profit Equivalent (All Passengers) — SAR
                </span>
                <span className="text-xl font-extrabold">
                  {money(result.totals.overallProfitSARAllPassengers)}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/85">
                <span className="text-sm font-medium">
                  Overall Profit Equivalent (All Passengers) — PKR
                </span>
                <span className="text-lg font-bold">
                  {moneyPKR(result.totals.overallProfitPKRAllPassengers)}
                </span>
              </div>
            </div>
          </div>

          {/* PRINT-ONLY: customer-facing Excel-style table — selling side only,
              never original price, never the cost conversion rate, never profit. */}
          <div className="print-only-summary px-6 pb-6">
            <table className="print-summary-table">
              <colgroup>
                <col style={{ width: "12%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Item</th>
                  <th className="center">Persons</th>
                  <th className="center">Nights</th>
                  <th className="num">Selling Price SAR</th>
                  <th className="num">Selling Price PKR</th>
                  <th className="num">Total SAR</th>
                  <th className="num">Total PKR</th>
                </tr>
              </thead>
              <tbody>
                {printRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.category}</td>
                    <td>{row.item}</td>
                    <td className="center">{row.persons}</td>
                    <td className="center">{row.nights}</td>
                    <td className="num">{row.sellingSAR}</td>
                    <td className="num">{row.sellingPKR}</td>
                    <td className="num">{row.totalSAR}</td>
                    <td className="num">{row.totalPKR}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="grand-total">
                  <td colSpan={6} className="num">
                    Package Price Per Person
                  </td>
                  <td className="num">{money(result.totals.sellingSAR)}</td>
                  <td className="num">{moneyPKR(result.totals.sellingPKR)}</td>
                </tr>
                <tr>
                  <td colSpan={6} className="num">
                    Total Passengers
                  </td>
                  <td colSpan={2} className="num">
                    {result.totals.totalPassengers}
                  </td>
                </tr>
                <tr className="grand-total">
                  <td colSpan={6} className="num">
                    Total Package Price (All Passengers) — PKR
                  </td>
                  <td colSpan={2} className="num">
                    {moneyPKR(result.totals.sellingPKRAllPassengers)}
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
// item, or a Selling Price — which is never database-locked), editing
// either field derives the other via `priceState`.
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

// Pricing for any service (Hotels, Visa, Flight, Transport, Train Ticket,
// Miscellaneous), grouped into two clearly separate rows: Original Price
// (uses Conversion Rate, still database-locked/derived exactly as before)
// and Selling Price (uses Selling Conversion Rate, always freely editable —
// there is no database concept for a selling price).
const PriceGroups = ({ isDbLocked, originalPriceState, sellingPriceState }) => (
  <div className="space-y-3">
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
        Original Price
      </p>
      <DualPriceFields isDbLocked={isDbLocked} priceState={originalPriceState} />
    </div>
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
        Selling Price
      </p>
      <DualPriceFields isDbLocked={false} priceState={sellingPriceState} />
    </div>
  </div>
);

// A single checkbox pill for an optional section (Flight/Visa/Transport/
// Train Ticket/Miscellaneous). Purely presentational — the parent decides
// what checking or unchecking actually does (show/hide the section, reset
// its state).
const OptionalServiceToggle = ({ label, checked, onChange }) => (
  <label
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
      checked
        ? "border-blue-500 bg-blue-50"
        : "border-gray-200 hover:bg-gray-50"
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 accent-blue-600"
    />
    <span className="text-sm font-medium text-gray-800">{label}</span>
  </label>
);

const ValidationBanner = ({ message }) => (
  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
    <span>{message}</span>
  </div>
);

// One included service's full internal breakdown: Original Price and
// Selling Price (both shown in SAR + PKR), and Profit — shown ONLY in the
// service's native currency (SAR for everything except Flight, which is
// PKR), color-coded green/red for profit/loss. `extraRows` lets callers
// prepend service-specific context (Persons/Nights for hotels, Passengers/
// group prices for Transport). Renders nothing when `service` is null (the
// section wasn't included).
const ServiceDetailCard = ({ title, service, extraRows = null }) => {
  if (!service) return null;
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
        {title}: {service.name}
        {service.isCustom ? " (Custom)" : ""}
      </p>
      <div className="space-y-1.5 text-sm">
        {extraRows}
        <DetailRow
          label="Original Price"
          value={pair(service.originalSAR, service.originalPKR)}
        />
        <DetailRow
          label="Selling Price"
          value={pair(service.sellingSAR, service.sellingPKR)}
        />
        <DetailRow
          label={`Profit (${service.nativeCurrency})`}
          value={profitDisplay(service)}
          bold
        />
      </div>
    </div>
  );
};

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

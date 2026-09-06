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
  Save,
} from "lucide-react";
import { Field, inputClass } from "../Main/FormControls";
import Button from "../UI/Button";
import SearchableCombobox from "../UI/SearchableCombobox";
import ValidationErrors from "../UI/ValidationErrors";
import SaveToHistoryModal from "../UI/SaveToHistoryModal";
import PrintReportShell from "../UI/PrintReportShell";
import useDualCurrencyPrice, { toPKR, toSAR } from "./useDualCurrencyPrice";
import { toUpper } from "../../utils/text";
import { API_BASE_URL as API } from "../../config/api";
import { saveCalculation } from "../../utils/savedCalculations";

const MAX_MISC_ITEMS = 5;
// Safety cap on the dynamic Routes list — a generous ceiling that still
// protects against a mistyped huge number (e.g. "999999") rendering
// thousands of select rows. Same convention as ExplanatoryPackage's
// MAX_STAYS.
const MAX_ROUTES = 20;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const money = (n) => `SAR ${Number(n || 0).toLocaleString()}`;
const moneyPKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

// Plain "date" input (Check-in/Check-out) — no time component.
const formatDateOnly = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
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

// Customer-facing print rows for print Table 1 (Package Services: Hotels,
// Visa, Flight, Train) — selling side only, always. No original price, no
// cost conversion rate, and no profit field is ever read here. Transport
// gets its own dedicated table (every route is its own row) and
// Miscellaneous is summarized only in the final summary table, so neither
// is built here.
const buildPrintRows = (result) => {
  const rows = [];

  if (result.makkahService) {
    const s = result.makkahService;
    rows.push({
      category: "Makkah Hotel",
      item: `${s.name}${s.isCustom ? " (Custom)" : ""}`,
      persons: s.persons || "-",
      nights: s.nights || "-",
      sellingSAR: money(s.sellingHotelPrice),
      sellingPKR: moneyPKR(s.sellingHotelPricePKR),
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
      sellingSAR: money(s.sellingHotelPrice),
      sellingPKR: moneyPKR(s.sellingHotelPricePKR),
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

  return rows;
};

// Table 3 rows — Category | Per Person PKR | All Passengers PKR. Every
// figure here is read directly from an already-computed service/totals
// field (Makkah+Madinah / Misc are a plain sum of those), never a new
// pricing formula. A category only appears if it was actually included.
const buildSummaryRows = (result) => {
  const totalPassengers = result.totals.totalPassengers;
  const rows = [];

  if (result.makkahService || result.madinahService) {
    rows.push({
      category: "Hotels",
      perPersonPKR:
        (result.makkahService?.sellingPKR || 0) +
        (result.madinahService?.sellingPKR || 0),
    });
  }
  if (result.visaService) {
    rows.push({ category: "Visa", perPersonPKR: result.visaService.sellingPKR });
  }
  if (result.flightService) {
    rows.push({ category: "Flight", perPersonPKR: result.flightService.sellingPKR });
  }
  if (result.trainTicketService) {
    rows.push({
      category: "Train",
      perPersonPKR: result.trainTicketService.sellingPKR,
    });
  }
  if (result.transportService) {
    rows.push({
      category: "Transport",
      perPersonPKR: result.transportService.sellingPKR,
    });
  }
  if (result.miscServices.length > 0) {
    rows.push({
      category: "Miscellaneous",
      perPersonPKR: result.miscServices.reduce((sum, m) => sum + m.sellingPKR, 0),
    });
  }

  return rows.map((r) => ({ ...r, allPassengersPKR: r.perPersonPKR * totalPassengers }));
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
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [clientName, setClientName] = useState("");

  // Travel Dates — Total Nights is derived from these (see tripDaysRaw/
  // totalNightsNum below); Total Days is its own independent manual field.
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [totalDays, setTotalDays] = useState("");

  // Single manually entered rate. Conversion Rate governs every Original
  // (cost) price AND every Selling price — there is no separate Selling
  // Conversion Rate input anymore (removed per explicit request; Selling
  // now always uses the same rate as Original).
  const [conversionRate, setConversionRate] = useState("");

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
  // Alias kept so every downstream Selling-side calculation (unchanged
  // below) transparently uses the same rate as Original.
  const sellingConversionRateNum = conversionRateNum;

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

  // Transport is entirely the dynamic Routes list below — a count-driven
  // list of compact route rows. Each row gets its OWN route, vehicle,
  // Original SAR, Selling SAR, and Passengers (different routes can use
  // different vehicles), combined together in calculate() into one
  // Transport total (see routeBreakdown/transportService there).
  // safely.
  const [numberOfRoutes, setNumberOfRoutes] = useState("");
  const [routeRows, setRouteRows] = useState([]);

  // Train Ticket — now backed by the Train listing (same
  // searchable-or-custom pattern as Visa/Flight/Transport above); a typed
  // value that doesn't match a saved train is still accepted as a
  // temporary custom entry.
  const [trainTicketText, setTrainTicketText] = useState("");
  const [trainSelected, setTrainSelected] = useState(null);
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
      setNumberOfRoutes("");
      setRouteRows([]);
    }
  };

  const handleToggleTrainTicket = (checked) => {
    setIncludeTrainTicket(checked);
    if (!checked) {
      setTrainTicketText("");
      setTrainSelected(null);
      trainTicketPrice.reset();
      trainTicketSellingPrice.reset();
    }
  };

  const [result, setResult] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const opts = { credentials: "include" };
        const [h, v, f, t, tr] = await Promise.all([
          fetch(`${API}/hotels`, opts).then((r) => r.json()),
          fetch(`${API}/visas`, opts).then((r) => r.json()),
          fetch(`${API}/tickets`, opts).then((r) => r.json()),
          fetch(`${API}/transports`, opts).then((r) => r.json()),
          fetch(`${API}/trains`, opts).then((r) => r.json()),
        ]);
        if (h.success) setHotels(h.data || []);
        if (v.success) setVisas(v.data || []);
        if (f.success) setFlights(f.data || []);
        if (t.success) setTransports(t.data || []);
        if (tr.success) setTrains(tr.data || []);
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

  // Distinct route labels / car types from the existing Transport listing —
  // Route and Car Type are selected completely independently of each other
  // (neither filters the other's options); only the Company/Rate step
  // afterward is scoped to the exact (route, carType) pair.
  const uniqueRoutes = [
    ...new Set(transports.map((t) => routeLabel(t)).filter(Boolean)),
  ];
  const uniqueCarTypes = [
    ...new Set(transports.map((t) => t.carType).filter(Boolean)),
  ].sort();

  // Every actual Transport record quoting this exact route+carType — one
  // row per company, so the user can pick any of them (never auto-picked,
  // not even when there's only one match).
  const ratesFor = (route, carType) =>
    !route || !carType
      ? []
      : transports.filter((t) => routeLabel(t) === route && t.carType === carType);

  const emptyRouteRow = () => ({
    route: "",
    carType: "",
    // Which exact backend Transport record (company + rate) was chosen for
    // this row — this is the only thing allowed to set originalSAR.
    selectedTransportId: "",
    agentName: "",
    originalSAR: "",
    sellingSAR: "",
    passengers: "",
    showRateOptions: false,
    // Companies typed in manually for a custom (not-in-database) route —
    // never sent to the backend, only held in this row's own state. Shaped
    // exactly like a Transport record ({_id, agentName, price}) so
    // selectRouteRowRate works on them unchanged.
    customRates: [],
    newCompanyName: "",
    newCompanyRate: "",
  });

  const growRoutes = (rows, count) =>
    count <= rows.length
      ? rows
      : [...rows, ...Array.from({ length: count - rows.length }, emptyRouteRow)];
  const shrinkRoutes = (rows, count) => rows.slice(0, Math.max(count, 0));
  const syncRouteRows = (rows, count) =>
    count > rows.length ? growRoutes(rows, count) : shrinkRoutes(rows, count);

  // The visible route rows always match Number of Routes exactly, updated
  // on every keystroke — no waiting for blur/Enter/Calculate. Typing a
  // smaller number removes the extra rows immediately, so re-typing a
  // multi-digit count (e.g. "3" -> "10") can transiently drop rows on the
  // "1" keystroke before the "0" lands; that's the accepted trade-off for
  // always-live syncing.
  const handleNumberOfRoutesChange = (value) => {
    setNumberOfRoutes(value);
    const n = Math.min(toPositiveNumber(value), MAX_ROUTES);
    setRouteRows((prev) => syncRouteRows(prev, n));
  };

  const handleNumberOfRoutesBlur = () => {
    let n = toPositiveNumber(numberOfRoutes);
    if (n > MAX_ROUTES) n = MAX_ROUTES;
    setNumberOfRoutes(n > 0 ? String(n) : "");
    setRouteRows((prev) => syncRouteRows(prev, n));
  };

  // Route and Car Type are independent selections — changing either one
  // never touches the other, it only clears whichever company/rate was
  // chosen and the typed Original SAR (that price was scoped to the OLD
  // route+carType pair, so it's no longer valid).
  const updateRouteRow = (index, field, value) => {
    setRouteRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === "route" || field === "carType") {
          return {
            ...row,
            [field]: value,
            selectedTransportId: "",
            agentName: "",
            originalSAR: "",
            showRateOptions: false,
            customRates: [],
            newCompanyName: "",
            newCompanyRate: "",
          };
        }
        return { ...row, [field]: value };
      })
    );
  };

  // Opening one row's popup always closes every other row's — only one
  // Company/Rate card is ever open at a time.
  const toggleRouteRowRates = (index) => {
    setRouteRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, showRateOptions: !row.showRateOptions }
          : { ...row, showRateOptions: false }
      )
    );
  };

  const closeAllRouteRowRates = () => {
    setRouteRows((prev) =>
      prev.some((row) => row.showRateOptions)
        ? prev.map((row) => ({ ...row, showRateOptions: false }))
        : prev
    );
  };

  // Click-outside-to-close for the Company/Rate popup — anything inside a
  // popup (or its trigger button) carries data-rate-popover, so a click
  // there is never treated as "outside".
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-rate-popover]")) closeAllRouteRowRates();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Company/Rate selection is optional and toggleable: picking a company
  // fills Original SAR from its rate (which stays editable afterward, so
  // it can be manually adjusted). Clicking the same company again
  // deselects it — the typed Original SAR value is left as-is, so the
  // user can keep it, edit it, or ignore company rates entirely.
  const selectRouteRowRate = (index, record) => {
    setRouteRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (row.selectedTransportId === record._id) {
          return { ...row, selectedTransportId: "", agentName: "" };
        }
        return {
          ...row,
          selectedTransportId: record._id,
          agentName: record.agentName,
          originalSAR: String(safePrice(record.price)),
          showRateOptions: false,
        };
      })
    );
  };

  // Explicit "Clear" affordance in the popup header — same deselect as
  // re-clicking the checkbox, but reachable without knowing which row is
  // currently checked. Leaves Original SAR untouched.
  const clearRouteRowRate = (index) => {
    setRouteRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, selectedTransportId: "", agentName: "" } : row
      )
    );
  };

  // Safely coerce a price to a non-negative number.
  const safePrice = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  // Adds a manually-typed company + rate to a row's own local list — used
  // for a custom route that doesn't exist in the Transport database. Never
  // saved to the backend, and never auto-selected; the user still has to
  // check it below, exactly like picking a real backend rate.
  const addCustomRateForRouteRow = (index) => {
    setRouteRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const name = row.newCompanyName.trim();
        const rate = safePrice(row.newCompanyRate);
        if (!name || rate <= 0) return row;
        return {
          ...row,
          customRates: [
            ...row.customRates,
            { _id: `custom-${Date.now()}-${row.customRates.length}`, agentName: name, price: rate },
          ],
          newCompanyName: "",
          newCompanyRate: "",
        };
      })
    );
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

  // Total Nights is derived from Check-in/Check-out — never manually typed
  // (exclusive nights-between convention already used for hotel stays
  // elsewhere in this app; e.g. 1st to 15th = 14 nights). Total Days is a
  // completely independent manual input — deliberately NOT validated
  // against Total Nights, so e.g. Total Days can be 30 while calculated
  // Nights are 14.
  const tripDaysRaw =
    checkInDate && checkOutDate
      ? Math.round((new Date(checkOutDate) - new Date(checkInDate)) / MS_PER_DAY)
      : null;
  const tripDatesValid = tripDaysRaw !== null && tripDaysRaw > 0;
  const tripDateError =
    checkInDate && checkOutDate && !tripDatesValid
      ? "Return/Check-out date must be after Departure/Check-in date."
      : "";
  const totalNightsNum = tripDatesValid ? tripDaysRaw : 0;
  const totalDaysNum = toPositiveNumber(totalDays);

  // Total Days vs. Makkah/Madinah nights validation. Makkah Nights +
  // Madinah Nights must equal Total Days EXACTLY — no tolerance. This is
  // only enforced once the user has actually started entering nights —
  // a Visa/Flight-only package with no hotel nights is never blocked by it.
  const makkahNightsNum = toPositiveNumber(makkahNights);
  const madinahNightsNum = toPositiveNumber(madinahNights);
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
    routeRows.length > 0 ||
    trainTicketText.trim() ||
    miscInUse
  );
  const conversionRateError = !pricingInUse
    ? ""
    : conversionRate === ""
    ? "Enter a Conversion Rate to calculate original/cost and selling PKR prices."
    : conversionRateNum <= 0
    ? "Conversion Rate must be a positive number."
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

  // Required-field validation — the Calculate button stays disabled and a
  // banner lists what's missing until every field for every section the
  // user has actually turned on/started is present and valid. A section
  // that's never touched (hotel text left blank, service checkbox off)
  // never blocks Calculate; the moment it's "in use" its required fields
  // (price, persons/nights/passengers) are enforced.
  const buildServiceValidation = (
    inUse,
    label,
    textFilled,
    origValue,
    sellValue,
    extra = []
  ) => {
    if (!inUse) return [];
    if (textFilled === false) return [`Select or enter ${label}.`];
    const errors = [];
    const origNum = Number(origValue);
    const sellNum = Number(sellValue);
    if (!(Number.isFinite(origNum) && origNum > 0)) {
      errors.push(`Enter a valid original price for ${label}.`);
    }
    if (!(Number.isFinite(sellNum) && sellNum > 0)) {
      errors.push(`Enter a valid selling price for ${label}.`);
    }
    return [...errors, ...extra];
  };

  const noServiceError = pricingInUse
    ? ""
    : "Add at least one service (hotel, visa, flight, transport, train ticket, or miscellaneous item) to build your package.";

  const makkahInUse = !!makkahHotelText.trim();
  const madinahInUse = !!madinahHotelText.trim();
  const makkahPersonsNumTop = toPositiveNumber(makkahPersons);
  const madinahPersonsNumTop = toPositiveNumber(madinahPersons);

  const makkahErrors = buildServiceValidation(
    makkahInUse,
    "the Makkah Hotel",
    undefined,
    makkahHotelPrice.sar,
    makkahSellingPrice.sar,
    [
      ...(makkahPersonsNumTop > 0 ? [] : ["Enter the number of Persons for Makkah."]),
      ...(makkahNightsNum > 0 ? [] : ["Enter the number of Nights for Makkah."]),
    ]
  );
  const madinahErrors = buildServiceValidation(
    madinahInUse,
    "the Madinah Hotel",
    undefined,
    madinahHotelPrice.sar,
    madinahSellingPrice.sar,
    [
      ...(madinahPersonsNumTop > 0 ? [] : ["Enter the number of Persons for Madinah."]),
      ...(madinahNightsNum > 0 ? [] : ["Enter the number of Nights for Madinah."]),
    ]
  );
  const visaErrors = buildServiceValidation(
    includeVisa,
    "a Visa Type",
    !!visaTypeText.trim(),
    visaPrice.sar,
    visaSellingPrice.sar
  );
  const flightErrors = buildServiceValidation(
    includeFlight,
    "a Flight",
    !!flightText.trim(),
    flightPrice.pkr,
    flightSellingPrice.pkr
  );
  // Transport has no required-field validation right now — its old single
  // route/vehicle/price fields were replaced by the dynamic Routes rows
  // above, which aren't wired into the calculation yet (see the Routes
  // section), so there's nothing yet to require here.
  const trainErrors = buildServiceValidation(
    includeTrainTicket,
    "a Train Ticket",
    !!trainTicketText.trim(),
    trainTicketPrice.sar,
    trainTicketSellingPrice.sar
  );
  const miscErrors = includeMisc
    ? miscItems.flatMap((item, idx) => {
        if (!(item.name || "").trim()) return [];
        const origNum = Number(item.originalSAR);
        const sellNum = Number(item.sellingSAR);
        const errs = [];
        if (!(Number.isFinite(origNum) && origNum > 0)) {
          errs.push(`Enter a valid original price for Misc ${idx + 1}.`);
        }
        if (!(Number.isFinite(sellNum) && sellNum > 0)) {
          errs.push(`Enter a valid selling price for Misc ${idx + 1}.`);
        }
        return errs;
      })
    : [];

  // Each Route row that's been started at all (any field touched) must be
  // fully valid before Calculate is allowed — otherwise an incomplete row
  // (e.g. no selling price entered) would silently contribute $0 to the
  // combined Transport total instead of being flagged.
  const routeRowErrors = includeTransport
    ? routeRows.flatMap((r, idx) => {
        const started = !!(r.route || r.carType || r.originalSAR || r.sellingSAR || r.passengers);
        if (!started) return [];
        const errs = [];
        if (!r.route) {
          errs.push(`Select a route for Route ${idx + 1}.`);
        } else if (!r.carType) {
          errs.push(`Select a vehicle for Route ${idx + 1}.`);
        } else {
          const origNum = Number(r.originalSAR);
          if (!(Number.isFinite(origNum) && origNum > 0)) {
            errs.push(`Enter a valid original price for Route ${idx + 1}.`);
          }
        }
        const sellNum = Number(r.sellingSAR);
        if (!(Number.isFinite(sellNum) && sellNum > 0)) {
          errs.push(`Enter a valid selling price for Route ${idx + 1}.`);
        }
        const paxNum = Number(r.passengers);
        if (!(Number.isFinite(paxNum) && paxNum > 0 && Number.isInteger(paxNum))) {
          errs.push(`Enter valid Passengers for Route ${idx + 1}.`);
        }
        return errs;
      })
    : [];

  const sectionValidationErrors = [
    ...(noServiceError ? [noServiceError] : []),
    ...makkahErrors,
    ...madinahErrors,
    ...visaErrors,
    ...flightErrors,
    ...trainErrors,
    ...miscErrors,
    ...routeRowErrors,
  ];

  const hasStartedInput = !!(
    clientName.trim() ||
    checkInDate ||
    checkOutDate ||
    totalDays ||
    conversionRate ||
    totalPassengers ||
    pricingInUse
  );

  const calculate = () => {
    if (tripDateError) {
      alert(tripDateError);
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
    // Transport is now the dynamic Routes list — every route the user
    // actually filled in (route + vehicle + at least one passenger)
    // contributes its own Original/Selling/Profit, all combined below into
    // one Transport total.
    const validRouteRows = routeRows.filter(
      (r) => r.route && r.carType && toPositiveNumber(r.passengers) > 0
    );
    const trainTicket = includeTrainTicket
      ? resolveItem(trainTicketText, trainSelected, trainTicketPrice.sar, "trainName")
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
      validRouteRows.length === 0 &&
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
            // Same idea, selling side — the raw Sell SAR value exactly as
            // typed, before dividing by Persons.
            sellingHotelPrice: safePrice(makkahSellingPrice.sar),
            sellingHotelPricePKR:
              safePrice(makkahSellingPrice.sar) * sellingConversionRateNum,
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
            // Same idea, selling side — the raw Sell SAR value exactly as
            // typed, before dividing by Persons.
            sellingHotelPrice: safePrice(madinahSellingPrice.sar),
            sellingHotelPricePKR:
              safePrice(madinahSellingPrice.sar) * sellingConversionRateNum,
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

    // --- Transport: SAR-native. Every entered route is its own group price
    // (Original SAR / Selling SAR) divided by THAT route's own Passengers to
    // get a per-person figure — this is "profit per transport". Every
    // route's per-person Original and per-person Selling are then summed
    // into ONE combined Transport total (per the selling rate), which is
    // what actually feeds the package totals below — exactly the same
    // "per person, Total Passengers applied once at the end" convention
    // every other service already follows. ---
    const routeBreakdown = validRouteRows.map((r) => {
      const passengersNum = toPositiveNumber(r.passengers);
      const originalGroupPrice = safePrice(r.originalSAR);
      const sellingGroupPrice = safePrice(r.sellingSAR);
      const originalPerPerson = originalGroupPrice / passengersNum;
      const sellingPerPerson = sellingGroupPrice / passengersNum;
      return {
        route: r.route,
        carType: r.carType,
        passengers: passengersNum,
        originalGroupPrice,
        sellingGroupPrice,
        sellingGroupPricePKR: sellingGroupPrice * sellingConversionRateNum,
        originalPerPerson,
        originalPerPersonPKR: originalPerPerson * conversionRateNum,
        sellingPerPerson,
        sellingPerPersonPKR: sellingPerPerson * sellingConversionRateNum,
        profitPerPerson: sellingPerPerson - originalPerPerson,
        profitPerPersonPKR:
          sellingPerPerson * sellingConversionRateNum -
          originalPerPerson * conversionRateNum,
      };
    });
    const transportOriginalPerPerson = routeBreakdown.reduce(
      (sum, r) => sum + r.originalPerPerson,
      0
    );
    const transportSellingPerPerson = routeBreakdown.reduce(
      (sum, r) => sum + r.sellingPerPerson,
      0
    );
    const transportService =
      routeBreakdown.length > 0
        ? buildServiceRecord(
            routeBreakdown.length === 1
              ? `${routeBreakdown[0].route} (${routeBreakdown[0].carType})`
              : `${routeBreakdown.length} Routes`,
            false,
            "SAR",
            transportOriginalPerPerson,
            transportOriginalPerPerson * conversionRateNum,
            transportSellingPerPerson,
            transportSellingPerPerson * sellingConversionRateNum,
            { routes: routeBreakdown }
          )
        : null;

    // --- Train Ticket: SAR-native, flat. Same DB-or-custom shape as
    // Visa/Flight/Transport now that a Train listing exists. ---
    const trainTicketService = trainTicket
      ? buildServiceRecord(
          trainTicket.trainName,
          trainTicket.isCustom,
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
      clientName,
      checkInDate,
      checkOutDate,
      totalDays: totalDaysNum,
      totalNights: totalNightsNum,
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
    setClientName("");
    setCheckInDate("");
    setCheckOutDate("");
    setTotalDays("");
    setConversionRate("");
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
    setNumberOfRoutes("");
    setRouteRows([]);

    setIncludeTrainTicket(false);
    setTrainTicketText("");
    setTrainSelected(null);
    trainTicketPrice.reset();
    trainTicketSellingPrice.reset();

    setIncludeMisc(false);
    setMiscItems([]);

    setResult(null);
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
        type: "package",
        clientName: name.trim(),
        snapshot: { ...result, packageKind: "normal" },
        total: result.totals.sellingPKRAllPassengers,
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

  const printRows = result ? buildPrintRows(result) : [];
  const summaryRows = result ? buildSummaryRows(result) : [];
  const canCalculate =
    !tripDateError &&
    !nightsValidationError &&
    !conversionRateError &&
    !totalPassengersError &&
    sectionValidationErrors.length === 0;

  return (
    <>
      {/* PRINT CSS — same convention as HotelForm.jsx: the on-screen
          working view (including the on-screen result card) is hidden
          from print entirely, only the dedicated report block prints. */}
      <style>
        {`
          @media print {
            #package-print-report {
              display: block !important;
              max-width: 720px;
              margin: 0 auto;
            }
          }
          #package-print-report { display: none; }
        `}
      </style>

      {loading ? (
        <div className="calc-card p-8 text-center text-muted no-print">
          Loading listings...
        </div>
      ) : (
        <div className="space-y-4 no-print">
          {/* PACKAGE BASICS */}
          <div className="calc-card p-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
              <PackageCheck size={18} className="text-red-600" />
              Package Details
            </h2>

            {/* Client — Client Name, Conversion Rate, and Total Passengers. */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="Client Name">
                <input
                  type="text"
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(toUpper(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Conversion Rate">
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

            {/* Travel Dates — Total Nights is read-only, derived
                automatically from Check-in/Check-out. Total Days is a
                separate, independent manual field (not validated against
                Total Nights). */}
            <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Check-in / Departure Date">
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Check-out / Return Date">
                <input
                  type="date"
                  min={checkInDate || undefined}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
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
              <Field label="Total Nights">
                <input
                  type="text"
                  readOnly
                  value={tripDatesValid ? String(totalNightsNum) : "—"}
                  className={`${inputClass} bg-gray-100 text-gray-600 cursor-not-allowed`}
                />
              </Field>
            </div>

            {(tripDateError ||
              nightsValidationError ||
              conversionRateError ||
              totalPassengersError) && (
              <div className="mt-3 space-y-1.5">
                {tripDateError && <ValidationBanner message={tripDateError} />}
                {nightsValidationError && (
                  <ValidationBanner message={nightsValidationError} />
                )}
                {conversionRateError && (
                  <ValidationBanner message={conversionRateError} />
                )}
                {totalPassengersError && (
                  <ValidationBanner message={totalPassengersError} />
                )}
              </div>
            )}
          </div>

          {/* HOTELS */}
          <div className="calc-card p-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
              <Building2 size={18} className="text-blue-600" />
              Hotels
            </h2>
            <div className="space-y-3">
              {/* Makkah — one compact row. */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 items-end">
                <Field label="Makkah Hotel" className="col-span-2 sm:col-span-1">
                  <SearchableCombobox
                    value={makkahHotelText}
                    onTextChange={(text) => {
                      setMakkahHotelText(toUpper(text));
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
                <CompactPriceField
                  label="Orig SAR"
                  value={makkahHotelPrice.sar}
                  onChange={makkahHotelPrice.setSar}
                  readOnly={!!makkahHotelSelected}
                />
                <CompactPriceField
                  label="Sell SAR"
                  value={makkahSellingPrice.sar}
                  onChange={makkahSellingPrice.setSar}
                  readOnly={false}
                />
                <Field label="Nights">
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

              {/* Madinah — identical compact row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 items-end">
                <Field label="Madinah Hotel" className="col-span-2 sm:col-span-1">
                  <SearchableCombobox
                    value={madinahHotelText}
                    onTextChange={(text) => {
                      setMadinahHotelText(toUpper(text));
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
                <CompactPriceField
                  label="Orig SAR"
                  value={madinahHotelPrice.sar}
                  onChange={madinahHotelPrice.setSar}
                  readOnly={!!madinahHotelSelected}
                />
                <CompactPriceField
                  label="Sell SAR"
                  value={madinahSellingPrice.sar}
                  onChange={madinahSellingPrice.setSar}
                  readOnly={false}
                />
                <Field label="Nights">
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

          {/* OPTIONAL SERVICES */}
          <div className="calc-card p-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
              <ListChecks size={18} className="text-blue-600" />
              Optional Services
            </h2>
            <div className="flex flex-wrap gap-2.5">
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

          {/* FLIGHT / VISA / TRANSPORT / TRAIN TICKET — each enabled service
              is one compact row (not a card), stacked in a single container. */}
          {(includeFlight || includeVisa || includeTransport || includeTrainTicket) && (
            <div className="calc-card p-4 space-y-3 divide-y divide-gray-100">
              {includeFlight && (
                <div className="grid grid-cols-2 lg:grid-cols-[auto_2fr_1fr_1fr] gap-3 items-end pt-3 first:pt-0">
                  <ServiceRowLabel icon={Plane} label="Flight" />
                  <Field label="Flight" className="col-span-2 lg:col-span-1">
                    <SearchableCombobox
                      value={flightText}
                      onTextChange={(text) => {
                        setFlightText(toUpper(text));
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
                  {/* Flight is PKR-native — only the PKR fields are shown,
                      no SAR clutter. */}
                  <CompactPriceField
                    label="Orig PKR"
                    value={flightPrice.pkr}
                    onChange={flightPrice.setPkr}
                    readOnly={!!flightSelected}
                  />
                  <CompactPriceField
                    label="Sell PKR"
                    value={flightSellingPrice.pkr}
                    onChange={flightSellingPrice.setPkr}
                    readOnly={false}
                  />
                </div>
              )}

              {includeVisa && (
                <div className="grid grid-cols-2 lg:grid-cols-[auto_2fr_1fr_1fr] gap-3 items-end pt-3 first:pt-0">
                  <ServiceRowLabel icon={FileText} label="Visa" />
                  <Field label="Visa Type" className="col-span-2 lg:col-span-1">
                    <SearchableCombobox
                      value={visaTypeText}
                      onTextChange={(text) => {
                        setVisaTypeText(toUpper(text));
                        setVisaSelected(null);
                      }}
                      onSelect={(v) => {
                        setVisaSelected(v);
                        setVisaTypeText(v.category);
                        visaPrice.setFromDatabase(v.price);
                      }}
                      options={visas}
                      getLabel={(v) => v.category}
                      getSubLabel={(v) => `${v.agentName} · ${money(v.price)}`}
                      placeholder="Search or type a visa type"
                      isSelected={!!visaSelected}
                    />
                  </Field>
                  {/* Visa is SAR-native — only the SAR fields are shown. */}
                  <CompactPriceField
                    label="Orig SAR"
                    value={visaPrice.sar}
                    onChange={visaPrice.setSar}
                    readOnly={!!visaSelected}
                  />
                  <CompactPriceField
                    label="Sell SAR"
                    value={visaSellingPrice.sar}
                    onChange={visaSellingPrice.setSar}
                    readOnly={false}
                  />
                </div>
              )}

              {includeTransport && (
                <div className="pt-3 first:pt-0 space-y-3">
                  {/* Routes — count-driven list of compact route rows, at
                      the top of the Transport section. Each row gets its
                      own Route, Vehicle, Original SAR, Selling SAR, and
                      Passengers, since different routes can use different
                      vehicles. Not wired into the calculation yet — inputs
                      only, per explicit instruction. */}
                  <div>
                    <div className="flex items-end gap-3">
                      <ServiceRowLabel icon={Car} label="Transport" />
                      <Field label="Number of Routes" className="max-w-40">
                        <input
                          type="number"
                          min="0"
                          max={MAX_ROUTES}
                          placeholder="e.g. 3"
                          value={numberOfRoutes}
                          onChange={(e) => handleNumberOfRoutesChange(e.target.value)}
                          onBlur={handleNumberOfRoutesBlur}
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    {routeRows.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {routeRows.map((row, idx) => {
                          const matchingRates = [
                            ...ratesFor(row.route, row.carType),
                            ...row.customRates,
                          ];
                          // A route the user typed by hand that doesn't
                          // match any existing Transport record — lets a
                          // company/rate still be entered for it below,
                          // without ever adding it to the master database.
                          const isCustomRoute =
                            !!row.route && !uniqueRoutes.includes(row.route);
                          return (
                            <div
                              key={idx}
                              className="rounded-lg border border-gray-100 p-2"
                            >
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.2fr_1.2fr_1.2fr_1fr_1fr_0.8fr] gap-3 items-end">
                                {/* Route and Car Type are independent — picking
                                    one never filters or resets the other. */}
                                <Field label={`Route ${idx + 1}`}>
                                  <SearchableCombobox
                                    value={row.route}
                                    onTextChange={(text) =>
                                      updateRouteRow(idx, "route", toUpper(text))
                                    }
                                    onSelect={(r) => updateRouteRow(idx, "route", r)}
                                    options={uniqueRoutes}
                                    getLabel={(r) => r}
                                    placeholder="Select or type a route"
                                    isSelected={uniqueRoutes.includes(row.route)}
                                    // Every backend route is shown directly,
                                    // never collapsed behind a "+N more" hint.
                                    maxSuggestions={uniqueRoutes.length}
                                  />
                                </Field>
                                <Field label="Transport/Vehicle">
                                  <select
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={row.carType}
                                    onChange={(e) =>
                                      updateRouteRow(idx, "carType", e.target.value)
                                    }
                                  >
                                    <option value="">Select vehicle</option>
                                    {uniqueCarTypes.map((c) => (
                                      <option key={c} value={c}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>
                                </Field>

                                {/* Company/Rate — optional; only enabled once
                                    both Route and Car Type are chosen. Picking
                                    a company fills Original SAR from its rate
                                    as a convenient starting point, but the
                                    field stays editable and the company can
                                    be deselected (Clear, or re-click it). */}
                                <div className="relative" data-rate-popover>
                                  <Field label="Company / Rate">
                                    <button
                                      type="button"
                                      disabled={!row.route || !row.carType}
                                      onClick={() => toggleRouteRowRates(idx)}
                                      className={`w-full p-2 border rounded-lg text-sm text-left truncate cursor-pointer transition-colors ${
                                        !row.route || !row.carType
                                          ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                          : row.agentName
                                          ? "border-brand-300 bg-brand-50 text-brand-700 font-medium"
                                          : "border-gray-300 bg-white text-gray-700 hover:border-brand-300"
                                      }`}
                                    >
                                      {row.agentName || "View Rates"}
                                    </button>
                                  </Field>

                                  {row.showRateOptions && (
                                    <div className="absolute z-20 top-full left-0 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-lg p-2">
                                      <div className="flex items-center justify-between px-1.5 pb-1.5">
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                                          Select a company (optional)
                                        </p>
                                        {row.agentName && (
                                          <button
                                            type="button"
                                            onClick={() => clearRouteRowRate(idx)}
                                            className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
                                          >
                                            Clear
                                          </button>
                                        )}
                                      </div>
                                      <div className="space-y-0.5 max-h-52 overflow-y-auto">
                                        {matchingRates.length === 0 ? (
                                          <p className="text-xs text-gray-400 px-1.5 py-1">
                                            No company has quoted this exact
                                            route + vehicle yet.
                                          </p>
                                        ) : (
                                          matchingRates.map((t) => (
                                            <label
                                              key={t._id}
                                              className="flex items-center justify-between gap-3 text-sm px-1.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50"
                                            >
                                              <span className="flex items-center gap-2 min-w-0">
                                                <input
                                                  type="checkbox"
                                                  checked={row.selectedTransportId === t._id}
                                                  onChange={() => selectRouteRowRate(idx, t)}
                                                  className="w-4 h-4 shrink-0 accent-brand-600 cursor-pointer"
                                                />
                                                <span
                                                  className={`truncate ${
                                                    row.selectedTransportId === t._id
                                                      ? "font-semibold text-brand-700"
                                                      : "text-gray-700"
                                                  }`}
                                                >
                                                  {t.agentName}
                                                </span>
                                              </span>
                                              <span className="shrink-0 font-medium text-gray-600">
                                                {safePrice(t.price)} SAR
                                              </span>
                                            </label>
                                          ))
                                        )}
                                      </div>

                                      {isCustomRoute && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-1.5 pb-1.5">
                                            Add a company for this custom route
                                          </p>
                                          <div className="space-y-1.5 px-1.5">
                                            <input
                                              type="text"
                                              placeholder="Company name"
                                              value={row.newCompanyName}
                                              onChange={(e) =>
                                                setRouteRows((prev) =>
                                                  prev.map((r, i) =>
                                                    i === idx
                                                      ? { ...r, newCompanyName: toUpper(e.target.value) }
                                                      : r
                                                  )
                                                )
                                              }
                                              className="w-full p-1.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                            <div className="flex gap-1.5">
                                              <input
                                                type="number"
                                                placeholder="Rate (SAR)"
                                                value={row.newCompanyRate}
                                                onChange={(e) =>
                                                  setRouteRows((prev) =>
                                                    prev.map((r, i) =>
                                                      i === idx
                                                        ? { ...r, newCompanyRate: e.target.value }
                                                        : r
                                                    )
                                                  )
                                                }
                                                className="w-full p-1.5 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => addCustomRateForRouteRow(idx)}
                                                disabled={!row.newCompanyName.trim() || safePrice(row.newCompanyRate) <= 0}
                                                className="shrink-0 px-3 rounded-lg text-sm font-semibold bg-brand-600 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-brand-700"
                                              >
                                                Add
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <CompactPriceField
                                  label="Orig SAR"
                                  value={row.originalSAR}
                                  onChange={(v) => updateRouteRow(idx, "originalSAR", v)}
                                  readOnly={false}
                                />
                                <CompactPriceField
                                  label="Sell SAR"
                                  value={row.sellingSAR}
                                  onChange={(v) => updateRouteRow(idx, "sellingSAR", v)}
                                  readOnly={false}
                                />
                                <Field label="Passengers">
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 5"
                                    value={row.passengers}
                                    onChange={(e) =>
                                      updateRouteRow(idx, "passengers", e.target.value)
                                    }
                                    className={inputClass}
                                  />
                                </Field>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {includeTrainTicket && (
                <div className="grid grid-cols-2 lg:grid-cols-[auto_2fr_1fr_1fr] gap-3 items-end pt-3 first:pt-0">
                  <ServiceRowLabel icon={Train} label="Train Ticket" />
                  <Field label="Train Ticket" className="col-span-2 lg:col-span-1">
                    <SearchableCombobox
                      value={trainTicketText}
                      onTextChange={(text) => {
                        setTrainTicketText(toUpper(text));
                        setTrainSelected(null);
                      }}
                      onSelect={(t) => {
                        setTrainSelected(t);
                        setTrainTicketText(t.trainName);
                        trainTicketPrice.setFromDatabase(t.price);
                      }}
                      options={trains}
                      getLabel={(t) => t.trainName}
                      getSubLabel={(t) =>
                        `${t.route} · ${t.trainClass} · ${money(t.price)}`
                      }
                      placeholder="Search or type a train"
                      isSelected={!!trainSelected}
                    />
                  </Field>
                  {/* Train Ticket is SAR-native — only the SAR fields are shown. */}
                  <CompactPriceField
                    label="Orig SAR"
                    value={trainTicketPrice.sar}
                    onChange={trainTicketPrice.setSar}
                    readOnly={!!trainSelected}
                  />
                  <CompactPriceField
                    label="Sell SAR"
                    value={trainTicketSellingPrice.sar}
                    onChange={trainTicketSellingPrice.setSar}
                    readOnly={false}
                  />
                </div>
              )}
            </div>
          )}

          {/* MISCELLANEOUS — up to MAX_MISC_ITEMS temporary items, each one
              compact row instead of its own bordered card. */}
          {includeMisc && (
            <div className="calc-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <Sparkles size={18} className="text-blue-600" />
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
              <div className="space-y-2 divide-y divide-gray-100">
                {miscItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-2 lg:grid-cols-[auto_2fr_1fr_1fr_auto] gap-3 items-end pt-2 first:pt-0"
                  >
                    <ServiceRowLabel label={`Misc ${idx + 1}`} />
                    <Field label="Name" className="col-span-2 lg:col-span-1">
                      <input
                        type="text"
                        placeholder="e.g. Dates, Zam Zam, Ziyarat, Special Service"
                        value={item.name}
                        onChange={(e) =>
                          updateMiscItem(
                            item.id,
                            "name",
                            toUpper(e.target.value)
                          )
                        }
                        className={inputClass}
                      />
                    </Field>
                    {/* Miscellaneous is SAR-native — only the SAR fields are
                        shown, consistent with every other SAR-native row. */}
                    <CompactPriceField
                      label="Orig SAR"
                      value={item.originalSAR}
                      onChange={(v) => updateMiscItem(item.id, "originalSAR", v)}
                      readOnly={false}
                    />
                    <CompactPriceField
                      label="Sell SAR"
                      value={item.sellingSAR}
                      onChange={(v) => updateMiscItem(item.id, "sellingSAR", v)}
                      readOnly={false}
                    />
                    <button
                      type="button"
                      onClick={() => removeMiscItem(item.id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer justify-self-start lg:justify-self-center pb-2.5"
                      title="Remove this item"
                    >
                      <Trash2 size={16} />
                    </button>
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
          <div className="calc-card p-4">
            {hasStartedInput && sectionValidationErrors.length > 0 && (
              <div className="mb-3">
                <ValidationErrors messages={sectionValidationErrors} />
              </div>
            )}
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
          className="bg-surface rounded-2xl border border-hair shadow-soft mt-8 overflow-hidden animate-fade-in-up no-print"
        >
          {/* On-screen only — the internal/admin Original/Selling/Profit
              breakdown below never prints; the dedicated print-only report
              (below, after this card) is what actually goes to the
              printer. */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-hair bg-linear-to-r from-brand-50 to-surface">
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                Custom Package
              </p>
              <h2 className="text-2xl font-extrabold text-ink">
                {result.clientName || "Custom Package"}
              </h2>
              <p className="text-sm text-muted mt-1">
                {result.totalDays || "—"} Days · {result.totalNights || "—"}{" "}
                Nights · Rate: 1 SAR = {result.sellingConversionRate} PKR ·
                Price shown is per person
              </p>
            </div>
            <div className="flex gap-3 no-print">
              <Button
                variant="secondary"
                icon={Save}
                onClick={() => setShowSaveModal(true)}
              >
                Save
              </Button>
              <Button variant="success" icon={Printer} onClick={handlePrint}>
                Print
              </Button>
            </div>
          </div>

          {/* SCREEN-ONLY: full internal/admin breakdown — Original, Selling
              and Profit for every included service. */}
          <div className="p-4 space-y-2.5">
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
                    {result.transportService.routes.map((r, idx) => (
                      <DetailRow
                        key={idx}
                        label={`${r.route} — ${r.carType} (${r.passengers} pax)`}
                        value={
                          <span
                            className={
                              r.profitPerPerson < 0
                                ? "text-red-600"
                                : "text-emerald-600"
                            }
                          >
                            Profit: {pair(r.profitPerPerson, r.profitPerPersonPKR)}
                          </span>
                        }
                      />
                    ))}
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
                service's own math. Original and Selling totals sit side by
                side (same data as before, just grouped horizontally instead
                of stacked full-width). */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                <CostRow
                  label="Original Total (Per Person) — PKR"
                  value={moneyPKR(result.totals.originalPKR)}
                />
                <CostRow
                  label={`Original Total (All ${result.totals.totalPassengers}) — PKR`}
                  value={moneyPKR(result.totals.originalPKRAllPassengers)}
                  bold
                />
              </div>

              <div className="flex flex-col justify-center gap-1 px-4 py-3 bg-brand-600 text-white rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    Selling Total (Per Person) — PKR
                  </span>
                  <span className="text-lg font-extrabold">
                    {moneyPKR(result.totals.sellingPKR)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white/85">
                  <span className="text-xs font-medium">
                    Selling Total (All {result.totals.totalPassengers}) — PKR
                  </span>
                  <span className="text-sm font-bold">
                    {moneyPKR(result.totals.sellingPKRAllPassengers)}
                  </span>
                </div>
              </div>
            </div>

            {/* PROFIT BREAKDOWN — every included service's profit in its own
                native currency, then the two native subtotals kept strictly
                separate, then one overall equivalent presented in both
                currencies (converted using the Selling Conversion Rate).
                Per Person and All Passengers sit side by side. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700 mb-2">
                  Profit Breakdown — Per Person
                </h3>
                <div className="space-y-1 text-sm">
                  {result.makkahService && (
                    <DetailRow
                      label="Makkah Hotel"
                      value={profitDisplay(result.makkahService)}
                    />
                  )}
                  {result.madinahService && (
                    <DetailRow
                      label="Madinah Hotel"
                      value={profitDisplay(result.madinahService)}
                    />
                  )}
                  {result.visaService && (
                    <DetailRow label="Visa" value={profitDisplay(result.visaService)} />
                  )}
                  {result.flightService && (
                    <DetailRow
                      label="Flight"
                      value={profitDisplay(result.flightService)}
                    />
                  )}
                  {result.transportService && (
                    <DetailRow
                      label="Transport"
                      value={profitDisplay(result.transportService)}
                    />
                  )}
                  {result.trainTicketService && (
                    <DetailRow
                      label="Train Ticket"
                      value={profitDisplay(result.trainTicketService)}
                    />
                  )}
                  {result.miscServices.map((s, idx) => (
                    <DetailRow
                      key={idx}
                      label={`Misc ${idx + 1} (${s.name})`}
                      value={profitDisplay(s)}
                    />
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 space-y-1 text-sm">
                  <DetailRow
                    label="Total Native Profit — SAR"
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
                    label="Total Native Profit — PKR"
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

              {/* PROFIT — ALL PASSENGERS: the same native-currency figures
                  above, multiplied by Total Passengers only at this final
                  step — never used to inflate any individual service. */}
              <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700 mb-2">
                  Profit Breakdown — All {result.totals.totalPassengers} Passengers
                </h3>
                <div className="space-y-1 text-sm">
                  <DetailRow
                    label="Total Native Profit — SAR"
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
                    label="Total Native Profit — PKR"
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
            </div>

            {/* OVERALL PROFIT EQUIVALENT — Per Person and All Passengers
                side by side. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                className={`flex flex-col justify-center gap-1 px-4 py-3 rounded-xl text-white ${
                  result.totals.overallProfitSAR < 0 ? "bg-red-600" : "bg-emerald-600"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    Overall Profit Equiv. (Per Person) — SAR
                  </span>
                  <span className="text-lg font-extrabold">
                    {money(result.totals.overallProfitSAR)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white/85">
                  <span className="text-xs font-medium">
                    Overall Profit Equiv. (Per Person) — PKR
                  </span>
                  <span className="text-sm font-bold">
                    {moneyPKR(result.totals.overallProfitPKR)}
                  </span>
                </div>
              </div>

              <div
                className={`flex flex-col justify-center gap-1 px-4 py-3 rounded-xl text-white ${
                  result.totals.overallProfitSARAllPassengers < 0
                    ? "bg-red-600"
                    : "bg-emerald-600"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    Overall Profit Equiv. (All Passengers) — SAR
                  </span>
                  <span className="text-lg font-extrabold">
                    {money(result.totals.overallProfitSARAllPassengers)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white/85">
                  <span className="text-xs font-medium">
                    Overall Profit Equiv. (All Passengers) — PKR
                  </span>
                  <span className="text-sm font-bold">
                    {moneyPKR(result.totals.overallProfitPKRAllPassengers)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* PRINT-ONLY REPORT — same shared letterhead/table styling as
          HotelForm.jsx's print report: customer-facing Excel-style table,
          selling side only, never original price, never the cost
          conversion rate, never profit. */}
      {result && (
        <div id="package-print-report">
          <PrintReportShell
            reportTitle="Custom Package Cost Report"
            clientName={result.clientName || "N/A"}
          >
            {/* PACKAGE / TRAVEL INFORMATION — client + dates. Printed
                before the 3 cost tables below; the shell's own footer
                still renders last, after everything here and after
                Tables 1–3. */}
            <p style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "6px" }}>
              Package / Travel Information
            </p>
            <table className="print-report-table" style={{ marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Departure/Check-in Date</th>
                  <th>Return/Check-out Date</th>
                  <th className="center">Total Days</th>
                  <th className="center">Total Nights</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{result.clientName || "N/A"}</td>
                  <td>{formatDateOnly(result.checkInDate)}</td>
                  <td>{formatDateOnly(result.checkOutDate)}</td>
                  <td className="center">{result.totalDays || "—"}</td>
                  <td className="center">{result.totalNights ?? "—"}</td>
                </tr>
              </tbody>
            </table>

            {/* TABLE 1 — Package Services (Hotels, Visa, Flight, Train).
                No overall total here — that lives only in Table 3 below. */}
            <p style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "6px" }}>
              Package Services
            </p>
            <table className="print-report-table" style={{ marginBottom: "20px" }}>
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
                  <th className="num">Total Per Person SAR</th>
                  <th className="num">Total Per Person PKR</th>
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
            </table>

            {/* TABLE 2 — Transport Routes. Every selected route is its own
                row, however many there are. */}
            {result.transportService && (
              <>
                <p style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "6px" }}>
                  Transport Routes
                </p>
                <table className="print-report-table" style={{ marginBottom: "20px" }}>
                  <colgroup>
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "12%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Vehicle</th>
                      <th className="center">Passengers</th>
                      <th className="num">Selling Price SAR</th>
                      <th className="num">Selling Price PKR</th>
                      <th className="num">Per Person SAR</th>
                      <th className="num">Per Person PKR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.transportService.routes.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.route}</td>
                        <td>{r.carType}</td>
                        <td className="center">{r.passengers}</td>
                        <td className="num">{money(r.sellingGroupPrice)}</td>
                        <td className="num">{moneyPKR(r.sellingGroupPricePKR)}</td>
                        <td className="num">{money(r.sellingPerPerson)}</td>
                        <td className="num">{moneyPKR(r.sellingPerPersonPKR)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="grand-total">
                      <td colSpan={5} className="num">
                        Transport Total Per Person
                      </td>
                      <td className="num">{money(result.transportService.sellingSAR)}</td>
                      <td className="num">
                        {moneyPKR(result.transportService.sellingPKR)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}

            {/* TABLE 3 — Final Package Summary. */}
            <p style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "6px" }}>
              Final Package Summary
            </p>
            <table className="print-report-table">
              <colgroup>
                <col style={{ width: "40%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="num">Per Person PKR</th>
                  <th className="num">All Passengers PKR</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.category}>
                    <td>{row.category}</td>
                    <td className="num">{moneyPKR(row.perPersonPKR)}</td>
                    <td className="num">{moneyPKR(row.allPassengersPKR)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="grand-total">
                  <td>Complete Package Total — PKR</td>
                  <td className="num">{moneyPKR(result.totals.sellingPKR)}</td>
                  <td className="num">
                    {moneyPKR(result.totals.sellingPKRAllPassengers)}
                  </td>
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
        defaultValue={result?.clientName || ""}
        saving={saving}
      />
    </>
  );
};

// Two side-by-side inputs for the same price in SAR and PKR. When locked
// (an existing database record is selected) it's read-only and shows the
// database-derived value. Used once per currency per row — the compact
// layout shows only a service's native currency (SAR for everything except
// Flight, which is PKR), never both SAR and PKR side by side.
const CompactPriceField = ({ label, value, onChange, readOnly }) => (
  <Field label={label}>
    <input
      type="number"
      min="0"
      placeholder="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      disabled={readOnly}
      className={`${inputClass} ${
        readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
      }`}
    />
  </Field>
);

// A small fixed-width icon+label prefix identifying which service a compact
// row belongs to, replacing the old per-service card heading.
const ServiceRowLabel = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1.5 pb-2.5 lg:w-28 shrink-0">
    {Icon && <Icon size={16} className="text-blue-600 shrink-0" />}
    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
      {label}
    </span>
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
    <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {title}: {service.name}
        {service.isCustom ? " (Custom)" : ""}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
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

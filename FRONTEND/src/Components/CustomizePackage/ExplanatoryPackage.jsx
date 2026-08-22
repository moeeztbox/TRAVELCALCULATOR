import React, { useEffect, useState } from "react";
import {
  Building2,
  Calculator,
  PackageCheck,
  Trash2,
  AlertTriangle,
  Printer,
  Save,
} from "lucide-react";
import { Field, inputClass } from "../Main/FormControls";
import Button from "../UI/Button";
import SearchableCombobox from "../UI/SearchableCombobox";
import SaveToHistoryModal from "../UI/SaveToHistoryModal";
import PrintReportShell from "../UI/PrintReportShell";
import { toUpper } from "../../utils/text";
import { API_BASE_URL as API } from "../../config/api";
import { saveCalculation } from "../../utils/savedCalculations";

// Safety cap on how many separate stay blocks a single city can have — a
// generous ceiling that still protects against a mistyped huge number
// (e.g. "999999") rendering thousands of date inputs.
const MAX_STAYS = 20;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toPositiveNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Same exclusive check-in/check-out convention already used for hotel
// nights elsewhere in the project (HotelForm.jsx): checkout day itself
// isn't counted as a night. Returns null if either date is missing/invalid;
// may return <= 0 for a bad range — callers decide how to treat that.
const computeStayNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime()))
    return null;
  return Math.round((outDate - inDate) / MS_PER_DAY);
};

const isWithinRange = (dateStr, rangeStart, rangeEnd) => {
  if (!dateStr || !rangeStart || !rangeEnd) return true;
  const d = new Date(dateStr).getTime();
  const start = new Date(rangeStart).getTime();
  const end = new Date(rangeEnd).getTime();
  if (Number.isNaN(d) || Number.isNaN(start) || Number.isNaN(end)) return true;
  return d >= start && d <= end;
};

// Per-stay nights, the "3 + 4 + 5"-style breakdown string, and the summed
// total — invalid/incomplete stays contribute "-" to the breakdown and 0 to
// the total, so the total is never NaN even mid-edit.
const summarizeStays = (stays) => {
  const items = stays.map((s) => {
    const nights = computeStayNights(s.checkIn, s.checkOut);
    const valid = nights !== null && nights > 0;
    return { ...s, nights: valid ? nights : null, valid };
  });
  const total = items.reduce((sum, s) => (s.valid ? sum + s.nights : sum), 0);
  const breakdown = items.map((s) => (s.valid ? s.nights : "-")).join(" + ");
  return { items, total, breakdown };
};

const resolveHotel = (text, selected) => {
  if (selected) return { ...selected, isCustom: false };
  const trimmed = (text || "").trim();
  if (!trimmed) return null;
  return { hotelName: trimmed, isCustom: true, _id: null };
};

const emptyStay = () => ({ checkIn: "", checkOut: "" });

const growStays = (stays, count) =>
  count <= stays.length
    ? stays
    : [...stays, ...Array.from({ length: count - stays.length }, emptyStay)];

const shrinkStays = (stays, count) => stays.slice(0, Math.max(count, 0));

// Validates one city's hotel/persons/stays block. Returns `inUse: false`
// (no errors) when the hotel field is empty — an untouched city section
// never blocks Calculate.
const buildCityValidation = (cityName, hotelText, personsNum, stays, packageCheckIn, packageCheckOut) => {
  const inUse = !!hotelText.trim();
  if (!inUse) return { inUse, errors: [] };

  const errors = [];
  if (personsNum <= 0) errors.push(`Enter the number of Persons for ${cityName}.`);

  stays.forEach((s, idx) => {
    const label = `${cityName} Stay ${idx + 1}`;
    if (!s.checkIn || !s.checkOut) {
      errors.push(`${label}: enter both check-in and check-out dates.`);
      return;
    }
    const nights = computeStayNights(s.checkIn, s.checkOut);
    if (nights === null || nights <= 0) {
      errors.push(`${label}: check-out date must be after check-in date.`);
      return;
    }
    if (
      !isWithinRange(s.checkIn, packageCheckIn, packageCheckOut) ||
      !isWithinRange(s.checkOut, packageCheckIn, packageCheckOut)
    ) {
      errors.push(`${label}: dates must fall within the package date range.`);
    }
  });

  return { inUse, errors };
};

const ExplanatoryPackage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [packageName, setPackageName] = useState("");
  const [clientName, setClientName] = useState("");
  const [packageCheckIn, setPackageCheckIn] = useState("");
  const [packageCheckOut, setPackageCheckOut] = useState("");

  const [makkahHotelText, setMakkahHotelText] = useState("");
  const [makkahHotelSelected, setMakkahHotelSelected] = useState(null);
  const [makkahPersons, setMakkahPersons] = useState("");
  const [makkahCheckInsCount, setMakkahCheckInsCount] = useState("1");
  const [makkahStays, setMakkahStays] = useState([emptyStay()]);

  const [madinahHotelText, setMadinahHotelText] = useState("");
  const [madinahHotelSelected, setMadinahHotelSelected] = useState(null);
  const [madinahPersons, setMadinahPersons] = useState("");
  const [madinahCheckInsCount, setMadinahCheckInsCount] = useState("1");
  const [madinahStays, setMadinahStays] = useState([emptyStay()]);

  const [result, setResult] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/hotels`, {
          credentials: "include",
        }).then((r) => r.json());
        if (res.success) setHotels(res.data || []);
      } catch (err) {
        console.error("Error loading hotels:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const makkahHotels = hotels.filter((h) => h.city === "Makkah");
  const madinahHotels = hotels.filter((h) => h.city === "Madinah");

  // Grows immediately (safe/non-destructive) as the user types a bigger
  // number. Shrinking is deferred to onBlur so re-typing a multi-digit
  // count (e.g. selecting "3" and typing "10") never destructively drops
  // stay data on the transient "1" keystroke.
  const handleCheckInsChange = (setCount, setStays) => (value) => {
    setCount(value);
    const n = toPositiveNumber(value);
    if (n > 0) setStays((prev) => growStays(prev, Math.min(n, MAX_STAYS)));
  };

  const handleCheckInsBlur = (count, setCount, setStays) => () => {
    let n = toPositiveNumber(count);
    if (n < 1) n = 1;
    if (n > MAX_STAYS) n = MAX_STAYS;
    setCount(String(n));
    setStays((prev) =>
      n > prev.length ? growStays(prev, n) : shrinkStays(prev, n)
    );
  };

  const updateStay = (setStays, index, field, value) => {
    setStays((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  // Package Total Days — same exclusive check-in/check-out convention as
  // the hotel stays. Read-only/display-only, recalculated on every render.
  const packageDaysRaw =
    packageCheckIn && packageCheckOut
      ? computeStayNights(packageCheckIn, packageCheckOut)
      : null;
  const packageDaysValid = packageDaysRaw !== null && packageDaysRaw > 0;
  const packageDateError =
    packageCheckIn && packageCheckOut && !packageDaysValid
      ? "Package Check-out date must be after Check-in date."
      : "";

  const makkahPersonsNum = toPositiveNumber(makkahPersons);
  const madinahPersonsNum = toPositiveNumber(madinahPersons);

  const makkahSummaryLive = summarizeStays(makkahStays);
  const madinahSummaryLive = summarizeStays(madinahStays);

  const makkahValidation = buildCityValidation(
    "Makkah",
    makkahHotelText,
    makkahPersonsNum,
    makkahStays,
    packageCheckIn,
    packageCheckOut
  );
  const madinahValidation = buildCityValidation(
    "Madinah",
    madinahHotelText,
    madinahPersonsNum,
    madinahStays,
    packageCheckIn,
    packageCheckOut
  );

  const noHotelsError =
    !makkahValidation.inUse && !madinahValidation.inUse
      ? "Please add at least one hotel (Makkah or Madinah) to build the explanatory package."
      : "";

  const allErrors = [
    ...(packageDateError ? [packageDateError] : []),
    ...makkahValidation.errors,
    ...madinahValidation.errors,
    ...(noHotelsError ? [noHotelsError] : []),
  ];

  const canCalculate = allErrors.length === 0;

  const calculate = () => {
    if (!packageName.trim()) {
      alert("Please enter a package name.");
      return;
    }
    if (allErrors.length > 0) {
      alert(allErrors[0]);
      return;
    }

    const makkahHotel = resolveHotel(makkahHotelText, makkahHotelSelected);
    const madinahHotel = resolveHotel(madinahHotelText, madinahHotelSelected);

    setResult({
      packageName: packageName.trim(),
      clientName,
      packageCheckIn,
      packageCheckOut,
      totalDays: packageDaysValid ? packageDaysRaw : 0,
      makkah: makkahHotel
        ? {
            hotel: makkahHotel,
            persons: makkahPersonsNum,
            totalCheckIns: makkahStays.length,
            stays: makkahSummaryLive.items,
            breakdown: makkahSummaryLive.breakdown,
            totalNights: makkahSummaryLive.total,
          }
        : null,
      madinah: madinahHotel
        ? {
            hotel: madinahHotel,
            persons: madinahPersonsNum,
            totalCheckIns: madinahStays.length,
            stays: madinahSummaryLive.items,
            breakdown: madinahSummaryLive.breakdown,
            totalNights: madinahSummaryLive.total,
          }
        : null,
    });

    setTimeout(() => {
      document
        .getElementById("explanatory-summary")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const clearAll = () => {
    setPackageName("");
    setClientName("");
    setPackageCheckIn("");
    setPackageCheckOut("");

    setMakkahHotelText("");
    setMakkahHotelSelected(null);
    setMakkahPersons("");
    setMakkahCheckInsCount("1");
    setMakkahStays([emptyStay()]);

    setMadinahHotelText("");
    setMadinahHotelSelected(null);
    setMadinahPersons("");
    setMadinahCheckInsCount("1");
    setMadinahStays([emptyStay()]);

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
        snapshot: { ...result, packageKind: "explanatory" },
        total: 0,
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

  return (
    <div className="space-y-6">
      {/* PRINT CSS — same convention as HotelForm.jsx: the on-screen working
          view is hidden from print entirely, only the dedicated report
          block prints. */}
      <style>
        {`
          @media print {
            #explanatory-print-report {
              display: block !important;
              max-width: 720px;
              margin: 0 auto;
            }
          }
          #explanatory-print-report { display: none; }
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Field label="Package Name" required className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="My Explanatory Umrah Package"
                  value={packageName}
                  onChange={(e) => setPackageName(toUpper(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Client Name" className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(toUpper(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Package Check-in Date">
                <input
                  type="date"
                  value={packageCheckIn}
                  onChange={(e) => setPackageCheckIn(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Package Check-out Date">
                <input
                  type="date"
                  min={packageCheckIn || undefined}
                  value={packageCheckOut}
                  onChange={(e) => setPackageCheckOut(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Total Days" className="sm:col-span-4 sm:w-1/4">
                <input
                  type="text"
                  readOnly
                  value={packageDaysValid ? String(packageDaysRaw) : "—"}
                  className={`${inputClass} bg-gray-100 text-gray-600 cursor-not-allowed`}
                />
              </Field>
            </div>

            {allErrors.length > 0 && (
              <div className="mt-4">
                <ValidationBanner messages={allErrors} />
              </div>
            )}
          </div>

          {/* HOTELS */}
          <div className="calc-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <Building2 size={20} className="text-blue-600" />
              Hotels
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CityStaysForm
                cityLabel="Makkah"
                hotels={makkahHotels}
                hotelText={makkahHotelText}
                hotelSelected={makkahHotelSelected}
                onHotelTextChange={(text) => {
                  setMakkahHotelText(toUpper(text));
                  setMakkahHotelSelected(null);
                }}
                onHotelSelect={(hotel) => {
                  setMakkahHotelSelected(hotel);
                  setMakkahHotelText(hotel.hotelName);
                }}
                persons={makkahPersons}
                onPersonsChange={setMakkahPersons}
                checkInsCount={makkahCheckInsCount}
                onCheckInsChange={handleCheckInsChange(
                  setMakkahCheckInsCount,
                  setMakkahStays
                )}
                onCheckInsBlur={handleCheckInsBlur(
                  makkahCheckInsCount,
                  setMakkahCheckInsCount,
                  setMakkahStays
                )}
                stays={makkahStays}
                onStayChange={(idx, field, value) =>
                  updateStay(setMakkahStays, idx, field, value)
                }
                summary={makkahSummaryLive}
                packageCheckIn={packageCheckIn}
                packageCheckOut={packageCheckOut}
              />

              <CityStaysForm
                cityLabel="Madinah"
                hotels={madinahHotels}
                hotelText={madinahHotelText}
                hotelSelected={madinahHotelSelected}
                onHotelTextChange={(text) => {
                  setMadinahHotelText(toUpper(text));
                  setMadinahHotelSelected(null);
                }}
                onHotelSelect={(hotel) => {
                  setMadinahHotelSelected(hotel);
                  setMadinahHotelText(hotel.hotelName);
                }}
                persons={madinahPersons}
                onPersonsChange={setMadinahPersons}
                checkInsCount={madinahCheckInsCount}
                onCheckInsChange={handleCheckInsChange(
                  setMadinahCheckInsCount,
                  setMadinahStays
                )}
                onCheckInsBlur={handleCheckInsBlur(
                  madinahCheckInsCount,
                  setMadinahCheckInsCount,
                  setMadinahStays
                )}
                stays={madinahStays}
                onStayChange={(idx, field, value) =>
                  updateStay(setMadinahStays, idx, field, value)
                }
                summary={madinahSummaryLive}
                packageCheckIn={packageCheckIn}
                packageCheckOut={packageCheckOut}
              />
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
                Calculate
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

      {/* RESULT */}
      {result && (
        <div
          id="explanatory-summary"
          className="bg-surface rounded-2xl border border-hair shadow-soft mt-8 overflow-hidden animate-fade-in-up no-print"
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-hair bg-linear-to-r from-brand-50 to-surface">
            <div>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                Explanatory Package
              </p>
              <h2 className="text-2xl font-extrabold text-ink">
                {result.packageName}
              </h2>
              {result.clientName && (
                <p className="text-sm font-medium text-ink mt-1">
                  Client: {result.clientName}
                </p>
              )}
              <p className="text-sm text-muted mt-1">
                {formatDate(result.packageCheckIn)} →{" "}
                {formatDate(result.packageCheckOut)} ·{" "}
                {result.totalDays || "—"}{" "}
                {result.totalDays === 1 ? "Day" : "Days"}
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

          <div className="p-6 space-y-6">
            {result.makkah && (
              <CityStaySummary title="Makkah Hotel" data={result.makkah} />
            )}
            {result.madinah && (
              <CityStaySummary title="Madinah Hotel" data={result.madinah} />
            )}
          </div>
        </div>
      )}

      {/* PRINT-ONLY REPORT — one clean Excel-style table, one row per stay
          across both cities (no pricing — this package type is a
          nights/dates planner only). */}
      {result && (
        <div id="explanatory-print-report">
          <PrintReportShell
            reportTitle={`Explanatory Package — ${result.packageName}`}
            clientName={result.clientName || "N/A"}
          >
            <table className="print-report-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Hotel</th>
                  <th className="center">Persons</th>
                  <th className="center">Stay #</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th className="center">Nights</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Makkah", result.makkah],
                  ["Madinah", result.madinah],
                ].flatMap(([city, data]) =>
                  data
                    ? data.stays.map((s, idx) => (
                        <tr key={`${city}-${idx}`}>
                          <td>{city}</td>
                          <td>
                            {data.hotel.hotelName}
                            {data.hotel.isCustom ? " (Custom)" : ""}
                          </td>
                          <td className="center">{data.persons}</td>
                          <td className="center">{idx + 1}</td>
                          <td>{formatDate(s.checkIn)}</td>
                          <td>{formatDate(s.checkOut)}</td>
                          <td className="center">{s.valid ? s.nights : "—"}</td>
                        </tr>
                      ))
                    : []
                )}
              </tbody>
              <tfoot>
                <tr className="grand-total">
                  <td colSpan={6} className="num">
                    Total Package Days
                  </td>
                  <td className="center">{result.totalDays || "—"}</td>
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
    </div>
  );
};

// One city's Hotel/Persons/Total Check-ins fields plus its dynamically
// sized list of stay blocks and the live "Nights: 3 + 4 + 5" summary bar.
const CityStaysForm = ({
  cityLabel,
  hotels,
  hotelText,
  hotelSelected,
  onHotelTextChange,
  onHotelSelect,
  persons,
  onPersonsChange,
  checkInsCount,
  onCheckInsChange,
  onCheckInsBlur,
  stays,
  onStayChange,
  summary,
  packageCheckIn,
  packageCheckOut,
}) => (
  <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
      {cityLabel} Hotel
    </p>
    <div className="space-y-3">
      <Field label="Hotel Name">
        <SearchableCombobox
          value={hotelText}
          onTextChange={onHotelTextChange}
          onSelect={onHotelSelect}
          options={hotels}
          getLabel={(h) => h.hotelName}
          getSubLabel={(h) => `${h.roomType ? h.roomType + " · " : ""}${h.city}`}
          placeholder={`Search or type a ${cityLabel} hotel`}
          isSelected={!!hotelSelected}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Persons">
          <input
            type="number"
            min="1"
            placeholder="e.g. 2"
            value={persons}
            onChange={(e) => onPersonsChange(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Total Check-ins">
          <input
            type="number"
            min="1"
            max={MAX_STAYS}
            placeholder="e.g. 3"
            value={checkInsCount}
            onChange={(e) => onCheckInsChange(e.target.value)}
            onBlur={onCheckInsBlur}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="space-y-2">
        {stays.map((stay, idx) => {
          const item = summary.items[idx];
          return (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 bg-white p-3"
            >
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {cityLabel} Stay {idx + 1}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check-in Date">
                  <input
                    type="date"
                    min={packageCheckIn || undefined}
                    max={packageCheckOut || undefined}
                    value={stay.checkIn}
                    onChange={(e) => onStayChange(idx, "checkIn", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Check-out Date">
                  <input
                    type="date"
                    min={stay.checkIn || packageCheckIn || undefined}
                    max={packageCheckOut || undefined}
                    value={stay.checkOut}
                    onChange={(e) => onStayChange(idx, "checkOut", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <p className="mt-2 text-xs font-medium">
                {item?.valid ? (
                  <span className="text-emerald-600">
                    {item.nights} night{item.nights !== 1 ? "s" : ""}
                  </span>
                ) : stay.checkIn && stay.checkOut ? (
                  <span className="text-red-600">
                    Check-out must be after check-in
                  </span>
                ) : (
                  <span className="text-gray-400">Enter both dates</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-sm">
        <span className="text-blue-800">
          Nights:{" "}
          <span className="font-semibold">{summary.breakdown || "—"}</span>
        </span>
        <span className="text-blue-800">
          Total {cityLabel} Nights:{" "}
          <span className="font-bold">{summary.total}</span>
        </span>
      </div>
    </div>
  </div>
);

const CityStaySummary = ({ title, data }) => (
  <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
    <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
      <Building2 size={18} className="text-blue-600" /> {title}
    </h3>
    <div className="space-y-1.5 text-sm mb-4">
      <DetailRow
        label="Hotel"
        value={`${data.hotel.hotelName}${data.hotel.isCustom ? " (Custom)" : ""}`}
      />
      <DetailRow label="Persons" value={data.persons} />
      <DetailRow label="Total Check-ins" value={data.totalCheckIns} />
    </div>

    <div className="space-y-2 mb-4">
      {data.stays.map((s, idx) => (
        <div
          key={idx}
          className="flex flex-wrap justify-between items-center gap-2 text-sm bg-white rounded-lg border border-gray-200 px-3 py-2"
        >
          <span className="text-gray-600">
            Stay {idx + 1}: {formatDate(s.checkIn)} → {formatDate(s.checkOut)}
          </span>
          <span className="font-semibold text-gray-900">
            {s.valid ? `${s.nights} night${s.nights !== 1 ? "s" : ""}` : "—"}
          </span>
        </div>
      ))}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-brand-50 border border-brand-100 px-4 py-3">
      <span className="text-sm text-gray-700">
        Nights Breakdown:{" "}
        <span className="font-semibold">{data.breakdown}</span>
      </span>
      <span className="text-sm font-bold text-brand-700">
        Total {title.replace(" Hotel", "")} Nights: {data.totalNights}
      </span>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center gap-3">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-700">{value}</span>
  </div>
);

const ValidationBanner = ({ messages }) => (
  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
    <ul className="list-disc pl-4 space-y-0.5">
      {messages.map((msg, idx) => (
        <li key={idx}>{msg}</li>
      ))}
    </ul>
  </div>
);

export default ExplanatoryPackage;

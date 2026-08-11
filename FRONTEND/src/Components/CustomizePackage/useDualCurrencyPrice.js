import { useEffect, useRef, useState } from "react";

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// SAR -> PKR. Returns "" for empty/negative/non-numeric input or when the
// conversion rate itself isn't a usable positive number — never NaN/Infinity.
export const toPKR = (sarValue, rate) => {
  const n = Number(sarValue);
  if (sarValue === "" || sarValue == null || !Number.isFinite(n) || n < 0)
    return "";
  if (!(Number(rate) > 0)) return "";
  return String(round2(n * Number(rate)));
};

// PKR -> SAR. Same safety rules as toPKR, inverted.
export const toSAR = (pkrValue, rate) => {
  const n = Number(pkrValue);
  if (pkrValue === "" || pkrValue == null || !Number.isFinite(n) || n < 0)
    return "";
  if (!(Number(rate) > 0)) return "";
  return String(round2(n / Number(rate)));
};

// A two-way-bound SAR/PKR price pair. Editing either field sets it as the
// "source" currency and derives the other directly in the same event handler
// (no watcher on one field triggers a write to the other), so there is no
// SAR<->PKR conversion loop. `source` is only used to know which field to
// re-derive the other from when the conversion rate itself changes later —
// that effect only ever writes to the *derived* field, never the source one.
const useDualCurrencyPrice = (conversionRateNum) => {
  const [sar, setSarRaw] = useState("");
  const [pkr, setPkrRaw] = useState("");
  const [source, setSource] = useState("sar");

  const latestRef = useRef({ sar, pkr, source });
  latestRef.current = { sar, pkr, source };

  const setSar = (value) => {
    setSarRaw(value);
    setSource("sar");
    setPkrRaw(toPKR(value, conversionRateNum));
  };

  const setPkr = (value) => {
    setPkrRaw(value);
    setSource("pkr");
    setSarRaw(toSAR(value, conversionRateNum));
  };

  // Database prices are always authoritative in SAR; PKR is always derived.
  const setFromDatabase = (dbSarPrice) => {
    const value = dbSarPrice == null ? "" : String(dbSarPrice);
    setSarRaw(value);
    setSource("sar");
    setPkrRaw(toPKR(value, conversionRateNum));
  };

  const reset = () => {
    setSarRaw("");
    setPkrRaw("");
    setSource("sar");
  };

  // Recompute the derived currency whenever the conversion rate changes,
  // based on whichever field the user actually typed into. Reads via a ref
  // so this only re-runs on rate changes (not on every keystroke) while
  // still seeing the latest sar/pkr/source values.
  useEffect(() => {
    const { sar: curSar, pkr: curPkr, source: curSource } = latestRef.current;
    if (curSource === "pkr") {
      setSarRaw(toSAR(curPkr, conversionRateNum));
    } else {
      setPkrRaw(toPKR(curSar, conversionRateNum));
    }
  }, [conversionRateNum]);

  return { sar, pkr, setSar, setPkr, setFromDatabase, reset };
};

export default useDualCurrencyPrice;

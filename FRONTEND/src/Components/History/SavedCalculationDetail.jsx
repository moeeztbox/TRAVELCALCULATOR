import React from "react";
import { Building2, Car, FileText, Plane, Train, Package } from "lucide-react";
import { money, moneySAR, moneyPKR, formatTotal } from "../../utils/savedCalculationFormat";

// Pure, read-only renderer for one saved calculation's snapshot — used both
// inside the on-screen "View" modal and inside History's hidden print-only
// mount. Never mutates anything; the snapshot is displayed exactly as it
// was captured at Save time, regardless of what current master prices are.
const formatDate = (val) => {
  if (!val) return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 gap-4">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-right">
      {value === undefined || value === null || value === "" ? "—" : value}
    </span>
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-semibold text-gray-700 mb-2">{children}</h3>
);

const HotelDetail = ({ s }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div>
      <SectionTitle>Hotel Details</SectionTitle>
      <DetailRow label="Hotel Name" value={s.hotelName} />
      <DetailRow label="Category" value={s.category} />
      <DetailRow label="Room Type" value={s.roomType} />
      {s.address && <DetailRow label="Address" value={s.address} />}
      <DetailRow label="City" value={s.city} />
      <DetailRow label="Area" value={s.area} />
      {s.distance ? <DetailRow label="Distance" value={`${s.distance} m`} /> : null}
      <DetailRow label="Agent Name" value={s.agentName} />
    </div>
    <div>
      <SectionTitle>Stay &amp; Cost</SectionTitle>
      <DetailRow label="Check-in" value={s.checkIn} />
      <DetailRow label="Check-out" value={s.checkOut} />
      <DetailRow
        label="Total Nights"
        value={`${s.totalNights} night${s.totalNights !== 1 ? "s" : ""}`}
      />
      <DetailRow label="Price / Night" value={money(s.perNightPrice)} />
      <DetailRow label="Total Nights Price" value={money(s.totalNightsPrice)} />
      <DetailRow
        label="Total Final Cost"
        value={
          <span className="font-bold text-blue-700">
            {money(s.totalFinalCost)}
          </span>
        }
      />
    </div>
  </div>
);

const VisaDetail = ({ s }) => (
  <div className="space-y-4">
    {(s.breakdown || []).map((b) => (
      <div key={b.category} className="rounded-lg border border-gray-200 p-3">
        <SectionTitle>{b.category}</SectionTitle>
        <DetailRow label="Agent Name" value={b.agentName} />
        <DetailRow label="Passengers" value={b.count} />
        <DetailRow label="Price / Person" value={money(b.pricePerPerson)} />
        <DetailRow label="Visa Total" value={money(b.visaTotal)} />
        {b.hotelBRN && (
          <DetailRow
            label={`Hotel BRN (${b.count} × ${money(b.hotelBRNPrice)})`}
            value={money(b.hotelBRNTotal)}
          />
        )}
        {b.foodBRN && (
          <DetailRow
            label={`Food BRN (${b.count} × ${money(b.foodBRNPrice)})`}
            value={money(b.foodBRNTotal)}
          />
        )}
        <DetailRow
          label={`${b.category} Total`}
          value={
            <span className="font-bold text-blue-700">
              {money(b.categoryTotal)}
            </span>
          }
        />
      </div>
    ))}
    <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
      <span className="font-semibold text-gray-700">Total Final Cost</span>
      <span className="font-bold text-lg text-blue-700">
        {money(s.totalFinalCost)}
      </span>
    </div>
  </div>
);

const TransportDetail = ({ s }) => (
  <div>
    <DetailRow label="Car Type" value={s.carType} />
    <DetailRow label="Capacity" value={s.capacity} />
    <DetailRow label="Trip Type" value={s.tripType} />
    <DetailRow label="Route" value={s.route} />
    <DetailRow label="Agent Name" value={s.agentName} />
    <DetailRow label="Luggage" value={s.luggage} />
    <DetailRow label="Base Price" value={money(s.price)} />
    <DetailRow label="Final Price" value={money(s.finalPrice)} />
    <DetailRow
      label="Total Cost"
      value={
        <span className="font-bold text-blue-700">{money(s.totalCost)}</span>
      }
    />
  </div>
);

const FlightDetail = ({ s }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div>
      <SectionTitle>Flight Details</SectionTitle>
      <DetailRow label="Airline" value={s.airlineName} />
      <DetailRow label="Category" value={s.category} />
      <DetailRow label="Passenger" value={s.passenger} />
      <DetailRow label="Agent Name" value={s.agentName} />
    </div>
    <div>
      <SectionTitle>Baggage &amp; Validity</SectionTitle>
      <DetailRow label="Departure Luggage" value={s.departureLuggage} />
      <DetailRow label="Departure Bags" value={s.departureBags} />
      <DetailRow label="Arrival Luggage" value={s.arrivalLuggage} />
      <DetailRow label="Arrival Bags" value={s.arrivalBags} />
      <DetailRow label="Valid From" value={s.validFrom} />
      <DetailRow label="Valid To" value={s.validTo} />
    </div>
    <div className="lg:col-span-2 flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
      <span className="font-semibold text-gray-700">Total Cost</span>
      <span className="font-bold text-lg text-blue-700">
        {money(s.totalCost)}
      </span>
    </div>
  </div>
);

const TrainDetail = ({ s }) => (
  <div>
    <DetailRow label="Train Name" value={s.trainName} />
    <DetailRow label="Route" value={s.route} />
    <DetailRow label="Departure" value={s.departure} />
    <DetailRow label="Arrival" value={s.arrival} />
    <DetailRow label="Class" value={s.trainClass} />
    <DetailRow label="Agent Name" value={s.agentName} />
    <DetailRow label="Price" value={money(s.price)} />
    <DetailRow
      label="Total Cost"
      value={
        <span className="font-bold text-blue-700">{money(s.totalCost)}</span>
      }
    />
  </div>
);

// One Original/Selling/Profit row for a Customize Package service — mirrors
// NormalPackage.jsx's own on-screen breakdown, just read from the frozen
// snapshot instead of live state.
const ServiceRow = ({ label, service }) => {
  if (!service) return null;
  const isPKR = service.nativeCurrency === "PKR";
  const orig = isPKR ? moneyPKR(service.originalPKR) : moneySAR(service.originalSAR);
  const sell = isPKR ? moneyPKR(service.sellingPKR) : moneySAR(service.sellingSAR);
  const profit = isPKR
    ? moneyPKR(service.profitNative)
    : moneySAR(service.profitNative);

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="font-semibold text-gray-800 mb-1">
        {label}: {service.name}
        {service.isCustom ? " (Custom)" : ""}
      </p>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs uppercase">Original</p>
          <p className="font-medium">{orig}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase">Selling</p>
          <p className="font-medium">{sell}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase">Profit</p>
          <p
            className={`font-medium ${
              service.profitNative < 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {profit}
          </p>
        </div>
      </div>
    </div>
  );
};

const NormalPackageDetail = ({ s }) => (
  <div className="space-y-3">
    <DetailRow label="Total Days" value={s.totalDays} />
    <DetailRow
      label="Conversion Rate"
      value={`1 SAR = ${s.sellingConversionRate} PKR`}
    />
    <ServiceRow label="Makkah Hotel" service={s.makkahService} />
    <ServiceRow label="Madinah Hotel" service={s.madinahService} />
    <ServiceRow label="Visa" service={s.visaService} />
    <ServiceRow label="Flight" service={s.flightService} />
    <ServiceRow label="Transport" service={s.transportService} />
    <ServiceRow label="Train Ticket" service={s.trainTicketService} />
    {(s.miscServices || []).map((m, idx) => (
      <ServiceRow key={idx} label={`Misc ${idx + 1}`} service={m} />
    ))}
    {s.totals && (
      <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
        <DetailRow label="Total Passengers" value={s.totals.totalPassengers} />
        <DetailRow
          label="Original Total (per person)"
          value={`${moneySAR(s.totals.originalSAR)} | ${moneyPKR(
            s.totals.originalPKR
          )}`}
        />
        <DetailRow
          label="Selling Total (per person)"
          value={`${moneySAR(s.totals.sellingSAR)} | ${moneyPKR(
            s.totals.sellingPKR
          )}`}
        />
        <DetailRow
          label="Selling Total (all passengers, PKR)"
          value={
            <span className="font-bold text-lg text-blue-700">
              {moneyPKR(s.totals.sellingPKRAllPassengers)}
            </span>
          }
        />
      </div>
    )}
  </div>
);

const CityStayDetail = ({ title, data }) => {
  if (!data) return null;
  return (
    <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
      <SectionTitle>{title}</SectionTitle>
      <DetailRow
        label="Hotel"
        value={`${data.hotel?.hotelName || "—"}${
          data.hotel?.isCustom ? " (Custom)" : ""
        }`}
      />
      <DetailRow label="Persons" value={data.persons} />
      <DetailRow label="Total Check-ins" value={data.totalCheckIns} />
      <div className="mt-2 space-y-1">
        {(data.stays || []).map((st, idx) => (
          <div
            key={idx}
            className="flex justify-between text-sm bg-white rounded border border-gray-200 px-2 py-1"
          >
            <span>
              Stay {idx + 1}: {formatDate(st.checkIn)} → {formatDate(st.checkOut)}
            </span>
            <span className="font-medium">
              {st.valid ? `${st.nights} night${st.nights !== 1 ? "s" : ""}` : "—"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-sm font-semibold text-brand-700">
        <span>Breakdown: {data.breakdown || "—"}</span>
        <span>Total: {data.totalNights ?? 0} nights</span>
      </div>
    </div>
  );
};

const ExplanatoryPackageDetail = ({ s }) => (
  <div className="space-y-3">
    <DetailRow label="Package Check-in" value={formatDate(s.packageCheckIn)} />
    <DetailRow label="Package Check-out" value={formatDate(s.packageCheckOut)} />
    <DetailRow label="Total Days" value={s.totalDays} />
    <CityStayDetail title="Makkah Hotel" data={s.makkah} />
    <CityStayDetail title="Madinah Hotel" data={s.madinah} />
  </div>
);

const PackageDetail = ({ s }) =>
  s.packageKind === "explanatory" ? (
    <ExplanatoryPackageDetail s={s} />
  ) : (
    <NormalPackageDetail s={s} />
  );

const TYPE_META = {
  hotel: { label: "Hotel", icon: Building2, Detail: HotelDetail },
  transport: { label: "Transport", icon: Car, Detail: TransportDetail },
  visa: { label: "Visa", icon: FileText, Detail: VisaDetail },
  flight: { label: "Flight / Ticket", icon: Plane, Detail: FlightDetail },
  trainTicket: { label: "Train", icon: Train, Detail: TrainDetail },
  package: { label: "Customize Package", icon: Package, Detail: PackageDetail },
};

const SavedCalculationDetail = ({ record }) => {
  if (!record) return null;
  const meta = TYPE_META[record.type] || {
    label: record.type,
    icon: Package,
    Detail: () => null,
  };
  const Icon = meta.icon;
  const Detail = meta.Detail;
  const snapshot = record.snapshot || {};
  const total = formatTotal(record);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide flex items-center gap-1.5">
            <Icon size={14} /> {meta.label}
          </p>
          <h2 className="text-xl font-bold text-gray-900">{record.clientName}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ref: <span className="font-mono">{record.referenceNumber}</span> ·{" "}
            {formatDate(record.createdAt)}
          </p>
        </div>
        {total !== null && (
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase">Total</p>
            <p className="text-xl font-bold text-blue-700">{total}</p>
          </div>
        )}
      </div>
      <Detail s={snapshot} />
    </div>
  );
};

export default SavedCalculationDetail;

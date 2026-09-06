import React, { useMemo, useState } from "react";
import { Building2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import EmptyState from "../../../../UI/EmptyState";

// Known vehicle types → a local icon shown in the matrix header. Never
// fetched from the internet at render time — these are plain static files
// already stored under Frontend/public/images/transport/. A carType that
// isn't in this map (e.g. a brand-new one an admin just added) simply shows
// no image, exactly like "if available/possible".
const VEHICLE_IMAGES = {
  SEDAN: "/images/transport/sedan.svg",
  "GMC YUKON XL 25 MODEL": "/images/transport/gmc-yukon-xl.svg",
  STARIA: "/images/transport/staria.svg",
  HIACE: "/images/transport/hiace.svg",
  COASTER: "/images/transport/coaster.svg",
  "BUS 20 MODEL": "/images/transport/bus-20.svg",
  "BUS 25/26 MODEL": "/images/transport/bus-25-26.svg",
};

// "Show Routes" — a company-wise rate matrix built ENTIRELY from the
// existing Transport records already loaded by TransportList.jsx (the same
// `transports` array "Show All Lists" uses). Nothing is fetched from a
// second collection and nothing is duplicated: Routes, Vehicles/Car Types,
// Company Names, Rates, and Luggage are all simply the distinct values
// already present on those records, grouped into a spreadsheet-style view.
// Add/Edit/Delete stay exactly as they already are — clicking a cell just
// opens TransportList.jsx's own existing Add/Edit modal, pre-filled.
const TransportRoutesMatrix = ({ transports, isAdmin, onAddRate, onEditRate }) => {
  // Collapsed by default — only the company name shows until clicked. Pure
  // UI state (which company sections are open), never touches backend data.
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const toggleCompany = (company) =>
    setExpandedCompanies((prev) => ({ ...prev, [company]: !prev[company] }));

  const companies = useMemo(
    () =>
      [...new Set(transports.map((t) => (t.agentName || "").trim()).filter(Boolean))].sort(),
    [transports]
  );

  const routes = useMemo(
    () =>
      [...new Set(transports.map((t) => t.routeString || t.route).filter(Boolean))].sort(),
    [transports]
  );

  // One entry per distinct carType, carrying whichever capacity/luggage
  // its own existing records used (first one seen) — no separate vehicle
  // table.
  const vehicles = useMemo(() => {
    const seen = new Map();
    transports.forEach((t) => {
      if (!t.carType || seen.has(t.carType)) return;
      seen.set(t.carType, { name: t.carType, capacity: t.capacity, luggage: t.luggage });
    });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [transports]);

  // One rate per (company, route, vehicle) cell — prefers a oneway rate,
  // falling back to roundtrip if that's the only one on file for that
  // combination.
  const findRate = (company, routeName, vehicleName) => {
    const matches = transports.filter(
      (t) =>
        (t.agentName || "").trim() === company &&
        (t.routeString || t.route) === routeName &&
        t.carType === vehicleName
    );
    if (matches.length === 0) return null;
    return matches.find((t) => t.tripType === "oneway") || matches[0];
  };

  if (routes.length === 0 || vehicles.length === 0 || companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No transport data yet"
        message="Add a transport option from Show All Lists to see it grouped here by company."
      />
    );
  }

  return (
    <div className="space-y-6">
      {companies.map((company) => {
        const isOpen = !!expandedCompanies[company];
        return (
        <div key={company} className="table-card overflow-x-auto">
          <button
            type="button"
            onClick={() => toggleCompany(company)}
            className="w-full flex items-center gap-2 px-4 py-3 border-b border-hair bg-surface-2 cursor-pointer hover:bg-surface transition-colors text-left"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <ChevronDown size={16} className="text-muted shrink-0" />
            ) : (
              <ChevronRight size={16} className="text-muted shrink-0" />
            )}
            <Building2 size={16} className="text-brand-600 shrink-0" />
            <h3 className="text-sm font-bold text-ink">{company}</h3>
          </button>
          {isOpen && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Route</th>
                {vehicles.map((v) => (
                  <th key={v.name}>
                    <div className="flex flex-col items-start gap-1 py-1">
                      {VEHICLE_IMAGES[v.name] && (
                        <img
                          src={VEHICLE_IMAGES[v.name]}
                          alt={v.name}
                          className="w-14 h-8 object-contain"
                        />
                      )}
                      <span>{v.name}</span>
                      <span className="text-[11px] font-normal text-muted normal-case">
                        {v.luggage ?? "—"} KG
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route} className="border-b hover:bg-gray-50 transition">
                  <td className="py-2 px-4 font-medium">{route}</td>
                  {vehicles.map((v) => {
                    const rate = findRate(company, route, v.name);
                    return (
                      <td key={v.name} className="py-2 px-4">
                        {isAdmin ? (
                          <button
                            onClick={() =>
                              rate
                                ? onEditRate(rate)
                                : onAddRate({
                                    agentName: company,
                                    route,
                                    carType: v.name,
                                    capacity: v.capacity ?? "",
                                    luggage: v.luggage ?? "",
                                  })
                            }
                            className={`w-full text-left cursor-pointer rounded-lg px-2 py-1 transition-colors ${
                              rate ? "text-ink hover:bg-brand-50" : "text-soft hover:bg-surface-2"
                            }`}
                            title={rate ? "Edit rate" : "Add rate"}
                          >
                            {rate ? (
                              <>
                                {rate.price}
                                {rate.tripType === "roundtrip" && (
                                  <span className="text-[10px] text-muted ml-1">(RT)</span>
                                )}
                              </>
                            ) : (
                              <Plus size={14} className="text-soft" />
                            )}
                          </button>
                        ) : rate ? (
                          <>
                            {rate.price}
                            {rate.tripType === "roundtrip" && (
                              <span className="text-[10px] text-muted ml-1">(RT)</span>
                            )}
                          </>
                        ) : (
                          <span className="text-soft">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        );
      })}
    </div>
  );
};

export default TransportRoutesMatrix;

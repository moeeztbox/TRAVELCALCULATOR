import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Calendar,
  Moon,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  Navigation,
  Sparkles,
} from "lucide-react";
import Modal from "../Components/Main/Modal";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";

const API = "http://localhost:5000/api";

const money = (n) => `SAR ${Number(n || 0).toLocaleString()}`;

/**
 * User-facing Packages page (Dashboard → Packages).
 * Read-only: fetches from the same /api/packages collection the admin
 * manages under Listings → Packages, but presents it as browsable cards
 * instead of a management table. No add/edit/delete here.
 */
const PackagesView = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/packages`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setPackages(data.data);
        else setPackages([]);
      } catch (err) {
        console.error("Error fetching packages:", err);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const includedBadge = (label, included) => {
    const yes = included === "Yes";
    return (
      <span
        key={label}
        className={`flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 ${
          yes ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {yes ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
        {label}
      </span>
    );
  };

  return (
    <div>
      {/* HEADER */}
      <PageHeader
        title="Packages"
        subtitle="Explore all available Hajj & Umrah packages"
        icon={Package}
        onBack={() => navigate("/dashboard")}
        className="mb-8"
      />

      {/* CONTENT */}
      {loading ? (
        <div className="table-card py-16 text-center text-muted">
          Loading packages...
        </div>
      ) : packages.length === 0 ? (
        <div className="table-card">
          <EmptyState
            icon={Package}
            title="No packages available yet"
            message="Once packages are added, they'll appear here to explore."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card header */}
              <div className="relative px-5 pt-5 pb-4 bg-linear-to-br from-brand-600 to-brand-500 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold bg-white/20 rounded-full px-2.5 py-1">
                    {pkg.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-3 leading-snug">
                  {pkg.packageName}
                </h3>
                <div className="flex items-center gap-3 text-brand-100 text-xs mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {pkg.totalDays} Days
                  </span>
                  <span className="flex items-center gap-1">
                    <Moon size={14} /> {pkg.totalNights} Nights
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 py-4 flex-1 flex flex-col gap-3 text-sm">
                <span className="text-2xl font-extrabold text-gray-900">
                  {money(pkg.price)}
                </span>

                <div className="space-y-1.5 text-gray-600">
                  <div className="flex items-start gap-1.5">
                    <Building2
                      size={14}
                      className="text-brand-600 mt-0.5 shrink-0"
                    />
                    <span>
                      <span className="font-medium text-gray-800">
                        Makkah:
                      </span>{" "}
                      {pkg.makkahHotelName || "-"}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Building2
                      size={14}
                      className="text-brand-600 mt-0.5 shrink-0"
                    />
                    <span>
                      <span className="font-medium text-gray-800">
                        Madinah:
                      </span>{" "}
                      {pkg.madinahHotelName || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {includedBadge("Visa", pkg.visaIncluded)}
                  {includedBadge("Flight", pkg.flightIncluded)}
                  {includedBadge("Transport", pkg.transportIncluded)}
                </div>

                {pkg.description && (
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mt-1">
                    {pkg.description}
                  </p>
                )}

                <button
                  onClick={() => setSelectedPackage(pkg)}
                  className="mt-auto pt-3 w-full bg-brand-600 text-white font-semibold py-2.5 rounded-lg hover:bg-brand-700 transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      <Modal
        open={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        title={selectedPackage?.packageName || "Package Details"}
        icon={<Package size={20} className="text-brand-600" />}
        maxWidth="max-w-2xl"
      >
        {selectedPackage && (
          <div className="space-y-6">
            {/* Hero summary */}
            <div className="rounded-xl bg-linear-to-br from-brand-600 to-brand-500 text-white p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold bg-white/20 rounded-full px-2.5 py-1">
                  {selectedPackage.category}
                </span>
                <p className="text-2xl font-extrabold mt-2">
                  {money(selectedPackage.price)}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} /> {selectedPackage.totalDays} Days
                </span>
                <span className="flex items-center gap-1.5">
                  <Moon size={16} /> {selectedPackage.totalNights} Nights
                </span>
              </div>
            </div>

            {/* Hotels */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                <Building2 size={16} className="text-brand-600" />
                Hotel Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Makkah
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedPackage.makkahHotelName || "Not specified"}
                  </p>
                  {selectedPackage.makkahDistance && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Navigation size={12} />
                      {selectedPackage.makkahDistance} from Haram
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Madinah
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedPackage.madinahHotelName || "Not specified"}
                  </p>
                  {selectedPackage.madinahDistance && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Navigation size={12} />
                      {selectedPackage.madinahDistance} from Masjid-e-Nabawi
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Package details */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3">
                Package Includes
              </h4>
              <div className="flex flex-wrap gap-2">
                {includedBadge("Visa", selectedPackage.visaIncluded)}
                {includedBadge("Flight", selectedPackage.flightIncluded)}
                {includedBadge("Transport", selectedPackage.transportIncluded)}
              </div>
            </div>

            {/* Ziyarat */}
            {selectedPackage.ziyarat && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                  <MapPin size={16} className="text-brand-600" />
                  Ziyarat
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedPackage.ziyarat}
                </p>
              </div>
            )}

            {/* Description */}
            {selectedPackage.description && (
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                  <Sparkles size={16} className="text-brand-600" />
                  Description
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedPackage.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PackagesView;

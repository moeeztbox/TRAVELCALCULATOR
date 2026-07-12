import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  Users,
  Building2,
  ListChecks,
  FileText,
  Calendar,
  Moon,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../../Main/Modal";
import {
  Field,
  inputClass,
  SectionTitle,
  ModalActions,
} from "../../../../Main/FormControls";
import { useAuth } from "../../../../../context/AuthContext";

const emptyPackage = {
  packageName: "",
  category: "",
  price: "",
  totalDays: "",
  totalNights: "",
  agentName: "",
  agentCost: "",
  companyCost: "",
  makkahHotelName: "",
  makkahDistance: "",
  madinahHotelName: "",
  madinahDistance: "",
  visaIncluded: "No",
  flightIncluded: "No",
  transportIncluded: "No",
  ziyarat: "",
  description: "",
};

const categories = ["Economy", "Standard", "Premium", "VIP", "Luxury"];

const PackageList = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newPackage, setNewPackage] = useState(emptyPackage);
  const [editPackage, setEditPackage] = useState({ ...emptyPackage, _id: "" });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/packages");
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

  const savePackage = async () => {
    if (
      !newPackage.packageName ||
      !newPackage.category ||
      !newPackage.price ||
      !newPackage.totalDays ||
      !newPackage.totalNights
    ) {
      alert("Please fill all required fields (Name, Category, Price, Days, Nights)");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPackage),
      });
      const data = await res.json();
      if (data.success) {
        alert("Package added successfully!");
        setShowAddModal(false);
        setNewPackage(emptyPackage);
        fetchPackages();
      } else {
        alert(data.message || "Error adding package");
      }
    } catch (err) {
      console.error("Error adding package:", err);
      alert("Error adding package");
    }
  };

  const deletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/packages/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) fetchPackages();
      else alert(data.message || "Error deleting package");
    } catch (err) {
      console.error("Error deleting package:", err);
      alert("Error deleting package");
    }
  };

  const openEditModal = (pkg) => {
    setEditPackage({ ...emptyPackage, ...pkg });
    setShowEditModal(true);
  };

  const updatePackage = async () => {
    if (
      !editPackage.packageName ||
      !editPackage.category ||
      !editPackage.price ||
      !editPackage.totalDays ||
      !editPackage.totalNights
    ) {
      alert("Please fill all required fields (Name, Category, Price, Days, Nights)");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/packages/${editPackage._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editPackage),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Package updated successfully!");
        setShowEditModal(false);
        fetchPackages();
      } else {
        alert(data.message || "Error updating package");
      }
    } catch (err) {
      console.error("Error updating package:", err);
      alert("Error updating package");
    }
  };

  const handleBack = () => navigate("/dashboard/listings");

  const { isAdmin } = useAuth();

  // PRINT FUNCTION - Hide navbar during print
  const handlePrint = () => {
    const navElements = document.querySelectorAll(
      'nav, header, [role="navigation"]'
    );
    navElements.forEach((el) => {
      el.style.display = "none";
    });

    window.print();

    setTimeout(() => {
      navElements.forEach((el) => {
        el.style.display = "";
      });
    }, 100);
  };

  const filteredPackages = packages.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.packageName?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  // Shared field set for both Add and Edit modals
  const renderPackageFields = (data, setData) => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <SectionTitle icon={<Package size={16} className="text-red-600" />}>
          Basic Information
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Package Name" required className="sm:col-span-2">
            <input
              type="text"
              placeholder="e.g. 14-Day Umrah Deluxe"
              value={data.packageName}
              onChange={(e) => setData({ ...data, packageName: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Category" required>
            <select
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Package Price" required>
            <input
              type="number"
              placeholder="0"
              value={data.price}
              onChange={(e) => setData({ ...data, price: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Total Days" required>
            <input
              type="number"
              placeholder="e.g. 14"
              value={data.totalDays}
              onChange={(e) => setData({ ...data, totalDays: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Total Nights" required>
            <input
              type="number"
              placeholder="e.g. 13"
              value={data.totalNights}
              onChange={(e) => setData({ ...data, totalNights: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Agent Information */}
      <div>
        <SectionTitle icon={<Users size={16} className="text-red-600" />}>
          Agent Information
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Agent Name">
            <input
              type="text"
              placeholder="Agent name"
              value={data.agentName}
              onChange={(e) => setData({ ...data, agentName: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Agent Cost">
            <input
              type="number"
              placeholder="0"
              value={data.agentCost}
              onChange={(e) => setData({ ...data, agentCost: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Company Cost">
            <input
              type="number"
              placeholder="0"
              value={data.companyCost}
              onChange={(e) =>
                setData({ ...data, companyCost: e.target.value })
              }
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Hotel Details */}
      <div>
        <SectionTitle icon={<Building2 size={16} className="text-red-600" />}>
          Hotel Details
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Makkah */}
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Makkah
            </p>
            <div className="space-y-3">
              <Field label="Hotel Name">
                <input
                  type="text"
                  placeholder="Makkah hotel"
                  value={data.makkahHotelName}
                  onChange={(e) =>
                    setData({ ...data, makkahHotelName: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Distance from Haram">
                <input
                  type="text"
                  placeholder="e.g. 300m"
                  value={data.makkahDistance}
                  onChange={(e) =>
                    setData({ ...data, makkahDistance: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {/* Madinah */}
          <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
              Madinah
            </p>
            <div className="space-y-3">
              <Field label="Hotel Name">
                <input
                  type="text"
                  placeholder="Madinah hotel"
                  value={data.madinahHotelName}
                  onChange={(e) =>
                    setData({ ...data, madinahHotelName: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Distance from Masjid-e-Nabawi">
                <input
                  type="text"
                  placeholder="e.g. 200m"
                  value={data.madinahDistance}
                  onChange={(e) =>
                    setData({ ...data, madinahDistance: e.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* Package Details */}
      <div>
        <SectionTitle icon={<ListChecks size={16} className="text-red-600" />}>
          Package Details
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Visa Included">
            <select
              value={data.visaIncluded}
              onChange={(e) =>
                setData({ ...data, visaIncluded: e.target.value })
              }
              className={inputClass}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </Field>

          <Field label="Flight Included">
            <select
              value={data.flightIncluded}
              onChange={(e) =>
                setData({ ...data, flightIncluded: e.target.value })
              }
              className={inputClass}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </Field>

          <Field label="Transport Included">
            <select
              value={data.transportIncluded}
              onChange={(e) =>
                setData({ ...data, transportIncluded: e.target.value })
              }
              className={inputClass}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Ziyarat */}
      <div>
        <SectionTitle>Ziyarat</SectionTitle>
        <Field label="Ziyarat">
          <input
            type="text"
            placeholder="Included / Not Included / custom text"
            value={data.ziyarat}
            onChange={(e) => setData({ ...data, ziyarat: e.target.value })}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Description */}
      <div>
        <SectionTitle icon={<FileText size={16} className="text-red-600" />}>
          Description
        </SectionTitle>
        <Field label="Package Description">
          <textarea
            rows={4}
            placeholder="Describe what this package includes..."
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className={`${inputClass} resize-none`}
          />
        </Field>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-8 py-6 w-full">
      {/* PRINT CSS */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            nav, header, [role="navigation"] { display: none !important; }
            body {
              -webkit-print-color-adjust: exact;
              margin: 0; padding: 0; background: white !important;
            }
            .print\\:hidden { display: none !important; }
            .print\\:block { display: block !important; }
            * { background: white !important; box-shadow: none !important; }
            .rounded-xl, .rounded-lg, .rounded, .rounded-2xl { border-radius: 0 !important; }
            .package-grid {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 12px !important;
            }
            .package-card {
              border: 1px solid #000 !important;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            footer { display: none !important; }
            .footer, [class*="footer"], [class*="copyright"] { display: none !important; }
            .print-header {
              text-align: center; margin-bottom: 20px;
              font-size: 24px; font-weight: bold;
            }
          }
        `}
      </style>

      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="no-print flex items-center cursor-pointer gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 no-print">
        <h1 className="text-3xl font-extrabold text-gray-900">Packages List</h1>

        <div className="flex flex-wrap gap-2 items-center">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          {/* PRINT BUTTON */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition cursor-pointer no-print"
          >
            Print
          </button>

          {/* ADD BUTTON (ADMIN) */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex cursor-pointer items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition no-print"
            >
              <Plus size={20} />
              Add
            </button>
          )}
        </div>
      </div>

      {/* PRINTABLE AREA */}
      <div id="print-area">
        <h1 className="print-header print:block hidden">Packages List</h1>

        {loading ? (
          <div className="bg-white shadow-md rounded-xl mt-6 py-10 text-center text-gray-500">
            Loading...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="bg-white shadow-md rounded-xl mt-6 py-10 text-center text-gray-500">
            No packages found.
          </div>
        ) : (
          <div className="package-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg._id}
                className="package-card bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden"
              >
                {/* Card header */}
                <div className="px-5 pt-5 pb-4 border-b border-gray-100 bg-linear-to-br from-red-50 to-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <Package className="text-red-700 w-6 h-6" />
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-3 no-print">
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => deletePackage(pkg._id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mt-3 leading-snug">
                    {pkg.packageName}
                  </h3>
                  <span className="inline-block mt-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full px-2.5 py-0.5">
                    {pkg.category}
                  </span>
                </div>

                {/* Card body */}
                <div className="px-5 py-4 flex-1 flex flex-col gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {Number(pkg.price || 0).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-3 text-gray-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {pkg.totalDays} Days
                      </span>
                      <span className="flex items-center gap-1">
                        <Moon size={14} /> {pkg.totalNights} Nights
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-gray-600">
                    <div className="flex items-start gap-1.5">
                      <Building2
                        size={14}
                        className="text-blue-600 mt-0.5 shrink-0"
                      />
                      <span>
                        <span className="font-medium text-gray-800">Makkah:</span>{" "}
                        {pkg.makkahHotelName || "-"}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Building2
                        size={14}
                        className="text-blue-600 mt-0.5 shrink-0"
                      />
                      <span>
                        <span className="font-medium text-gray-800">
                          Madinah:
                        </span>{" "}
                        {pkg.madinahHotelName || "-"}
                      </span>
                    </div>
                    {pkg.ziyarat && (
                      <div className="flex items-start gap-1.5">
                        <MapPin
                          size={14}
                          className="text-blue-600 mt-0.5 shrink-0"
                        />
                        <span>
                          <span className="font-medium text-gray-800">
                            Ziyarat:
                          </span>{" "}
                          {pkg.ziyarat}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Included badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      ["Visa", pkg.visaIncluded],
                      ["Flight", pkg.flightIncluded],
                      ["Transport", pkg.transportIncluded],
                    ].map(([label, included]) => {
                      const yes = included === "Yes";
                      return (
                        <span
                          key={label}
                          className={`flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 ${
                            yes
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {yes ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <XCircle size={13} />
                          )}
                          {label}
                        </span>
                      );
                    })}
                  </div>

                  {pkg.description && (
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mt-1">
                      {pkg.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD PACKAGE MODAL */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Package"
        icon={<Package size={20} className="text-red-600" />}
        maxWidth="max-w-3xl"
        footer={
          <ModalActions
            onCancel={() => setShowAddModal(false)}
            onSubmit={savePackage}
            submitLabel="Save Package"
            submitColor="green"
          />
        }
      >
        {renderPackageFields(newPackage, setNewPackage)}
      </Modal>

      {/* EDIT PACKAGE MODAL */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Package"
        icon={<Package size={20} className="text-red-600" />}
        maxWidth="max-w-3xl"
        footer={
          <ModalActions
            onCancel={() => setShowEditModal(false)}
            onSubmit={updatePackage}
            submitLabel="Update Package"
            submitColor="blue"
          />
        }
      >
        {renderPackageFields(editPackage, setEditPackage)}
      </Modal>
    </div>
  );
};

export default PackageList;

import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Package,
  Users,
  Building2,
  ListChecks,
  FileText,
  Printer,
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
import PageHeader from "../../../../UI/PageHeader";
import Button from "../../../../UI/Button";
import SearchInput from "../../../../UI/SearchInput";
import { useAuth } from "../../../../../context/AuthContext";
import { toUpper } from "../../../../../utils/text";
import { API_BASE_URL } from "../../../../../config/api";

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
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPackage, setViewPackage] = useState(null);

  const [newPackage, setNewPackage] = useState(emptyPackage);
  const [editPackage, setEditPackage] = useState({ ...emptyPackage, _id: "" });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/packages`, {
        credentials: "include",
      });
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
      const res = await fetch(`${API_BASE_URL}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
      const res = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) fetchPackages();
      else alert(data.message || "Error deleting package");
    } catch (err) {
      console.error("Error deleting package:", err);
      alert("Error deleting package");
    }
  };

  const openViewModal = (pkg) => {
    setViewPackage(pkg);
    setShowViewModal(true);
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
        `${API_BASE_URL}/packages/${editPackage._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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

  // Shared field set for both Add and Edit modals
  const renderPackageFields = (data, setData) => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <SectionTitle icon={<Package size={16} className="text-brand-600" />}>
          Basic Information
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Package Name" required className="sm:col-span-2">
            <input
              type="text"
              placeholder="e.g. 14-Day Umrah Deluxe"
              value={data.packageName}
              onChange={(e) =>
                setData({ ...data, packageName: toUpper(e.target.value) })
              }
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
        <SectionTitle icon={<Users size={16} className="text-brand-600" />}>
          Agent Information
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Agent Name">
            <input
              type="text"
              placeholder="Agent name"
              value={data.agentName}
              onChange={(e) =>
                setData({ ...data, agentName: toUpper(e.target.value) })
              }
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
        <SectionTitle icon={<Building2 size={16} className="text-brand-600" />}>
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
                    setData({
                      ...data,
                      makkahHotelName: toUpper(e.target.value),
                    })
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
                    setData({
                      ...data,
                      makkahDistance: toUpper(e.target.value),
                    })
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
                    setData({
                      ...data,
                      madinahHotelName: toUpper(e.target.value),
                    })
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
                    setData({
                      ...data,
                      madinahDistance: toUpper(e.target.value),
                    })
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
        <SectionTitle icon={<ListChecks size={16} className="text-brand-600" />}>
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
            onChange={(e) =>
              setData({ ...data, ziyarat: toUpper(e.target.value) })
            }
            className={inputClass}
          />
        </Field>
      </div>

      {/* Description */}
      <div>
        <SectionTitle icon={<FileText size={16} className="text-brand-600" />}>
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
    <div className="w-full">
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
            .print-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000 !important;
            }
            .print-table th,
            .print-table td {
              border: 1px solid #000 !important;
              padding: 12px 8px !important;
              background: white !important;
              font-size: 12px;
              vertical-align: middle;
              text-align: left;
            }
            .print-table th {
              background: white !important;
              font-weight: bold;
              border-bottom: 2px solid #000 !important;
            }
            .print-table tr {
              border-bottom: 1px solid #000 !important;
              page-break-inside: avoid;
              page-break-after: auto;
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

      {/* HEADER */}
      <div className="no-print mb-8">
        <PageHeader
          title="Packages"
          subtitle="Hajj & Umrah package catalogue"
          icon={Package}
          onBack={handleBack}
          actions={
            <>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search packages..."
                className="w-full sm:w-auto"
              />
              <Button variant="secondary" icon={Printer} onClick={handlePrint}>
                Print
              </Button>
              {isAdmin && (
                <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                  Add Package
                </Button>
              )}
            </>
          }
        />
      </div>

      {/* PRINTABLE AREA */}
      <div id="print-area">
        <h1 className="print-header print:block hidden">Packages List</h1>

        <div className="table-card mt-2 print:shadow-none print:rounded-none print:border-0">
          <table className="data-table print-table">
            <thead>
              <tr>
                <th>Package Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Days</th>
                <th>Nights</th>
                <th>Makkah Hotel</th>
                <th>Madinah Hotel</th>
                <th>Included</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
                    No packages found.
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr
                    key={pkg._id}
                    className="border-b hover:bg-gray-50 transition print:hover:bg-white"
                  >
                    <td className="py-3 px-4">{pkg.packageName}</td>
                    <td className="py-3 px-4">{pkg.category}</td>
                    <td className="py-3 px-4">
                      {Number(pkg.price || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{pkg.totalDays}</td>
                    <td className="py-3 px-4">{pkg.totalNights}</td>
                    <td className="py-3 px-4">{pkg.makkahHotelName || "-"}</td>
                    <td className="py-3 px-4">{pkg.madinahHotelName || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {includedBadge("Visa", pkg.visaIncluded)}
                        {includedBadge("Flight", pkg.flightIncluded)}
                        {includedBadge("Transport", pkg.transportIncluded)}
                      </div>
                    </td>
                    <td className="py-3 px-4 flex items-center gap-4 no-print">
                      <button
                        className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        onClick={() => openViewModal(pkg)}
                      >
                        <Eye size={20} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => openEditModal(pkg)}
                          >
                            <Pencil size={20} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            onClick={() => deletePackage(pkg._id)}
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Package Details"
        icon={<Eye size={20} className="text-brand-600" />}
        maxWidth="max-w-2xl"
        footer={
          <ModalActions
            onCancel={() => setShowViewModal(false)}
            onSubmit={() => setShowViewModal(false)}
            submitLabel="Close"
          />
        }
      >
        {viewPackage && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-lg font-bold text-ink">
                {viewPackage.packageName}
              </h3>
              <span className="inline-block mt-1 text-xs font-semibold text-gold-600 bg-gold-100 rounded-full px-2.5 py-0.5">
                {viewPackage.category}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted">Price</p>
                <p className="font-semibold">
                  {Number(viewPackage.price || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Days</p>
                <p className="font-semibold">{viewPackage.totalDays}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Total Nights</p>
                <p className="font-semibold">{viewPackage.totalNights}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted">Makkah Hotel</p>
                <p className="font-medium">
                  {viewPackage.makkahHotelName || "-"}
                  {viewPackage.makkahDistance
                    ? ` (${viewPackage.makkahDistance})`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Madinah Hotel</p>
                <p className="font-medium">
                  {viewPackage.madinahHotelName || "-"}
                  {viewPackage.madinahDistance
                    ? ` (${viewPackage.madinahDistance})`
                    : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {includedBadge("Visa", viewPackage.visaIncluded)}
              {includedBadge("Flight", viewPackage.flightIncluded)}
              {includedBadge("Transport", viewPackage.transportIncluded)}
            </div>
            {viewPackage.ziyarat && (
              <div>
                <p className="text-xs text-muted">Ziyarat</p>
                <p className="font-medium">{viewPackage.ziyarat}</p>
              </div>
            )}
            {viewPackage.description && (
              <div>
                <p className="text-xs text-muted">Description</p>
                <p className="text-gray-600 leading-relaxed">
                  {viewPackage.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ADD PACKAGE MODAL */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Package"
        icon={<Package size={20} className="text-brand-600" />}
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
        icon={<Package size={20} className="text-brand-600" />}
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

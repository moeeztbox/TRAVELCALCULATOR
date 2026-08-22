import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History as HistoryIcon,
  Pencil,
  Trash2,
  Building2,
  Car,
  FileText,
  Plane,
  Train,
  Package,
  Eye,
  Printer,
} from "lucide-react";
import PageHeader from "../Components/UI/PageHeader";
import EmptyState from "../Components/UI/EmptyState";
import Modal from "../Components/Main/Modal";
import Button from "../Components/UI/Button";
import { Field, inputClass, ModalActions } from "../Components/Main/FormControls";
import SavedCalculationDetail from "../Components/History/SavedCalculationDetail";
import PrintReportShell from "../Components/UI/PrintReportShell";
import { useAuth } from "../context/AuthContext";
import { toUpper } from "../utils/text";
import {
  fetchSavedCalculations,
  updateSavedCalculation,
  deleteSavedCalculation,
} from "../utils/savedCalculations";

// One reusable history system shared by every calculator (Hotel, Transport,
// Visa, Flight, Train Ticket, Customize Package) — each is just a different
// `type` on the same SavedCalculation collection, so a category here is
// purely a client-side filter, not a separate data source.
const CATEGORIES = [
  { type: "hotel", label: "Hotels", icon: Building2 },
  { type: "transport", label: "Transport", icon: Car },
  { type: "visa", label: "Visa", icon: FileText },
  { type: "flight", label: "Flights", icon: Plane },
  { type: "trainTicket", label: "Train Tickets", icon: Train },
  { type: "package", label: "Customize Packages", icon: Package },
];

// What the "Type" column shows — always uppercase, regardless of the
// internal `type` value each calculator saves under.
const TYPE_LABELS = {
  hotel: "HOTEL",
  transport: "TRANSPORT",
  visa: "VISA",
  flight: "FLIGHT",
  trainTicket: "TRAIN",
  package: "CUSTOMIZE PACKAGE",
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const History = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [activeType, setActiveType] = useState("hotel");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [editClientName, setEditClientName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Read-only detail view, opened by clicking a row's Client Name or View.
  const [viewRecord, setViewRecord] = useState(null);

  // Drives a single hidden, print-only mount (below) — either one record's
  // full detail (View's own Print button) or the whole currently-displayed
  // list as a table (the page-level Print button). Modal.jsx marks its own
  // wrapper `no-print`, so printing while the View modal is open would
  // print nothing from inside it; a dedicated print-only mount (same
  // convention as every calculator's own print report) is what actually
  // goes to the printer either way. Wrapped in a fresh object on every
  // trigger (not just the payload) so triggering the same print twice in a
  // row still re-fires the effect — two identical clicks would otherwise
  // share one object reference and never re-trigger.
  const [printJob, setPrintJob] = useState(null);
  const triggerRecordPrint = (record) =>
    setPrintJob({ mode: "record", record, at: Date.now() });
  const triggerListPrint = () => setPrintJob({ mode: "list", at: Date.now() });

  useEffect(() => {
    if (!printJob) return;
    const timer = setTimeout(() => window.print(), 50);
    return () => clearTimeout(timer);
  }, [printJob]);

  const activeCategory = CATEGORIES.find((c) => c.type === activeType);
  // Every calculator (including Customize Package, since it now has its own
  // Client Name field) saves the actual client's name into this column —
  // the package's own title/name lives in the snapshot instead.
  const nameLabel = "Client Name";

  const loadRecords = async (type) => {
    try {
      setLoading(true);
      const data = await fetchSavedCalculations(type);
      if (data.success && Array.isArray(data.data)) setRecords(data.data);
      else setRecords([]);
    } catch (err) {
      console.error("Error fetching history:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords(activeType);
  }, [activeType]);

  const openEditModal = (record) => {
    setEditRecord(record);
    setEditClientName(record.clientName);
    setShowEditModal(true);
  };

  // Only Client Name is editable here — prices, calculations, package
  // details, the reference number, and the type are all permanent once
  // saved, so this never sends anything else to the API.
  const handleEditSave = async () => {
    if (!editClientName.trim()) {
      alert(`Please enter a ${nameLabel.toLowerCase()}.`);
      return;
    }
    setSavingEdit(true);
    try {
      const data = await updateSavedCalculation(editRecord._id, {
        clientName: editClientName.trim(),
      });
      if (data.success) {
        setShowEditModal(false);
        loadRecords(activeType);
      } else {
        alert(data.message || "Error updating record");
      }
    } catch (err) {
      console.error("Error updating record:", err);
      alert("Error updating record");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this saved calculation? This cannot be undone.")) return;
    try {
      const data = await deleteSavedCalculation(id);
      if (data.success) loadRecords(activeType);
      else alert(data.message || "Error deleting record");
    } catch (err) {
      console.error("Error deleting record:", err);
      alert("Error deleting record");
    }
  };

  const colSpan = 4 + 1 + (isAdmin ? 2 : 0); // Reference/Client/Type/Date + View + (Edit/Delete)

  return (
    <div className="w-full">
      {/* Print-only mount — hidden on screen, forced visible via this
          page-scoped rule when the page-level Print (or the View modal's
          own Print) fires. Same convention as HotelForm.jsx's
          #hotel-print-report. */}
      <style>
        {`
          @media print {
            #history-print-report { display: block !important; }
          }
          #history-print-report { display: none; }
        `}
      </style>

      <div className="no-print">
        <div className="mb-6">
          <PageHeader
            title="Saved History"
            subtitle="Every saved calculation, across every calculator"
            icon={HistoryIcon}
            onBack={() => navigate("/dashboard")}
            actions={
              <Button
                variant="secondary"
                icon={Printer}
                onClick={triggerListPrint}
                disabled={records.length === 0}
              >
                Print
              </Button>
            }
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.type}
              type="button"
              onClick={() => setActiveType(c.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                activeType === c.type
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-surface-2 text-muted border-hair hover:border-brand-300"
              }`}
            >
              <c.icon size={16} />
              {c.label}
            </button>
          ))}
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference Number</th>
                <th>{nameLabel}</th>
                <th>Type</th>
                <th>Date</th>
                <th>View</th>
                {isAdmin && (
                  <>
                    <th>Edit</th>
                    <th>Delete</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="py-4 px-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="p-0">
                    <EmptyState
                      icon={activeCategory.icon}
                      title={`No saved ${activeCategory.label.toLowerCase()}`}
                      message="Calculations you save from the calculator will appear here."
                    />
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-mono text-sm">{r.referenceNumber}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setViewRecord(r)}
                        className="text-brand-700 hover:text-brand-900 font-medium hover:underline cursor-pointer"
                      >
                        {r.clientName}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-semibold text-xs tracking-wide text-gray-600">
                      {TYPE_LABELS[r.type] || r.type}
                    </td>
                    <td className="py-3 px-4">{formatDate(r.createdAt)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setViewRecord(r)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                    {isAdmin && (
                      <>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => openEditModal(r)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL — corrects the Client/Package name only. Prices,
          calculations, package details, the reference number, and the
          type are all permanent once saved (enforced server-side too). */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Saved Record"
        icon={<Pencil size={20} className="text-blue-600" />}
        maxWidth="max-w-md"
        footer={
          <ModalActions
            onCancel={() => setShowEditModal(false)}
            onSubmit={handleEditSave}
            submitLabel={savingEdit ? "Saving..." : "Save Changes"}
            submitColor="blue"
          />
        }
      >
        <div className="space-y-4">
          <Field label={nameLabel} required>
            <input
              type="text"
              value={editClientName}
              onChange={(e) => setEditClientName(toUpper(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
      </Modal>

      {/* VIEW MODAL — read-only, shows the saved snapshot exactly as
          captured at Save time (never live/re-derived data). */}
      <Modal
        open={!!viewRecord}
        onClose={() => setViewRecord(null)}
        title="Saved Calculation"
        icon={<Eye size={20} className="text-blue-600" />}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setViewRecord(null)}>
              Close
            </Button>
            <Button
              variant="success"
              icon={Printer}
              onClick={() => triggerRecordPrint(viewRecord)}
            >
              Print
            </Button>
          </div>
        }
      >
        <SavedCalculationDetail record={viewRecord} />
      </Modal>

      {/* Hidden print-only mount — shows whichever job was last triggered
          (one record's full detail, or the whole currently-displayed list
          as a table), kept outside the Modal (which is always `no-print`)
          so printing works regardless of whether View is open. */}
      <div id="history-print-report">
        {printJob?.mode === "record" && (
          <SavedCalculationDetail record={printJob.record} />
        )}
        {printJob?.mode === "list" && (
          <PrintReportShell reportTitle={`Saved History — ${activeCategory.label}`}>
            <table className="print-report-table">
              <thead>
                <tr>
                  <th>Reference Number</th>
                  <th>{nameLabel}</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.referenceNumber}</td>
                    <td>{r.clientName}</td>
                    <td>{TYPE_LABELS[r.type] || r.type}</td>
                    <td>{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PrintReportShell>
        )}
      </div>
    </div>
  );
};

export default History;

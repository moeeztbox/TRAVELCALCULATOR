import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, FileText, Printer } from "lucide-react";
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
import { useAuth } from "../../../../../context/AuthContext";
import { toUpper } from "../../../../../utils/text";
import { API_BASE_URL } from "../../../../../config/api";

const emptyVisa = {
  category: "",
  agentName: "",
  price: "",
  hotelBRN: false,
  hotelBRNPrice: "",
  foodBRN: false,
  foodBRNPrice: "",
};

const VisaList = () => {
  const navigate = useNavigate();
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newVisa, setNewVisa] = useState({ ...emptyVisa });
  const [editVisa, setEditVisa] = useState({ _id: "", ...emptyVisa });

  useEffect(() => {
    fetchVisas();
  }, []);

  const fetchVisas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/visas`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setVisas(data.data);
      else setVisas([]);
    } catch (err) {
      console.error("Error fetching visas:", err);
      setVisas([]);
    } finally {
      setLoading(false);
    }
  };

  // Builds the request payload, normalizing so an unchecked BRN never sends
  // a stale/leftover price value.
  const buildPayload = (data) => ({
    category: data.category,
    agentName: data.agentName,
    price: data.price,
    hotelBRN: !!data.hotelBRN,
    hotelBRNPrice: data.hotelBRN ? data.hotelBRNPrice : null,
    foodBRN: !!data.foodBRN,
    foodBRNPrice: data.foodBRN ? data.foodBRNPrice : null,
  });

  const saveVisa = async () => {
    if (
      !newVisa.category ||
      !newVisa.agentName ||
      !newVisa.price ||
      (newVisa.hotelBRN && !newVisa.hotelBRNPrice) ||
      (newVisa.foodBRN && !newVisa.foodBRNPrice)
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/visas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildPayload(newVisa)),
      });
      const data = await res.json();
      if (data.success) {
        alert("Visa added successfully!");
        setShowAddModal(false);
        setNewVisa({ ...emptyVisa });
        fetchVisas();
      } else {
        alert(data.message || "Error adding visa");
      }
    } catch (err) {
      console.error("Error adding visa:", err);
      alert("Error adding visa");
    }
  };

  const deleteVisa = async (id) => {
    if (!window.confirm("Are you sure you want to delete this visa?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/visas/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) fetchVisas();
      else alert(data.message || "Error deleting visa");
    } catch (err) {
      console.error("Error deleting visa:", err);
      alert("Error deleting visa");
    }
  };

  const openEditModal = (visa) => {
    setEditVisa({
      _id: visa._id,
      category: visa.category || "",
      agentName: visa.agentName || "",
      price: visa.price ?? "",
      hotelBRN: !!visa.hotelBRN,
      hotelBRNPrice: visa.hotelBRN ? visa.hotelBRNPrice ?? "" : "",
      foodBRN: !!visa.foodBRN,
      foodBRNPrice: visa.foodBRN ? visa.foodBRNPrice ?? "" : "",
    });
    setShowEditModal(true);
  };

  const updateVisa = async () => {
    if (
      !editVisa.category ||
      !editVisa.agentName ||
      !editVisa.price ||
      (editVisa.hotelBRN && !editVisa.hotelBRNPrice) ||
      (editVisa.foodBRN && !editVisa.foodBRNPrice)
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/visas/${editVisa._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(buildPayload(editVisa)),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Visa updated successfully!");
        setShowEditModal(false);
        fetchVisas();
      } else {
        alert(data.message || "Error updating visa");
      }
    } catch (err) {
      console.error("Error updating visa:", err);
      alert("Error updating visa");
    }
  };

  const handleBack = () => navigate("/dashboard/listings");

  const { isAdmin } = useAuth();

  // PRINT FUNCTION - Hide navbar during print
  const handlePrint = () => {
    // Hide navbar elements before printing
    const navElements = document.querySelectorAll(
      'nav, header, [role="navigation"]'
    );
    navElements.forEach((el) => {
      el.style.display = "none";
    });

    window.print();

    // Restore navbar elements after printing
    setTimeout(() => {
      navElements.forEach((el) => {
        el.style.display = "";
      });
    }, 100);
  };

  // Shared field set for both Add and Edit modals
  const renderVisaFields = (data, setData) => (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={<FileText size={16} className="text-blue-600" />}>
          Visa Information
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Category" required>
            <select
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Category</option>
              <option value="Adult">Adult</option>
              <option value="Child">Child</option>
              <option value="Infant">Infant</option>
            </select>
          </Field>

          <Field label="Agent Name" required>
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

          <Field label="Price" required className="sm:col-span-2">
            <input
              type="number"
              placeholder="0"
              value={data.price}
              onChange={(e) => setData({ ...data, price: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Additional Charges</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.hotelBRN}
                onChange={(e) =>
                  setData({
                    ...data,
                    hotelBRN: e.target.checked,
                    hotelBRNPrice: e.target.checked ? data.hotelBRNPrice : "",
                  })
                }
              />
              Hotel BRN
            </label>
            {data.hotelBRN && (
              <input
                type="number"
                placeholder="Hotel BRN price"
                value={data.hotelBRNPrice}
                onChange={(e) =>
                  setData({ ...data, hotelBRNPrice: e.target.value })
                }
                className={`${inputClass} mt-2`}
              />
            )}
          </Field>

          <Field label="">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.foodBRN}
                onChange={(e) =>
                  setData({
                    ...data,
                    foodBRN: e.target.checked,
                    foodBRNPrice: e.target.checked ? data.foodBRNPrice : "",
                  })
                }
              />
              Food BRN
            </label>
            {data.foodBRN && (
              <input
                type="number"
                placeholder="Food BRN price"
                value={data.foodBRNPrice}
                onChange={(e) =>
                  setData({ ...data, foodBRNPrice: e.target.value })
                }
                className={`${inputClass} mt-2`}
              />
            )}
          </Field>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* PRINT CSS */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            nav, header, [role="navigation"] {
              display: none !important;
            }
            body {
              -webkit-print-color-adjust: exact;
              margin: 0;
              padding: 0;
              background: white !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:block {
              display: block !important;
            }

            /* Remove all background colors and shadows */
            * {
              background: white !important;
              box-shadow: none !important;
            }

            /* Remove border radius */
            .rounded-xl, .rounded-lg, .rounded {
              border-radius: 0 !important;
            }

            /* Professional table styling for print only */
            .print-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000 !important;
            }

            .print-table th,
            .print-table td {
              border: 1px solid #000 !important;
              padding: 14px 10px !important;
              background: white !important;
              font-size: 14px;
              height: 55px;
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
            }

            /* Remove any footer */
            footer {
              display: none !important;
            }

            /* Hide the copyright text */
            .footer, [class*="footer"], [class*="copyright"] {
              display: none !important;
            }

            /* Ensure proper page breaks */
            .print-table {
              page-break-inside: auto;
            }

            .print-table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            /* Center the header */
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              font-size: 24px;
              font-weight: bold;
            }
          }
        `}
      </style>

      <div className="no-print mb-8">
        <PageHeader
          title="Visa"
          subtitle="Visa categories & passenger costs"
          icon={FileText}
          onBack={handleBack}
          actions={
            <>
              <Button variant="secondary" icon={Printer} onClick={handlePrint}>
                Print
              </Button>
              {isAdmin && (
                <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                  Add Visa
                </Button>
              )}
            </>
          }
        />
      </div>

      {/* PRINTABLE AREA */}
      <div id="print-area">
        {/* PRINT-ONLY HEADER */}
        <h1 className="print-header print:block hidden">Visa List</h1>

        {/* TABLE - Different styling for screen vs print */}
        <div className="table-card mt-2 print:shadow-none print:rounded-none print:border-0">
          <table className="data-table print-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Agent Name</th>
                <th>Price</th>
                <th>Hotel BRN</th>
                <th>Food BRN</th>
                {isAdmin && <th className="no-print">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : visas.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No visas found.
                  </td>
                </tr>
              ) : (
                visas.map((v) => (
                  <tr
                    key={v._id}
                    className="border-b hover:bg-gray-50 transition print:hover:bg-white"
                  >
                    <td className="py-3 px-4">{v.category}</td>
                    <td className="py-3 px-4">{v.agentName}</td>
                    <td className="py-3 px-4">{v.price}</td>
                    <td className="py-3 px-4">
                      {v.hotelBRN ? v.hotelBRNPrice : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {v.foodBRN ? v.foodBRNPrice : "-"}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 flex gap-4 no-print">
                        <button
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => openEditModal(v)}
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          onClick={() => deleteVisa(v._id)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Visa"
        icon={<FileText size={20} className="text-blue-600" />}
        maxWidth="max-w-xl"
        footer={
          <ModalActions
            onCancel={() => setShowAddModal(false)}
            onSubmit={saveVisa}
            submitLabel="Save Visa"
            submitColor="green"
          />
        }
      >
        {renderVisaFields(newVisa, setNewVisa)}
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Visa"
        icon={<FileText size={20} className="text-blue-600" />}
        maxWidth="max-w-xl"
        footer={
          <ModalActions
            onCancel={() => setShowEditModal(false)}
            onSubmit={updateVisa}
            submitLabel="Update Visa"
            submitColor="blue"
          />
        }
      >
        {renderVisaFields(editVisa, setEditVisa)}
      </Modal>
    </div>
  );
};

export default VisaList;

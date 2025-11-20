import React, { useRef } from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VisaList = () => {
  const navigate = useNavigate();
  const tableRef = useRef();

  const handleBack = () => {
    navigate("/dashboard/listings");
  };

  // SAMPLE VISA DATA (Added agentCost & companyCost)
  const visas = [
    {
      id: 1,
      category: "With Massar",
      passengerType: "Adult",
      agent: "Al-Fateh Travels",
      price: "450 SR",
      agentCost: "400 SR",
      companyCost: "350 SR",
    },
    {
      id: 2,
      category: "Without Massar",
      passengerType: "Infant",
      agent: "Noor Visa Agency",
      price: "250 SR",
      agentCost: "220 SR",
      companyCost: "190 SR",
    },
  ];

  const type = localStorage.getItem("type");
  const isAdmin = type === "admin";

  return (
    <div className="px-4 sm:px-8 py-6 w-full">
      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="flex cursor-pointer items-center gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Visa List</h1>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition cursor-pointer">
            Print
          </button>

          {isAdmin && (
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
              <Plus size={20} /> Add
            </button>
          )}
        </div>
      </div>

      {/* VISA TABLE */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table ref={tableRef} className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold">Category</th>
              <th className="py-3 px-4 text-sm font-semibold">Passenger</th>
              <th className="py-3 px-4 text-sm font-semibold">Agent Name</th>

              {/* NEW COLUMNS */}
              <th className="py-3 px-4 text-sm font-semibold">Agent Cost</th>
              <th className="py-3 px-4 text-sm font-semibold">Company Cost</th>
              <th className="py-3 px-4 text-sm font-semibold">Price</th>

              {isAdmin && (
                <th className="py-3 px-4 text-sm font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {visas.map((visa) => (
              <tr
                key={visa.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4">{visa.category}</td>
                <td className="py-3 px-4">{visa.passengerType}</td>
                <td className="py-3 px-4">{visa.agent}</td>

                {/* NEW ROW DATA */}
                <td className="py-3 px-4">{visa.agentCost}</td>
                <td className="py-3 px-4">{visa.companyCost}</td>
                <td className="py-3 px-4">{visa.price}</td>

                {isAdmin && (
                  <td className="py-3 px-4 flex items-center gap-4">
                    <button className="text-blue-600 cursor-pointer hover:text-blue-800">
                      <Pencil size={20} />
                    </button>
                    <button className="text-red-600 cursor-pointer hover:text-red-800">
                      <Trash2 size={20} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisaList;

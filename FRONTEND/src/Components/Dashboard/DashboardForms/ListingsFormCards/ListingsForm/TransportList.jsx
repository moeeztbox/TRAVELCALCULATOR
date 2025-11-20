import React from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TransportList = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard/listings");
  };

  // SAMPLE TRANSPORT DATA (WITH EXTRA FIELDS)
  const transports = [
    {
      id: 1,
      carType: "Hiace",
      capacity: "12 Seater",
      route: { from: "Makkah", to: "Madinah" },
      price: "450 SR",
      agentName: "Abdullah Travels",
      agentCost: "400 SR",
      companyCost: "350 SR",
    },
    {
      id: 2,
      carType: "SUV",
      capacity: "6 Seater",
      route: { from: "Jeddah", to: "Makkah" },
      price: "300 SR",
      agentName: "Haram Transport",
      agentCost: "260 SR",
      companyCost: "230 SR",
    },
  ];

  // ROLE CHECK
  const type = localStorage.getItem("type");
  const isAdmin = type === "admin";

  return (
    <div className="px-4 sm:px-8 py-6 w-full">
      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="flex items-center cursor-pointer gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back</span>
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Transport List
        </h1>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition cursor-pointer">
            Print
          </button>

          {isAdmin && (
            <button className="flex cursor-pointer items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
              <Plus size={20} />
              Add
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold">Car Type</th>
              <th className="py-3 px-4 text-sm font-semibold">Capacity</th>
              <th className="py-3 px-4 text-sm font-semibold">Route</th>
              <th className="py-3 px-4 text-sm font-semibold">Agent Name</th>
              <th className="py-3 px-4 text-sm font-semibold">Agent Cost</th>
              <th className="py-3 px-4 text-sm font-semibold">Company Cost</th>
              <th className="py-3 px-4 text-sm font-semibold">Price</th>

              {isAdmin && (
                <th className="py-3 px-4 text-sm font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {transports.map((transport) => (
              <tr
                key={transport.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4">{transport.carType}</td>
                <td className="py-3 px-4">{transport.capacity}</td>
                <td className="py-3 px-4">
                  {transport.route.from} → {transport.route.to}
                </td>
                <td className="py-3 px-4">{transport.agentName}</td>
                <td className="py-3 px-4">{transport.agentCost}</td>
                <td className="py-3 px-4">{transport.companyCost}</td>
                <td className="py-3 px-4">{transport.price}</td>

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

export default TransportList;

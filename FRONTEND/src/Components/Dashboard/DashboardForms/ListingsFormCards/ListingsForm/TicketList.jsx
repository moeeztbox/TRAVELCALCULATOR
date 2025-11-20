import React from "react";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TicketList = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard/listings");
  };

  // UPDATED TICKET DATA WITH NEW FIELDS
  const tickets = [
    {
      id: 1,
      airline: "PIA",
      category: "Group Ticket",
      passengerType: "Adult",
      weight: "30 KG",
      price: "1200 SR",
      agentName: "Al Safa Travels",
      agentCost: "1100 SR",
      companyCost: "1250 SR",
    },
    {
      id: 2,
      airline: "Turkish Airlines",
      category: "System Ticket",
      passengerType: "Child",
      weight: "20 KG",
      price: "850 SR",
      agentName: "Falcon Travel Services",
      agentCost: "780 SR",
      companyCost: "900 SR",
    },
  ];

  // ROLE CHECK
  const type = localStorage.getItem("type");
  const isAdmin = type === "admin";

  return (
    <div className="px-4 sm:px-8 py-6 w-full ">
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
        <h1 className="text-3xl font-extrabold text-gray-900">Tickets List</h1>

        <div className="flex gap-2">
          {/* PRINT BUTTON */}
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition cursor-pointer">
            Print
          </button>

          {/* ADD BUTTON ONLY FOR ADMIN */}
          {isAdmin && (
            <button
              className="flex cursor-pointer items-center gap-2 bg-blue-600 text-white px-4 py-2 
              rounded-lg shadow hover:bg-blue-700 transition"
            >
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
              <th className="py-3 px-4 text-sm font-semibold">Airline</th>
              <th className="py-3 px-4 text-sm font-semibold">Category</th>
              <th className="py-3 px-4 text-sm font-semibold">Passenger</th>
              <th className="py-3 px-4 text-sm font-semibold">Weight</th>
              <th className="py-3 px-4 text-sm font-semibold">Agent Name</th>
              <th className="py-3 px-4 text-sm font-semibold">Agent Cost</th>
              <th className="py-3 px-4 text-sm font-semibold">Company Cost</th>
              <th className="py-3 px-4 text-sm font-semibold">Price</th>

              {/* ACTIONS ONLY FOR ADMIN */}
              {isAdmin && (
                <th className="py-3 px-4 text-sm font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4">{ticket.airline}</td>
                <td className="py-3 px-4">{ticket.category}</td>
                <td className="py-3 px-4">{ticket.passengerType}</td>
                <td className="py-3 px-4">{ticket.weight}</td>
                <td className="py-3 px-4">{ticket.agentName}</td>
                <td className="py-3 px-4">{ticket.agentCost}</td>
                <td className="py-3 px-4">{ticket.companyCost}</td>
                <td className="py-3 px-4">{ticket.price}</td>

                {/* NEW FIELDS DISPLAY */}

                {/* ADMIN ONLY ICONS */}
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

export default TicketList;

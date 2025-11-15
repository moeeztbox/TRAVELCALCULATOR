import React from "react";
import { Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TicketCard = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/dashboard/tickets")}
      className="
    bg-white rounded-2xl p-6 shadow-md cursor-pointer
    hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]
    transition-all duration-300 border border-gray-200
    w-full h-64 flex flex-col justify-between
  "
    >
      <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center">
        <Ticket className="text-yellow-700 w-8 h-8" />
      </div>

      <h3 className="text-xl font-semibold text-gray-800">Tickets</h3>
      <p className="text-gray-600 text-sm">Book flights & events easily</p>

      <span className="text-yellow-700 font-semibold mt-2">Explore →</span>
    </div>
  );
};

export default TicketCard;

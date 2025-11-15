import React from "react";
import { Bus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TransportCard = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/dashboard/transport")}
      className="
    bg-white rounded-2xl p-6 shadow-md cursor-pointer
    hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]
    transition-all duration-300 border border-gray-200
    w-full h-64 flex flex-col justify-between
  "
    >
      <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
        <Bus className="text-purple-700 w-8 h-8" />
      </div>

      <h3 className="text-xl font-semibold text-gray-800">Transport</h3>
      <p className="text-gray-600 text-sm">Book buses & local transport</p>

      <span className="text-purple-700 font-semibold mt-2">Explore →</span>
    </div>
  );
};

export default TransportCard;

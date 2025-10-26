import React from "react";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminCard = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/admin/login")}
      className="group bg-white rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
    >
      <div className="w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 mb-4"></div>
      <div className="text-center">
        <div className="inline-block p-3 sm:p-4 bg-yellow-50 rounded-full mb-4 group-hover:bg-yellow-100 transition-colors">
          <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Admin Panel
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-5">
          Manage bookings, users, and system configurations
        </p>
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-5">
          <p className="text-blue-900 font-semibold text-xs sm:text-sm">
            🔒 Login required to access admin features
          </p>
        </div>
        <div className="inline-block px-6 py-2 sm:px-8 sm:py-3 bg-yellow-600 text-white rounded-lg font-semibold group-hover:bg-yellow-700 transition-colors text-sm sm:text-base">
          Go to Login
        </div>
      </div>
    </button>
  );
};

export default AdminCard;

import React from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserCard = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/login", { state: { type: "user" } })}
      className="group bg-white rounded-2xl cursor-pointer p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
    >
      <div className="w-full h-1 bg-blue-500 mb-4"></div>
      <div className="text-center">
        <div className="inline-block p-3 sm:p-4 bg-blue-50 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          User Panel
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-5">
          Book flights, hotels, and manage your travel reservations
        </p>
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-5">
          <p className="text-yellow-900 font-semibold text-xs sm:text-sm">
            🔒 Login required to access limited features
          </p>
        </div>
        <div className="inline-block px-6 py-2 sm:px-8 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold group-hover:bg-blue-700 transition-colors text-sm sm:text-base">
          Go to Login
        </div>
      </div>
    </button>
  );
};

export default UserCard;

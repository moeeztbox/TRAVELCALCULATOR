import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth token or any user info
    localStorage.removeItem("token"); // or whatever key you use
    console.log("User logged out");

    // Redirect to home page
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Button for desktop & tablet */}
      <button
        onClick={handleLogout}
        className="hidden sm:inline-flex cursor-pointer px-4 py-2 bg-red-500 text-white rounded-3xl hover:bg-red-600 transition"
      >
        Logout
      </button>

      {/* Icon for mobile */}
      <button
        onClick={handleLogout}
        className="sm:hidden p-2 text-red-500 hover:text-red-600 transition"
      >
        <LogOut size={24} />
      </button>
    </>
  );
};

export default LogoutButton;

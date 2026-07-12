import React from "react";
import { UserCircle } from "lucide-react";
import LogoutButton from "./LogoutButton"; // import the logout component
import { useAuth } from "../../context/AuthContext";
import logo from "../../Assets/logo.jpeg";

const Navbar = () => {
  const { isAuthenticated, displayName, isAdmin } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src={logo}
            alt="AlBuraqGlobal logo"
            className="h-9 w-9 sm:h-11 sm:w-11 object-contain shrink-0"
          />
          <div className="leading-tight truncate">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-yellow-600 tracking-wide whitespace-nowrap">
              AL BURAQ GLOBAL
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 tracking-wide whitespace-nowrap">
              TRAVEL & TOURS PVT LTD
            </p>
          </div>
        </div>

        {/* Logged-in user + Logout — only shown when a session is active */}
        {isAuthenticated && (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <UserCircle className="w-6 h-6 text-yellow-600" />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-semibold capitalize">
                  {displayName}
                </span>
                <span className="text-[11px] text-gray-400 -mt-0.5">
                  {isAdmin ? "Administrator" : "User"}
                </span>
              </div>
            </div>

            <LogoutButton />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

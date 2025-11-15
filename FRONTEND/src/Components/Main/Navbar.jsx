import React from "react";
import LogoutButton from "./LogoutButton"; // import the logout component

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">
          ALBURAQGLOBAL
          <span className="text-gray-800 ml-1 sm:ml-2">TRAVEL & TOURS</span>
        </h1>

        {/* Logout Button */}
        <LogoutButton />
      </div>
    </nav>
  );
};

export default Navbar;

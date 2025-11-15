import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-gray-200 py-2 sm:py-3 w-full">
      <div className="text-center text-gray-500 text-xs sm:text-sm md:text-base">
        © {currentYear}{" "}
        <span className="font-semibold text-gray-700">ALBURAQGLOBAL TRAVEL & TOURS</span>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

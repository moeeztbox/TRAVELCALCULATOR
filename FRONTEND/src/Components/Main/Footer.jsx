import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-hair py-4 px-6 w-full no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <p className="text-xs text-soft">
          © {currentYear}{" "}
          <span className="font-semibold text-muted">
            AlBuraq Global Travel &amp; Tours Pvt Ltd
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

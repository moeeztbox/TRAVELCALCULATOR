import React, { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo-mark.png";

// Authenticated app shell: fixed sidebar on desktop, slide-in drawer on
// mobile, a slim glass topbar, the page content, and a footer.
const AppLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { displayName, isAdmin } = useAuth();

  const initials = (displayName || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen app-canvas">
      {/* Desktop sidebar */}
      <aside className="no-print hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="no-print lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm animate-overlay-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[82%] animate-slide-in-left">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Content column */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass-bar border-b border-hair no-print">
          <div className="flex items-center gap-3 h-16 px-4 sm:px-6">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="lg:hidden grid place-items-center w-10 h-10 rounded-xl text-muted
                bg-surface border border-hair hover:text-brand-700 transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>

            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-2">
              <img src={logo} alt="AlBuraq Global" className="w-8 h-8 object-contain" />
              <span className="font-bold text-brand-800 text-sm tracking-wide">
                AL BURAQ GLOBAL
              </span>
            </div>

            <div className="flex-1" />

            {/* User chip — photo on the left, name on the right */}
            <div className="flex items-center gap-2.5">
              <div className="grid place-items-center w-9 h-9 rounded-full bg-brand-600 text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-sm font-semibold text-ink capitalize">
                  {displayName}
                </p>
                <p className="text-[11px] text-soft">
                  {isAdmin ? "Administrator" : "User"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;

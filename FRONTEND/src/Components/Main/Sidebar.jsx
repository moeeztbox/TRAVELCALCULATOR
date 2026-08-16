import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Stamp,
  Plane,
  Car,
  Package,
  Sparkles,
  ListChecks,
  LogOut,
  ChevronDown,
} from "lucide-react";
import logo from "../../assets/logo-mark.png";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", icon: LayoutDashboard, text: "Dashboard", end: true }],
  },
  {
    label: "Calculators",
    items: [
      { to: "/dashboard/hotels", icon: Building2, text: "Hotels" },
      { to: "/dashboard/visa", icon: Stamp, text: "Visa" },
      { to: "/dashboard/tickets", icon: Plane, text: "Tickets" },
      { to: "/dashboard/transport", icon: Car, text: "Transport" },
    ],
  },
  {
    label: "Packages",
    items: [
      { to: "/dashboard/packages", icon: Package, text: "Packages" },
      {
        icon: Sparkles,
        text: "Customize Package",
        children: [
          { to: "/dashboard/customize-package/normal", text: "Normal Package" },
          { to: "/dashboard/customize-package/explanatory", text: "Explanatory Package" },
        ],
      },
    ],
  },
  {
    label: "Management",
    items: [{ to: "/dashboard/listings", icon: ListChecks, text: "Listings" }],
  },
];

const Sidebar = ({ onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Which expandable parent item the user manually toggled open. A parent
  // with an active child route is always shown expanded regardless of this
  // (so you can never navigate to a page and have its section collapsed).
  const [manuallyOpen, setManuallyOpen] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-brand-900 text-white/90">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0 border-b border-white/10">
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-white shrink-0">
          <img src={logo} alt="AlBuraq Global" className="w-7 h-7 object-contain" />
        </div>
        <div className="leading-tight min-w-0">
          <p className="font-bold text-white tracking-wide text-sm truncate">
            AL BURAQ GLOBAL
          </p>
          <p className="text-[10px] text-brand-300 tracking-[0.2em]">
            TRAVEL &amp; TOURS
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                if (item.children) {
                  const isChildActive = item.children.some((child) =>
                    location.pathname.startsWith(child.to)
                  );
                  const isOpen = isChildActive || manuallyOpen === item.text;

                  return (
                    <div key={item.text}>
                      <button
                        type="button"
                        onClick={() =>
                          setManuallyOpen((prev) =>
                            prev === item.text ? null : item.text
                          )
                        }
                        aria-expanded={isOpen}
                        className={`group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isChildActive
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <item.icon
                          size={18}
                          className={isChildActive ? "text-white" : "text-white/60 group-hover:text-white"}
                        />
                        <span className="truncate flex-1 text-left">{item.text}</span>
                        <ChevronDown
                          size={16}
                          className={`text-white/50 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="mt-1 space-y-1">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              onClick={onNavigate}
                              className={({ isActive }) =>
                                `flex items-center gap-2 pl-11 pr-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                                  isActive
                                    ? "bg-white text-brand-800 shadow-soft"
                                    : "text-white/60 hover:text-white hover:bg-white/10"
                                }`
                              }
                            >
                              <span className="truncate">{child.text}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white text-brand-800 shadow-soft"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={18}
                          className={isActive ? "text-brand-600" : "text-white/60 group-hover:text-white"}
                        />
                        <span className="truncate">{item.text}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-white/70 hover:text-white hover:bg-[#d1435b]/90 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

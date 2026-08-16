import React from "react";
import {
  Building2,
  Stamp,
  Plane,
  Car,
  Package,
  Sparkles,
  ListChecks,
} from "lucide-react";
import ModuleCard from "../Components/UI/ModuleCard";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-mark.png";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const MODULES = [
  { to: "/dashboard/hotels", icon: Building2, title: "Hotel Calculator", description: "Price rooms, nights and commissions.", accent: "blue" },
  { to: "/dashboard/visa", icon: Stamp, title: "Visa Calculator", description: "Calculate visa costs per passenger.", accent: "green" },
  { to: "/dashboard/tickets", icon: Plane, title: "Ticket Calculator", description: "Airfare pricing and commissions.", accent: "sky" },
  { to: "/dashboard/transport", icon: Car, title: "Transport Calculator", description: "Routes, trip types and vehicle costs.", accent: "violet" },
  { to: "/dashboard/packages", icon: Package, title: "Packages", description: "Browse ready Hajj & Umrah packages.", accent: "gold" },
  { to: "/dashboard/customize-package", icon: Sparkles, title: "Customize Package", description: "Build a bespoke package & quote.", accent: "blue" },
  { to: "/dashboard/listings", icon: ListChecks, title: "Listings", description: "Manage hotels, visas, flights & more.", accent: "indigo" },
];

const Dashboard = () => {
  const { displayName, isAdmin } = useAuth();

  return (
    <div className="space-y-8">
      {/* Greeting hero */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-900 text-white p-7 sm:p-9 animate-rise">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(600px 300px at 15% 0%, rgba(47,128,201,0.4), transparent 60%), radial-gradient(500px 320px at 100% 100%, rgba(212,161,58,0.18), transparent 55%)",
          }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-brand-300 text-sm font-medium">
              {greeting()}, welcome back
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight capitalize">
              {displayName}
            </h1>
            <p className="mt-2 text-brand-200 text-sm max-w-md">
              {isAdmin
                ? "Manage your listings, pricing and packages from one place."
                : "Explore packages and build travel quotations with ease."}
            </p>
          </div>
          <img
            src={logo}
            alt=""
            className="hidden sm:block w-20 h-20 object-contain opacity-90 shrink-0"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-4">
          Quick access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m) => (
            <ModuleCard key={m.to} {...m} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

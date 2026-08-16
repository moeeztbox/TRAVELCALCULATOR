import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import AdminCard from "../Components/Home/AdminCard";
import UserCard from "../Components/Home/UserCard";
import logo from "../assets/logo-mark.png";

const Home = () => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Brand bar */}
      <header className="w-full max-w-6xl mx-auto px-6 pt-8 flex items-center gap-3">
        <img src={logo} alt="AlBuraq Global" className="w-11 h-11 object-contain" />
        <div className="leading-tight">
          <p className="font-bold text-brand-800 tracking-wide">AL BURAQ GLOBAL</p>
          <p className="text-[11px] text-soft tracking-[0.25em]">
            TRAVEL &amp; TOURS PVT LTD
          </p>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-16">
        {/* Left — pitch */}
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-100 text-gold-600 px-3 py-1 text-xs font-bold tracking-wide">
            <Sparkles size={14} /> PREMIUM TRAVEL MANAGEMENT
          </span>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.05] tracking-tight text-ink">
            Your complete
            <br />
            <span className="text-gradient-brand">travel operations</span>
            <br />
            platform.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted max-w-md">
            Manage hotels, visas, flights, transport and Hajj &amp; Umrah
            packages — pricing, commissions and quotations, all in one elegant
            workspace.
          </p>

          <div className="mt-8 flex items-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-500" />
              Secure &amp; role-based access
            </div>
          </div>
        </div>

        {/* Right — choose role */}
        <div className="animate-rise" style={{ animationDelay: "0.1s" }}>
          <p className="text-sm font-semibold text-muted mb-4 text-center lg:text-left">
            Choose how you'd like to continue
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <UserCard />
            <AdminCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

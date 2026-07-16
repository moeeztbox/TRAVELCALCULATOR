import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const ACCENTS = {
  blue: "bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white",
  gold: "bg-gold-100 text-gold-600 group-hover:bg-gold-500 group-hover:text-brand-900",
  green: "bg-[#e7f5ef] text-[#0f7a56] group-hover:bg-[#0f7a56] group-hover:text-white",
  sky: "bg-[#e6f1fb] text-[#1f74c0] group-hover:bg-[#1f74c0] group-hover:text-white",
  violet: "bg-[#efeafb] text-[#6b4fc0] group-hover:bg-[#6b4fc0] group-hover:text-white",
  indigo: "bg-[#eaecfb] text-[#4a53c0] group-hover:bg-[#4a53c0] group-hover:text-white",
};

// Reusable dashboard / launchpad tile.
const ModuleCard = ({ to, icon: Icon, title, description, accent = "blue" }) => (
  <Link
    to={to}
    className="group bg-surface rounded-2xl p-5 border border-hair shadow-soft
      transition-all duration-300 hover:shadow-lift hover:-translate-y-1 hover:border-brand-200
      flex flex-col"
  >
    <div className="flex items-start justify-between">
      <div
        className={`grid place-items-center w-12 h-12 rounded-xl transition-colors duration-300 ${
          ACCENTS[accent] || ACCENTS.blue
        }`}
      >
        <Icon size={24} />
      </div>
      <ArrowUpRight
        size={20}
        className="text-soft transition-all duration-300 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </div>
    <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
    <p className="mt-1 text-sm text-muted leading-relaxed">{description}</p>
  </Link>
);

export default ModuleCard;

import React from "react";
import { Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminCard = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/login", { state: { type: "admin" } })}
      className="group text-left bg-surface rounded-2xl p-6 border border-hair shadow-soft
        transition-all duration-300 hover:shadow-lift hover:-translate-y-1 hover:border-gold-300
        cursor-pointer flex flex-col"
    >
      <div className="grid place-items-center w-12 h-12 rounded-xl bg-gold-100 text-gold-600 mb-4
        group-hover:bg-gold-500 group-hover:text-brand-900 transition-colors">
        <Shield size={24} />
      </div>
      <h3 className="text-lg font-bold text-ink">Admin Panel</h3>
      <p className="text-sm text-muted mt-1 flex-1">
        Manage listings, pricing and full system configuration.
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 group-hover:gap-2.5 transition-all">
        Continue <ArrowRight size={16} />
      </span>
    </button>
  );
};

export default AdminCard;

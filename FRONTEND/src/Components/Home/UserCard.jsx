import React from "react";
import { Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserCard = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/login", { state: { type: "user" } })}
      className="group text-left bg-surface rounded-2xl p-6 border border-hair shadow-soft
        transition-all duration-300 hover:shadow-lift hover:-translate-y-1 hover:border-brand-200
        cursor-pointer flex flex-col"
    >
      <div className="grid place-items-center w-12 h-12 rounded-xl bg-brand-50 text-brand-600 mb-4
        group-hover:bg-brand-600 group-hover:text-white transition-colors">
        <Users size={24} />
      </div>
      <h3 className="text-lg font-bold text-ink">User Panel</h3>
      <p className="text-sm text-muted mt-1 flex-1">
        Browse packages and build travel quotations.
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:gap-2.5 transition-all">
        Continue <ArrowRight size={16} />
      </span>
    </button>
  );
};

export default UserCard;

import React from "react";

const VARIANTS = {
  neutral: "bg-surface-2 text-muted border border-hair",
  brand: "bg-brand-50 text-brand-700",
  gold: "bg-gold-100 text-gold-600",
  success: "bg-[#e7f5ef] text-[#0f7a56]",
  danger: "bg-[#fdecef] text-[#c23350]",
  warning: "bg-[#fbf0dd] text-[#b0701d]",
};

// Small status pill. `dot` shows a leading indicator dot.
const Badge = ({ variant = "neutral", dot = false, className = "", children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
      text-xs font-semibold whitespace-nowrap ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}
  >
    {dot && (
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    )}
    {children}
  </span>
);

export default Badge;

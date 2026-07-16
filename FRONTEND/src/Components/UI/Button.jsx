import React from "react";

// Premium button with consistent variants/sizes used across the whole app.
const VARIANTS = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-brand hover:shadow-lift",
  secondary:
    "bg-surface text-ink border border-hair hover:bg-surface-2 hover:border-brand-200",
  ghost: "text-muted hover:bg-brand-50 hover:text-brand-700",
  gold: "bg-gold-500 text-brand-900 hover:bg-gold-600 hover:text-white shadow-soft",
  danger: "bg-[#d1435b] text-white hover:bg-[#b93a50] shadow-soft",
  success: "bg-[#17976a] text-white hover:bg-[#12805a] shadow-soft",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100",
};

const SIZES = {
  sm: "text-xs px-3 py-2 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-[15px] px-6 py-3 rounded-xl gap-2",
};

const Button = ({
  variant = "primary",
  size = "md",
  icon: Icon = null,
  iconRight: IconRight = null,
  fullWidth = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold
        transition-all duration-200 cursor-pointer select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md}
        ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 16 : 18} />}
      {children}
      {IconRight && <IconRight size={size === "sm" ? 16 : 18} />}
    </button>
  );
};

export default Button;

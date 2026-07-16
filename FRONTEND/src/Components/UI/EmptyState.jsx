import React from "react";

// Friendly empty / no-data state.
const EmptyState = ({
  icon: Icon = null,
  title = "Nothing here yet",
  message = "",
  action = null,
  className = "",
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
  >
    {Icon && (
      <div className="grid place-items-center w-16 h-16 rounded-2xl bg-brand-50 text-brand-400 mb-4">
        <Icon size={30} />
      </div>
    )}
    <h3 className="text-base font-semibold text-ink">{title}</h3>
    {message && (
      <p className="text-sm text-muted mt-1.5 max-w-sm">{message}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;

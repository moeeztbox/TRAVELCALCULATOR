import React from "react";

// Shared input styling used across all Add/Edit forms
export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 " +
  "placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 " +
  "focus:outline-none transition-all duration-200";

export const labelClass =
  "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

// A labelled field wrapper. Pass the input/select/textarea as children.
export const Field = ({ label, required = false, children, className = "" }) => (
  <div className={className}>
    {label && (
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    {children}
  </div>
);

// A titled section separator inside a form
export const SectionTitle = ({ icon = null, children }) => (
  <div className="flex items-center gap-2 mt-1 mb-3 first:mt-0">
    {icon}
    <h3 className="text-sm font-bold text-gray-800">{children}</h3>
    <div className="flex-1 h-px bg-gray-100 ml-2" />
  </div>
);

// Standard modal action buttons (Save/Update + Cancel)
export const ModalActions = ({
  onCancel,
  onSubmit,
  submitLabel = "Save",
  submitColor = "green",
}) => {
  const colors = {
    green: "bg-green-600 hover:bg-green-700",
    blue: "bg-blue-600 hover:bg-blue-700",
  };
  return (
    <div className="flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition cursor-pointer"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition cursor-pointer ${
          colors[submitColor] || colors.green
        }`}
      >
        {submitLabel}
      </button>
    </div>
  );
};

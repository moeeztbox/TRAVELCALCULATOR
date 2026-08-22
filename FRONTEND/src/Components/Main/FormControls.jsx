import React from "react";
import Button from "../UI/Button";

// Shared input styling used across all Add/Edit forms.
export const inputClass =
  "w-full rounded-xl border border-hair bg-surface-2 px-3.5 py-2.5 text-sm text-ink " +
  "placeholder-soft transition-all duration-200 " +
  "focus:border-brand-400 focus:bg-surface focus:ring-2 focus:ring-brand-100 focus:outline-none";

export const labelClass =
  "block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide";

// A labelled field wrapper. Pass the input/select/textarea as children.
export const Field = ({ label, required = false, children, className = "" }) => (
  <div className={className}>
    {label && (
      <label className={labelClass}>
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
    )}
    {children}
  </div>
);

// A titled section separator inside a form.
export const SectionTitle = ({ icon = null, children }) => (
  <div className="flex items-center gap-2 mt-1 mb-3 first:mt-0">
    {icon && <span className="text-brand-500">{icon}</span>}
    <h3 className="text-sm font-bold text-ink tracking-tight">{children}</h3>
    <div className="flex-1 h-px bg-hair ml-2" />
  </div>
);

// Standard modal action buttons (Save/Update + Cancel).
export const ModalActions = ({
  onCancel,
  onSubmit,
  submitLabel = "Save",
  submitColor = "primary",
  submitDisabled = false,
}) => {
  // Backwards-compatible: old callers pass "green"/"blue".
  const variant =
    submitColor === "green"
      ? "success"
      : submitColor === "blue"
      ? "primary"
      : submitColor;

  return (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant={variant} onClick={onSubmit} disabled={submitDisabled}>
        {submitLabel}
      </Button>
    </div>
  );
};

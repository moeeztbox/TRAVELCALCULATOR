import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Reusable animated modal with a blurred, semi-transparent backdrop.
 * The page stays visible behind the overlay (no solid black background).
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title: string
 *  - icon: optional lucide icon element
 *  - children: modal body (form fields)
 *  - footer: optional footer node (action buttons)
 *  - maxWidth: tailwind max-w class (default "max-w-2xl")
 */
const Modal = ({
  open,
  onClose,
  title,
  icon = null,
  children,
  footer = null,
  maxWidth = "max-w-2xl",
}) => {
  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        // close only when clicking the backdrop itself
        if (e.target === e.currentTarget) onClose?.();
      }}
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/40 backdrop-blur-sm animate-overlay-in"
    >
      <div
        className={`animate-panel-in w-full ${maxWidth} bg-white rounded-2xl shadow-2xl
                    max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            {icon}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1.5 transition cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="px-6 py-5 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

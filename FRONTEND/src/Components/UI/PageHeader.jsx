import React from "react";
import { ArrowLeft } from "lucide-react";

// Consistent page header: optional back arrow, an icon tile, title + subtitle,
// and a slot for actions on the right. Used at the top of every inner page.
const PageHeader = ({
  title,
  subtitle,
  icon: Icon = null,
  onBack = null,
  actions = null,
  className = "",
}) => (
  <div
    className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
  >
    <div className="flex items-center gap-3 min-w-0">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          className="shrink-0 grid place-items-center w-10 h-10 rounded-xl text-muted
            bg-surface border border-hair hover:text-brand-700 hover:border-brand-200
            transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {Icon && (
        <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-brand-50 text-brand-600">
          <Icon size={22} />
        </div>
      )}

      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>

    {actions && (
      <div className="flex items-center gap-2 flex-wrap">{actions}</div>
    )}
  </div>
);

export default PageHeader;

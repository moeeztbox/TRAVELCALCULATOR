import React, { useMemo, useState } from "react";
import { inputClass } from "../Main/FormControls";

// A searchable combobox: user can pick a suggestion from `options`, or keep
// typing a value that doesn't match anything and use it as a temporary
// custom entry. Selecting a suggestion is the only way `onSelect` fires —
// plain typing always calls `onTextChange`, which callers use to clear any
// previously attached database record (so edited text is treated as custom).
const SearchableCombobox = ({
  value,
  onTextChange,
  onSelect,
  options,
  getLabel,
  getSubLabel,
  placeholder = "Type to search or enter a custom value",
  maxSuggestions = 8,
  isSelected = false,
}) => {
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    return q
      ? options.filter((o) => getLabel(o).toLowerCase().includes(q))
      : options;
  }, [options, value, getLabel]);

  const visibleMatches = matches.slice(0, maxSuggestions);
  const hiddenCount = Math.max(0, matches.length - visibleMatches.length);

  const handleSelect = (option) => {
    onSelect(option);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onTextChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        autoComplete="off"
        className={`${inputClass} ${
          isSelected ? "border-green-400 bg-green-50/40" : ""
        }`}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto">
          {visibleMatches.length > 0 ? (
            <>
              {visibleMatches.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex flex-col border-b border-gray-100 last:border-b-0"
                >
                  <span className="font-medium text-gray-800">
                    {getLabel(opt)}
                  </span>
                  {getSubLabel && (
                    <span className="text-xs text-gray-500">
                      {getSubLabel(opt)}
                    </span>
                  )}
                </button>
              ))}
              {hiddenCount > 0 && (
                <div className="px-3 py-1.5 text-xs text-gray-400 border-t border-gray-100">
                  +{hiddenCount} more — keep typing to narrow results
                </div>
              )}
            </>
          ) : (
            <div className="px-3 py-2 text-xs text-gray-400">
              No matches — this will be used as a custom entry
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableCombobox;

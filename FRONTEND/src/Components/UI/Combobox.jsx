import React, { useEffect, useRef, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { inputClass } from "../Main/FormControls";

// Searchable dropdown (autocomplete/combobox). Type to filter, click or
// select to choose, scrolls for long lists, closes on outside click.
const Combobox = ({
  options, // [{ value, label }]
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef(null);

  const selected = options.find((o) => o.value === value) || null;

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const commit = (option) => {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) commit(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none"
        />
        <input
          type="text"
          disabled={disabled}
          value={open ? query : selected?.label || ""}
          placeholder={selected ? selected.label : placeholder}
          onFocus={() => {
            setOpen(true);
            setQuery("");
            setHighlight(0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={handleKeyDown}
          className={`${inputClass} pl-10 pr-9`}
        />
        <ChevronDown
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none"
        />
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl border border-hair bg-surface shadow-lift py-1.5">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-soft">No matches found</div>
          ) : (
            filtered.map((o, i) => (
              <button
                key={o.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(o)}
                className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  i === highlight
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink hover:bg-surface-2"
                } ${o.value === value ? "font-semibold" : ""}`}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Combobox;

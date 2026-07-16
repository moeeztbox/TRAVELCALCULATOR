import React from "react";
import { Search } from "lucide-react";

// Compact search field with a leading icon.
const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <Search
      size={17}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none"
    />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-hair
        text-sm text-ink placeholder-soft transition-all
        focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
    />
  </div>
);

export default SearchInput;

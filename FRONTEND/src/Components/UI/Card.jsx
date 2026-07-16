import React from "react";

// Surface container with the app's soft elevation. Optional hover lift.
const Card = ({ hover = false, className = "", children, ...props }) => (
  <div
    className={`bg-surface border border-hair rounded-2xl shadow-soft
      ${hover ? "transition-all duration-300 hover:shadow-lift hover:-translate-y-1" : ""}
      ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;

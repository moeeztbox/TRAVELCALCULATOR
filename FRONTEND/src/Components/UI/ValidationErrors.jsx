import { AlertTriangle } from "lucide-react";

// One shared validation banner used by every calculator form so missing/
// invalid required fields are reported consistently across Hotel, Visa,
// Transport, Ticket, and Train.
const ValidationErrors = ({ messages = [] }) => {
  if (!messages.length) return null;

  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
      <ul className="space-y-0.5 list-disc list-inside">
        {messages.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationErrors;

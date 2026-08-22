// Shared money formatting for saved-history records — kept out of
// SavedCalculationDetail.jsx so that component file can stay component-only
// (react-refresh/only-export-components).
export const money = (n) => `$${Number(n || 0).toFixed(2)}`;
export const moneySAR = (n) => `SAR ${Number(n || 0).toLocaleString()}`;
export const moneyPKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

// Package (Normal) stores its total in PKR (all-passengers selling price);
// Package (Explanatory) has no monetary total at all — everything else uses
// the plain "$" convention already used on each calculator's own result view.
export const formatTotal = (record) => {
  if (record.type === "package") {
    return record.snapshot?.packageKind === "explanatory"
      ? null
      : moneyPKR(record.total);
  }
  return money(record.total);
};

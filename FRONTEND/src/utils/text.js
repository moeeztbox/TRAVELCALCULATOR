// Normalizes a free-text "name/label" value (hotel name, transport type,
// visa/ticket descriptive text, package name, ...) to uppercase so the
// SAVED value itself is uppercase, not just its on-screen styling. Safe to
// call directly inside an onChange handler:
//   onChange={(e) => setX(toUpper(e.target.value))}
// Deliberately NOT for email, password, URLs, tokens, IDs, dates, or
// numeric fields — those must keep their original casing/format.
export const toUpper = (value) => (value ?? "").toString().toUpperCase();

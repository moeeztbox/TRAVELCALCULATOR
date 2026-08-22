// One reusable client for the Saved History API — used by every
// calculator's "Save" button and by the History page itself, so there's a
// single place that knows the request shape/URLs.
import { API_BASE_URL } from "../config/api";

const BASE = `${API_BASE_URL}/saved-calculations`;

export const saveCalculation = async ({ type, clientName, snapshot, total }) => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ type, clientName, snapshot, total }),
  });
  return res.json();
};

export const fetchSavedCalculations = async (type) => {
  const url = type ? `${BASE}?type=${encodeURIComponent(type)}` : BASE;
  const res = await fetch(url, { credentials: "include" });
  return res.json();
};

export const updateSavedCalculation = async (id, updates) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  return res.json();
};

export const deleteSavedCalculation = async (id) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
};

import { kv } from "@vercel/kv";

const CLIENTS_KEY = "sdr:clients";

export async function getClients() {
  const data = await kv.get(CLIENTS_KEY);
  return data || [];
}

export async function saveClients(clients) {
  await kv.set(CLIENTS_KEY, clients);
}

export function normalizeHandle(input) {
  if (!input) return "";
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//i, "");
  s = s.replace(/^www\./i, "");
  s = s.replace(/^instagram\.com\//i, "");
  s = s.replace(/^@/, "");
  s = s.split("?")[0].replace(/\/$/, "").split("/")[0];
  return s;
}

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CLIENTS_KEY = "sdr:clients";

export async function getClients() {
  const data = await redis.get(CLIENTS_KEY);
  return data || [];
}

export async function saveClients(clients) {
  await redis.set(CLIENTS_KEY, clients);
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

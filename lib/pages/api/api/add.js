import { getClients, saveClients, normalizeHandle } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { entries } = req.body; // [{ name, handle }]
  if (!entries || !Array.isArray(entries)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const clients = await getClients();
  const existingHandles = new Set(clients.map((c) => c.handle));

  let added = 0;
  let skipped = 0;

  for (const entry of entries) {
    const handle = normalizeHandle(entry.handle || entry.name);
    if (!handle) continue;
    if (existingHandles.has(handle)) { skipped++; continue; }
    clients.push({
      name: entry.name?.trim() || handle,
      handle,
      addedAt: new Date().toISOString(),
    });
    existingHandles.add(handle);
    added++;
  }

  await saveClients(clients);
  return res.status(200).json({ added, skipped, total: clients.length });
}

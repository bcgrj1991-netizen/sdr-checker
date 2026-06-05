import { getClients, saveClients } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();
  const { handle } = req.body;
  if (!handle) return res.status(400).json({ error: "Missing handle" });

  const clients = await getClients();
  const updated = clients.filter((c) => c.handle !== handle);
  await saveClients(updated);
  return res.status(200).json({ total: updated.length });
}

import { getClients, normalizeHandle } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { handles } = req.body;
  if (!handles || !Array.isArray(handles)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const clients = await getClients();
  const clientMap = {};
  for (const c of clients) clientMap[c.handle] = c;

  const results = handles.map((raw) => {
    const handle = normalizeHandle(raw);
    const match = clientMap[handle];
    return {
      input: raw,
      handle,
      isClient: !!match,
      clientData: match || null,
    };
  });

  return res.status(200).json({ results });
}

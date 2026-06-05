import { getClients } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const clients = await getClients();
    return res.status(200).json({ clients });
  }
  res.status(405).end();
}

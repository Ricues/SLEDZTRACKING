export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  let number = "";
  if (req.method === "GET") {
    number = req.query.number;
  } else {
    try {
      if (req.headers["content-type"]?.includes("application/json")) {
        number = req.body.number || req.body.trackingNumber;
      } else {
        const raw = await streamToString(req);
        const parsed = JSON.parse(raw || "{}");
        number = parsed.number || parsed.trackingNumber;
      }
    } catch {}
  }

  if (!number) return res.status(400).json({ error: "Missing 'number' parameter" });

  try {
    const apiRes = await fetch("https://frosireps.eu/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber: number }),
    });
    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf-8");
}

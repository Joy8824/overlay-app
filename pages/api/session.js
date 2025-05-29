export default async function handler(req, res) {
  const { session } = req.query;          // ?session=12345678
  if (!session) {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  const resp = await fetch(
    `https://hook.us2.make.com/abc123?sessionId=${session}`
  );

  if (!resp.ok) {
    const txt = await resp.text();
    console.error('Make error:', txt);
    return res.status(500).json({ error: 'Webhook failed' });
  }

  const data = await resp.json();
  res.status(200).json(data);
}

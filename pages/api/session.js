export default async function handler(req, res) {
  const { session } = req.query;
  if (!session) return res.status(400).json({ error: 'Missing session ID' });

  const resp = await fetch(
    `https://hook.us2.make.com/29wwylk0jb47wa7tu5iriqir5apkp2j0?sessionId=${session}`
  );

  if (!resp.ok) {
    const txt = await resp.text();
    console.error('Make error:', txt);
    return res.status(500).json({ error: 'Webhook failed' });
  }

  // read once
  const data = await resp.json();
  res.status(200).json(data);
}

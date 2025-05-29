export default async function handler(req, res) {
  const { session } = req.query; // ?session=12345678
  if (!session) {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  const resp = await fetch(
    `https://hook.us2.make.com/29wwylk0jb47wa7tu5iriqir5apkp2j0?sessionId=${session}`
  );

  if (!resp.ok) {
    const txt = await resp.text();
    console.error('Make error:', txt);
    return res.status(500).json({ error: 'Webhook failed' });
  }

  // Try parsing JSON but fallback gracefully
  let data;
  try {
    data = await resp.json();
  } catch (e) {
    const txt = await resp.text();
    console.warn('Non-JSON response from Make:', txt);
    return res.status(500).json({ error: 'Invalid data returned from webhook' });
  }

  res.status(200).json(data);
}

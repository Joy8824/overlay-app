export default async function handler(req, res) {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'Missing session ID' });

  const resp = await fetch(`https://hook.us2.make.com/s0n9gbnzbh2on44e2329v5llt6lqgi3f?sessionId=${sessionId}`);
  const text = await resp.text();

    if (!text || text === 'Accepted') {
    return res.status(500).json({
      error: 'Make scenario did not return JSON. Check webhook response module.',
      details: text
    });
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return res.status(500).json({
      error: 'Invalid JSON returned from webhook',
      raw: text
    });
  }

  res.status(200).json(data);
}

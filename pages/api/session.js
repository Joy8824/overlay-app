export default async function handler(req, res) {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId ID' });

  const resp = await fetch(
    `https://hook.us2.make.com/s0n9gbnzbh2on44e2329v5llt6lqgi3f?sessionId=${sessionId}`
    
  );

  // read once
  const raw = await resp.text();

  let data;
  try {
    data = JSON.parse(raw); // will work only if Make returned JSON
  } catch {
    console.warn('Non-JSON response from Make:', raw);
    return res.status(500).json({ error: 'Invalid JSON returned from webhook', raw });
  }

  res.status(200).json(data);
}

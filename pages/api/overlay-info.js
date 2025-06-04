export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId in request body.' });
  }

  try {
    const response = await fetch(
      `https://hook.us2.make.com/s0n9gbnzbh2on44e2329v5llt6lqgi3f?sessionId=${sessionId}`
    );
    const data = await response.json();

    // You should be returning an array from Make:
    // { overlayData: [ {...}, {...} ] }
    if (!Array.isArray(data.overlayData)) {
      return res.status(500).json({ error: 'Invalid response format from Make.' });
    }

    res.status(200).json(data.overlayData);
  } catch (err) {
    console.error('Overlay info error:', err); // <--- Already there
    return res.status(500).json({
      error: 'Failed to fetch overlay data.',
      details: err.message || err.toString(),
    });
  }


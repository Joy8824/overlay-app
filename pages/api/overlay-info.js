export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { sessionId } = req.body;
  console.log(' /api/overlay-info called with sessionId:', sessionId);

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId in request body.' });
  }

  try {
    const response = await fetch(
      `https://hook.us2.make.com/nm18xa6oshfhds9s0iim7v6ccy2xsi63?sessionId=${sessionId}`
    );

    const text = await response.text();
    console.log(' Make response text:', text); // <-- Add this

    // Check for bad response (e.g., "Accepted")
    if (!text || text === 'Accepted') {
      return res.status(500).json({
        error: 'Make scenario did not return JSON. Check webhook response module.',
        details: text
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'Failed to parse JSON from Make webhook.',
        details: text
      });
    }

    // Check if we got the expected overlayData array
    if (!Array.isArray(data.overlayData)) {
      return res.status(500).json({ error: 'Invalid response format from Make.', raw: data });
    }

    res.status(200).json(data.overlayData);
  } catch (err) {
    console.error('Overlay info error:', err);
    return res.status(500).json({
      error: 'Failed to fetch overlay data.',
      details: err.message || err.toString(),
    });
  }
}

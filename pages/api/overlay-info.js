// Temporary in-memory store (resets on every Vercel deployment or server restart)
//const overlayStore = new Map();
// Use globalThis to persist in-memory store across requests (if warm)
globalThis.__overlayStore = globalThis.__overlayStore || new Map();
const overlayStore = globalThis.__overlayStore;


export function saveOverlay(sessionId, overlay) {
  const existing = overlayStore.get(sessionId) || [];
  overlayStore.set(sessionId, [...existing, overlay]);

  console.log(`Saved overlay for session [${sessionId}]`); //delete later
  console.log(`Overlay store now has ${overlayStore.get(sessionId).length} items`);   //delete later
  
}

export function getOverlay(sessionId) {
  return overlayStore.get(sessionId) || [];
}

export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    // Fetch overlay data only
    const sessionId = req.query.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('MAKE_WEBHOOK_URL is not defined');
      return res.status(500).json({ error: 'Missing Make webhook URL' });
    }

    try {
      const makeRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action: 'getOverlay' }),
      });

      const text = await makeRes.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Make webhook did not return JSON:', text);
        return res.status(500).json({ error: 'Invalid response from Make webhook' });
      }

      if (!data || !data.overlayData || data.overlayData.length === 0) {
        return res.status(200).json([]);
      }

      return res.status(200).json(data.overlayData);
    } catch (error) {
      console.error('Error fetching overlay data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (method === 'POST') {
    // Save/update overlay data (process upload)
    const body = req.body;
    if (!body || !body.sessionId) {
      return res.status(400).json({ error: 'Missing sessionId in POST body' });
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('MAKE_WEBHOOK_URL is not defined');
      return res.status(500).json({ error: 'Missing Make webhook URL' });
    }

    try {
      // Pass full posted body to Make webhook for processing overlay/save
      const makeRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const text = await makeRes.text();

      // Optionally parse and validate Make response here
      // For now just return a success message
      return res.status(200).json({ message: 'Overlay processed' });
    } catch (error) {
      console.error('Error processing overlay data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

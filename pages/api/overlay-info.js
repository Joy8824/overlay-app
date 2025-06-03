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
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    const makeRes = await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await makeRes.json();

    if (!data || !data.overlayData || data.overlayData.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(data.overlayData);
  } catch (error) {
    console.error('Error fetching overlay data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

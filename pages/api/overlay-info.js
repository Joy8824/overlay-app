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

export default function handler(req, res) {
  const { sessionId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET method allowed.' });
  }

  if (!session) {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  const overlays = getOverlay(session);
  return res.status(200).json({overlays});
}

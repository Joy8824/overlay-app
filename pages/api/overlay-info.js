// Temporary in-memory store (resets on every Vercel deployment or server restart)
const overlayStore = new Map();

export function saveOverlay(sessionId, overlay) {
  const existing = overlayStore.get(sessionId) || [];
  overlayStore.set(sessionId, [...existing, overlay]);
}

export function getOverlay(sessionId) {
  return overlayStore.get(sessionId) || [];
}

export default function handler(req, res) {
  const { session } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET method allowed.' });
  }

  if (!session) {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  const overlays = getOverlay(session);
  return res.status(200).json({overlays});
}

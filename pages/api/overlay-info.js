

const DROPBOX_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
if (!DROPBOX_TOKEN) {
  throw new Error('Missing Dropbox access token');
}

const DROPBOX_FOLDER = '/Overlays';

/**
 * Fetch overlays for a session from Dropbox
 */
export async function getOverlay(sessionId) {
  const path = `${DROPBOX_FOLDER}/${sessionId}.json`;

  const response = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DROPBOX_TOKEN}`,
      'Dropbox-API-Arg': JSON.stringify({ path }),
    },
  });

  if (response.ok) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn(`Invalid JSON for session ${sessionId}:`, e);
      return [];
    }
  } else if (response.status === 409) {
    // File not found, return empty list
    return [];
  } else {
    const text = await response.text();
    throw new Error(`Failed to fetch overlay data: ${text}`);
  }
}

/**
 * Save or update an overlay for a session
 */
export async function saveOverlay(sessionId, newOverlay) {
  const currentOverlays = await getOverlay(sessionId);

  // Append new overlay (you could also check for duplicates if needed)
  currentOverlays.push(newOverlay);

  const uploadRes = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DROPBOX_TOKEN}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: `${DROPBOX_FOLDER}/${sessionId}.json`,
        mode: 'overwrite',
        mute: true,
      }),
    },
    body: JSON.stringify(currentOverlays),
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`Dropbox upload failed: ${text}`);
  }

  console.log(`Overlay for session ${sessionId} updated in Dropbox`);
}

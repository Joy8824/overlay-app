export default async function handler(req, res) {
  const { sessionId } = req.query;
  if (!sessionId) {
    console.log('Missing sessionId');
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    const makeResp = await fetch(
      `https://hook.us2.make.com/s0n9gbnzbh2on44e2329v5llt6lqgi3f?sessionId=${sessionId}`
    );

    const status = makeResp.status;
    const raw = await makeResp.text();

    console.log('Make response status:', status);
    console.log('Make response raw:', raw);

    if (status >= 400 || !raw || raw === 'Accepted') {
      return res.status(500).json({
        error: 'Make scenario did not return valid JSON',
        details: raw
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to parse JSON from Make webhook',
        details: raw
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Fetch failed:', err);
    return res.status(500).json({ error: 'Unexpected error', details: err.message });
  }
}

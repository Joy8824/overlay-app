export default async function handler(req, res) {
  const { session } = req.query;
  if (!session) return res.status(400).json({ error: 'Missing session ID' });

  const resp = await fetch(
    `https://hook.us2.make.com/29wwylk0jb47wa7tu5iriqir5apkp2j0?sessionId=${session}`
  );

  // read once
  const raw = await resp.text();

  let data;
  try {
    data = JSON.parse(raw);          // will work only if Make returned JSONAdd commentMore actions
  } catch {
    console.warn('Non-JSON response from Make:', raw);
    return res
      .status(500)
      .json({ error: 'Invalid JSON returned from webhook', raw });
  }

  res.status(200).json(data);
}

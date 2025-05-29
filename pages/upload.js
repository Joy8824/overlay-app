'use client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Upload() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [info, setInfo] = useState(null);      // holds order & template data
  const [status, setStatus] = useState(null);  // uploading / ok / err
  const [msg, setMsg]     = useState('');

  // Fetch order/template info
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/session?session=${sessionId}`)
      .then(r => r.json())
      .then(setInfo)
      .catch(() => {
        setMsg('Could not load order info');
        setStatus('err');
      });
  }, [sessionId]);

  // Upload handler
  async function uploadFile(file) {
    setStatus('uploading');
    setMsg('');

    // TODO: Add file dimension check here using info.templateWidth / templateHeight

    try {
      // TEMP SIMULATION: Just wait 1 second and pretend upload worked
      await new Promise(res => setTimeout(res, 1000));

      setStatus('ok');
      setMsg('Upload successful!');
    } catch (err) {
      console.error(err);
      setStatus('err');
      setMsg('Upload failed.');
    }
  }

  if (!info) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Loading…</p>;

  return (
    <div style={{
      maxWidth: 480,
      margin: '60px auto',
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <h2>Upload Artwork – {info.productTitle}</h2>
      <p>Qty ordered: {info.quantity}</p>

      {status !== 'ok' && (
        <>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])}
            style={{ marginTop: '20px' }}
          />
          {status === 'uploading' && <p>Uploading… please wait.</p>}
        </>
      )}

      {status && <p style={{ color: status === 'err' ? 'red' : 'green', marginTop: '20px' }}>{msg}</p>}
    </div>
  );
}

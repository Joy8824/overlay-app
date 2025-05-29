'use client';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function Upload() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [info, setInfo] = useState(null);      // holds order & template data
  const [status, setStatus] = useState(null);  // uploading / ok / err
  const [msg, setMsg] = useState('');

  const fileInputRef = useRef(); // 👈 ref for the file input

  // Fetch order info on mount
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/session?session=${sessionId}`)
      .then(r => r.json())
      .then(setInfo)
      .catch(() => setMsg('Could not load order info'));
  }, [sessionId]);

  // Open file picker when info is loaded
  useEffect(() => {
    if (info && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [info]);

  async function uploadFile(file) {
    setStatus('uploading');
    setMsg('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    try {
      const resp = await fetch('https://hook.us2.make.com/hx7z2noyx2vxku96ss7x9ojxwfuyrog9', {
        method: 'POST',
        body: formData,
      });

      const result = await resp.json();

      if (resp.ok) {
        setStatus('ok');
        setMsg('Upload successful! Processing your file.');
      } else {
        setStatus('err');
        setMsg(result?.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('err');
      setMsg('Something went wrong while uploading.');
    }
  }

  if (!info) return <p>Loading…</p>;

  const { product, qty } = info;

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>Upload Artwork – {product}</h2>
      <p>Qty ordered: {qty}</p>

      {status !== 'ok' && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])}
          />
          {status === 'uploading' && <p>Uploading… please wait.</p>}
        </>
      )}

      {status && <p style={{ color: status === 'err' ? 'red' : 'green' }}>{msg}</p>}
    </div>
  );
}

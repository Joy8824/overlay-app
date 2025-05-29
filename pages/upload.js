'use client';
import { useState } from 'react';

export default function Upload() {
  const [status, setStatus] = useState(null); // 'uploading' | 'ok' | 'err'
  const [msg, setMsg] = useState('');

  const params = typeof window !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
  const order = params.get('order');
  const product = params.get('product');
  const qty = params.get('qty');

  const uploadFile = async (file) => {
    setStatus('uploading');

    // TEMP: Simulate successful upload
    setTimeout(() => {
      setStatus('ok');
      setMsg('File ready to upload (this is just a test page!)');
    }, 1000);
  };

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>Upload Artwork – {product}</h2>
      <p>Qty ordered: {qty}</p>

      {status !== 'ok' && (
        <>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])}
          />
          {status === 'uploading' && <p>Uploading… please wait.</p>}
        </>
      )}

      {status && <p style={{ color: status === 'err' ? 'red' : 'green' }}>{msg}</p>}
    </div>
  );
}

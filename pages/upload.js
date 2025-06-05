
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

export default function Upload() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [info, setInfo] = useState(null);      // holds order & template data
  const [status, setStatus] = useState(null);  // uploading / ok / err
  const [msg, setMsg] = useState('');

  const fileInputRef = useRef(); //  ref for the file input

  // Fetch order info on mount
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/session?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(setInfo)
      .catch(() => setMsg('Could not load order info'));
  }, [sessionId]);
//  ---- remove the auto button oppener --- //
  // Open file picker when info is loaded
//  useEffect(() => {
  //  if (info && fileInputRef.current) {
   //   fileInputRef.current.click();
  //  }
 // }, [info]);

  
  async function uploadFile(file) {
    setStatus('uploading');
    setMsg('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    try {
      const resp = await fetch('https://hook.us2.make.com/s0n9gbnzbh2on44e2329v5llt6lqgi3f', {
        method: 'POST',
        body: formData,
      });
      
      let resultText = await resp.text(); // grab raw response in case it’s not JSON
      let result;
      
      try {
        result = JSON.parse(resultText);
      } catch {
        result = { error: resultText }; // fallback if not JSON
      }
      
      if (resp.ok) {
        setStatus('ok');
<<<<<<< HEAD
<<<<<<< HEAD
        setMsg('Upload successful! Processing your file…');
        // Wait 5 seconds before redirecting
  
        setTimeout(() => {
          router.push(`/overlay?sessionId=${sessionId}`);
        }, 5000); // 5 seconds
      }else {
        setMsg('File uploaded but overlay not ready yet. Try refreshing in a moment.');
          }
        };
        checkOverlayData();
=======
        setMsg('Upload successful! Processing your file.');
>>>>>>> parent of db6d95d (Update upload.js)
=======
        setMsg('Upload successful! Processing your file.');
>>>>>>> parent of db6d95d (Update upload.js)

        //wait 5 seconds before redirecting
        setTimeout(() => {
          router.push('/overlay?sessionId=${sessionId}');
        }, 5000); //5 seconds
      } else {
        console.error('Upload failed:', result);
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
             
              <button onClick={() => fileInputRef.current?.click()}>
                Choose file
              </button>

          {status === 'uploading' && <p>Uploading… please wait.</p>}
        </>
      )}

      {status && <p style={{ color: status === 'err' ? 'red' : 'green' }}>{msg}</p>}
    </div>
  );
}

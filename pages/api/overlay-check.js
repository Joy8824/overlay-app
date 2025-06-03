import sharp from 'sharp';
import { saveOverlay } from './overlay-info.js'; // Adjust path if needed

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method is allowed.' });
  }

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const { customerFileUrl, templateUrl } = req.body;

  if (!customerFileUrl || !templateUrl) {
    return res.status(400).json({ error: 'Missing customerFileUrl or templateUrl.' });
  }

  try {
    // Fetch both files
    const [customerRes, templateRes] = await Promise.all([
      fetch(customerFileUrl),
      fetch(templateUrl),
    ]);

    if (!customerRes.ok || !templateRes.ok) {
      return res.status(400).json({ error: 'Failed to fetch one or both files.' });
    }

    // Check content type
    const contentType = customerRes.headers.get('content-type');
    if (!['image/png', 'image/jpeg'].includes(contentType)) {
      return res.status(400).json({ error: 'Only PNG or JPG image files are supported at this time.' });
    }

    // Convert responses to buffers
    const [customerBuffer, templateBuffer] = await Promise.all([
      customerRes.arrayBuffer(),
      templateRes.arrayBuffer(),
    ]);

    // Get sizes
    const customerSize = await getImageSize(customerBuffer);
    const templateSize = await getImageSize(templateBuffer);

    const sizesMatch =
      customerSize.width === templateSize.width &&
      customerSize.height === templateSize.height;

    if (!sizesMatch) {
      return res.status(200).json({
        sizeCheckPassed: false,
        errorMessage: 'Size mismatch between graphic and template.',
        customerSize,
        templateSize,
      });
    }

    // Overlay template onto customer image
    const compositeBuffer = await sharp(Buffer.from(customerBuffer))
      .composite([{ input: Buffer.from(templateBuffer), blend: 'over', opacity: 0.5 }])
      .png()
      .toBuffer();

    const base64Image = compositeBuffer.toString('base64');
    const overlayDataUrl = `data:image/png;base64,${base64Image}`;
    
    saveOverlay(req.body.sessionId, {
      fileName: req.body.fileName,
      productName: req.body.productName,
      customerFileUrl,
      overlayImageUrl: overlayDataUrl,
      fileId: 'TODO: your unique file id if needed',
    });
    console.log('Saved overlay for session', sessionId) //delete later

    return res.status(200).json({
      sizeCheckPassed: true,
      overlayDataUrl,
      customerSize,
      templateSize,
    });

  } catch (err) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

async function getImageSize(buffer) {
  const metadata = await sharp(Buffer.from(buffer)).metadata();
  return { width: metadata.width, height: metadata.height };
}


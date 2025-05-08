import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { customerFileUrl, templateUrl } = req.body;
    if (!customerFileUrl || !templateUrl) {
      return res.status(400).json({ error: 'Missing parameters.' });
    }

    const customerRes = await fetch(customerFileUrl);
    const templateRes = await fetch(templateUrl);

    if (!customerRes.ok || !templateRes.ok) {
      return res.status(400).json({ error: 'Failed to fetch files.' });
    }
    
    const customerBuffer = await customerRes.buffer();
    const templateBuffer = await templateRes.buffer();

    const customerType = customerFileUrl.split('.').pop().split('?')[0].toLowerCase(); 

    const customerSize = customerType === 'pdf'
      ? await getPDFSize(customerBuffer)
      : await getImageSize(customerBuffer);

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

    const composite = await sharp(customerBuffer)
      .composite([{ input: templateBuffer, blend: 'over', opacity: 0.5 }])
      .toBuffer();

    const base64Image = composite.toString('base64');
    const overlayDataUrl = `data:image/png;base64,${base64Image}`;

    return res.status(200).json({
      sizeCheckPassed: true,
      overlayDataUrl,
      customerSize,
      templateSize,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getImageSize(buffer) {
  const metadata = await sharp(buffer).metadata();
  return { width: metadata.width, height: metadata.height };
}

async function getPDFSize(buffer) {
  const pdfDoc = await PDFDocument.load(buffer);
  const page = pdfDoc.getPage(0);
  const { width, height } = page.getSize();
  return { width: Math.round(width), height: Math.round(height) };
}

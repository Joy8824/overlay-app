import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import pdfToPng from 'pdf-to-png-converter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  try {
    const { customerFileUrl, templateUrl } = req.body;
    console.log('Received URLs:', { customerFileUrl, templateUrl });

    if (!customerFileUrl || !templateUrl) {
      console.error('Missing parameters');
      return res.status(400).json({ error: 'Missing parameters.' });
    }

    const customerRes = await fetch(customerFileUrl);
    const templateRes = await fetch(templateUrl);

    console.log('Fetched customer file:', customerRes.status);
    console.log('Fetched template file:', templateRes.status);

    if (!customerRes.ok || !templateRes.ok) {
      return res.status(400).json({ error: 'Failed to fetch files.' });
    }

    const customerBuffer = await customerRes.arrayBuffer();
    const templateBuffer = await templateRes.arrayBuffer();

    const customerType = customerFileUrl.split('.').pop().split('?')[0].toLowerCase();
    console.log('Customer file type:', customerType);

    const customerSize = customerType === 'pdf'
      ? await getPDFSize(customerBuffer)
      : await getImageSize(customerBuffer);

    const templateSize = await getImageSize(templateBuffer);
    console.log('Sizes:', { customerSize, templateSize });

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

    let overlayDataUrl;

    if (customerType === 'pdf') {
      const pngPages = await pdfToPng(Buffer.from(customerBuffer), {
        page: 1,
        viewportScale: 2.0,
        returnFileBuffer: true,
      });

      const pdfImageBuffer = pngPages[0].content;

      const composite = await sharp(pdfImageBuffer)
        .composite([{ input: Buffer.from(templateBuffer), blend: 'over', opacity: 0.5 }])
        .toBuffer();

      const base64Image = composite.toString('base64');
      overlayDataUrl = `data:image/png;base64,${base64Image}`;
    } else {
      const composite = await sharp(Buffer.from(customerBuffer))
        .composite([{ input: Buffer.from(templateBuffer), blend: 'over', opacity: 0.5 }])
        .toBuffer();

      const base64Image = composite.toString('base64');
      overlayDataUrl = `data:image/png;base64,${base64Image}`;
    }

    return res.status(200).json({
      sizeCheckPassed: true,
      overlayDataUrl,
      customerSize,
      templateSize,
    });

  } catch (error) {
    console.error('Unhandled error:', error);
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

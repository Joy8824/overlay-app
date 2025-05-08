import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

export default async function handler(req, res) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  // if json body is incorrect when HTTP calls for it
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid JSON body.'});
  }

  try {
    // Destructure the request body for customerFileUrl and templateUrl
    const { customerFileUrl, templateUrl } = req.body;

    // Ensure both parameters are present in the body
    if (!customerFileUrl || !templateUrl) {
      return res.status(400).json({ error: 'Missing parameters.' });
    }

    // Fetch the customer file and template file
    const customerRes = await fetch(customerFileUrl);
    const templateRes = await fetch(templateUrl);

    // Check if the fetch requests were successful
    if (!customerRes.ok || !templateRes.ok) {
      return res.status(400).json({ error: 'Failed to fetch files.' });
    }

    // Convert the fetched files into buffers
    const customerBuffer = await customerRes.buffer();
    const templateBuffer = await templateRes.buffer();

    // Get the type of the customer file (image or pdf)
    const customerType = customerFileUrl.split('.').pop().split('?')[0].toLowerCase();

    // Get the size of the customer file (either PDF or image)
    const customerSize = customerType === 'pdf'
      ? await getPDFSize(customerBuffer)
      : await getImageSize(customerBuffer);

    // Get the size of the template image
    const templateSize = await getImageSize(templateBuffer);

    // Check if the sizes match
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

    // Composite the customer image with the template using Sharp
    const composite = await sharp(customerBuffer)
      .composite([{ input: templateBuffer, blend: 'over', opacity: 0.5 }])
      .toBuffer();

    // Convert the composite image to base64
    const base64Image = composite.toString('base64');
    const overlayDataUrl = `data:image/png;base64,${base64Image}`;

    // Send the success response with the overlay data
    return res.status(200).json({
      sizeCheckPassed: true,
      overlayDataUrl,
      customerSize,
      templateSize,
    });

  } catch (error) {
    // Catch any errors and return a 500 response
    return res.status(500).json({ error: error.message });
  }
}

// Function to get image size (width and height) using Sharp
async function getImageSize(buffer) {
  const metadata = await sharp(buffer).metadata();
  return { width: metadata.width, height: metadata.height };
}

// Function to get PDF size (width and height) using pdf-lib
async function getPDFSize(buffer) {
  const pdfDoc = await PDFDocument.load(buffer);
  const page = pdfDoc.getPage(0);
  const { width, height } = page.getSize();
  return { width: Math.round(width), height: Math.round(height) };
}

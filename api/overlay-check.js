// comments

import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import fetch from 'node-fetch';

export const config = {
  runtime: 'edge',
};

async function getImageSize(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return { width: metadata.width, height: metadata.height };
  } catch (e) {
    throw new Error('Failed to get image metadata.');
  }
}

async function getPDFSize(buffer) {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();
    return { width: Math.round(width), height: Math.round(height) };
  } catch (e) {
    throw new Error('Failed to get PDF size.');
  }
}

async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch file.');
  return Buffer.from(await response.arrayBuffer());
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Only POST allowed' }, { status: 405 });
  }

  try {
    const { customerFileUrl, templateUrl } = await req.json();
    if (!customerFileUrl || !templateUrl) {
      return NextResponse.json({ error: 'Missing parameters.' }, { status: 400 });
    }

    const customerBuffer = await fetchBuffer(customerFileUrl);
    const templateBuffer = await fetchBuffer(templateUrl);

    const customerType = customerFileUrl.split('.').pop().toLowerCase();
    const templateType = templateUrl.split('.').pop().toLowerCase();

    const customerSize = customerType === 'pdf'
      ? await getPDFSize(customerBuffer)
      : await getImageSize(customerBuffer);

    const templateSize = await getImageSize(templateBuffer);

    const sizesMatch =
      customerSize.width === templateSize.width &&
      customerSize.height === templateSize.height;

    if (!sizesMatch) {
      return NextResponse.json({
        sizeCheckPassed: false,
        errorMessage: 'Size mismatch between graphic and template.',
        customerSize,
        templateSize,
      });
    }

    // Overlay image using sharp (opacity ~0.5 for template)
    const composite = await sharp(customerBuffer)
      .composite([{ input: templateBuffer, blend: 'over', opacity: 0.5 }])
      .toBuffer();

    // Normally, you’d upload to Dropbox or S3 here, return URL
    // For now, we just base64 encode it (demo-only)
    const base64Image = composite.toString('base64');
    const overlayDataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({
      sizeCheckPassed: true,
      overlayDataUrl,
      customerSize,
      templateSize,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

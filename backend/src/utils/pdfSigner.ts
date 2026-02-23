// backend/src/utils/pdfSigner.ts
import { PDFDocument } from 'pdf-lib';

export const stampSignatureOnPdf = async (
  pdfBuffer: ArrayBuffer,
  signatureBuffer: ArrayBuffer,
  pageNumber: number,
  frontendX: number,
  frontendY: number
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const signatureImage = await pdfDoc.embedPng(signatureBuffer);
  
  const pages = pdfDoc.getPages();
  const page = pages[pageNumber - 1];
  
  // 1. Get true dimensions of this specific PDF page
  const { width: pdfWidth, height: pdfHeight } = page.getSize();
  
  // 2. Calculate scaling ratio (Frontend was fixed to 600px wide)
  const scaleRatio = pdfWidth / 600;
  
  // 3. Translate frontend pixels to actual PDF points
  const scaledX = frontendX * scaleRatio;
  const scaledY = frontendY * scaleRatio;
  
  // Scale the signature image size proportionally
  const sigWidth = 150 * scaleRatio;
  const sigHeight = 50 * scaleRatio;
  
  // 4. Invert Y axis (PDF 0,0 is bottom-left, Web 0,0 is top-left)
  let finalX = scaledX;
  let finalY = pdfHeight - scaledY - sigHeight; 

  // 5. CLAMPING: This guarantees the signature literally cannot be drawn off-screen
  finalX = Math.max(0, Math.min(finalX, pdfWidth - sigWidth));
  finalY = Math.max(0, Math.min(finalY, pdfHeight - sigHeight));

  console.log(`SUCCESS: Stamping at PDF Coordinates X:${finalX}, Y:${finalY}`);

  // Draw the image onto the page
  page.drawImage(signatureImage, {
    x: finalX,
    y: finalY,
    width: sigWidth,
    height: sigHeight,
  });

  pdfDoc.setAuthor('DocSigner App');
  pdfDoc.setModificationDate(new Date());

  return await pdfDoc.save();
};
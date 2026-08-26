import { PDFDocument, PDFPage, degrees } from 'pdf-lib';
import { ImageFileItem, ImageToPdfOptions } from '@/types/pdf';
import { readFileAsArrayBuffer } from '../utils';

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612.0, height: 792.0 },
};

const MARGINS = {
  none: 0,
  small: 20,
  large: 40,
};

async function convertImageToStandardBytes(
  file: File,
  rotation: number = 0
): Promise<{ bytes: Uint8Array; type: 'jpeg' | 'png'; width: number; height: number }> {
  // If no rotation and standard format, read directly
  if (rotation === 0 && (file.type === 'image/jpeg' || file.type === 'image/png')) {
    const buffer = await readFileAsArrayBuffer(file);
    const isPng = file.type === 'image/png';
    
    // Get dimensions via temporary Image element
    const dims = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = URL.createObjectURL(file);
    });

    return {
      bytes: new Uint8Array(buffer),
      type: isPng ? 'png' : 'jpeg',
      width: dims.width,
      height: dims.height,
    };
  }

  // Draw on canvas to handle rotation & WebP/GIF/HEIC to clean JPEG
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas context unavailable'));
      }

      const rad = (rotation * Math.PI) / 180;
      const isRotated90or270 = rotation === 90 || rotation === 270;

      canvas.width = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      canvas.height = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            canvas.width = 0;
            canvas.height = 0;
            return reject(new Error('Canvas to blob conversion failed'));
          }
          const buf = await blob.arrayBuffer();
          const w = canvas.width;
          const h = canvas.height;
          canvas.width = 0;
          canvas.height = 0;
          resolve({
            bytes: new Uint8Array(buf),
            type: 'jpeg',
            width: w,
            height: h,
          });
        },
        'image/jpeg',
        0.94
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

export async function convertImagesToPdf(
  images: ImageFileItem[],
  options: ImageToPdfOptions,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob> {
  if (images.length === 0) {
    throw new Error('No images selected for PDF conversion.');
  }

  const pdfDoc = await PDFDocument.create();
  const total = images.length;
  const margin = MARGINS[options.margin];

  for (let i = 0; i < total; i++) {
    const item = images[i];
    if (onProgress) {
      onProgress(i + 1, total, `Processing image ${i + 1} of ${total} (${item.name})...`);
    }

    const { bytes, type, width: imgW, height: imgH } = await convertImageToStandardBytes(
      item.file,
      item.rotation
    );

    const embeddedImage = type === 'png' 
      ? await pdfDoc.embedPng(bytes) 
      : await pdfDoc.embedJpg(bytes);

    let pageWidth = 0;
    let pageHeight = 0;

    if (options.pageSize === 'fit') {
      pageWidth = imgW + margin * 2;
      pageHeight = imgH + margin * 2;
    } else {
      const stdSize = PAGE_SIZES[options.pageSize];
      let w = stdSize.width;
      let h = stdSize.height;

      if (options.orientation === 'landscape' || (options.orientation === 'auto' && imgW > imgH)) {
        w = stdSize.height;
        h = stdSize.width;
      }
      pageWidth = w;
      pageHeight = h;
    }

    const page: PDFPage = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate image position within page respecting margins and aspect ratio
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    const scaleFactor = Math.min(availableWidth / imgW, availableHeight / imgH);
    const drawWidth = imgW * scaleFactor;
    const drawHeight = imgH * scaleFactor;

    const x = margin + (availableWidth - drawWidth) / 2;
    const y = margin + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  if (onProgress) {
    onProgress(total, total, 'Compiling and saving PDF document...');
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}

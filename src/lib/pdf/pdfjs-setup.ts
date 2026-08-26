import * as pdfjsLib from 'pdfjs-dist';

let isWorkerInitialized = false;

export function initPdfJs(): typeof pdfjsLib {
  if (typeof window === 'undefined') {
    return pdfjsLib;
  }

  if (!isWorkerInitialized) {
    try {
      // Prioritize local static worker for offline PWA support, fallback to reliable cdnjs
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      isWorkerInitialized = true;
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
      isWorkerInitialized = true;
    }
  }

  return pdfjsLib;
}

export async function loadPdfDocument(data: ArrayBuffer | Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
  const pdf = initPdfJs();
  const loadingTask = pdf.getDocument({
    data: new Uint8Array(data),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

export async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 0.8,
  rotation: number = 0
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  
  // Calculate viewport with optional additional rotation
  const totalRotation = (page.rotate + rotation) % 360;
  const viewport = page.getViewport({ scale, rotation: totalRotation });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });

  if (!context) {
    throw new Error('Failed to get 2D canvas context');
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  // Render white background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

  // Immediate canvas memory release
  canvas.width = 0;
  canvas.height = 0;

  return {
    dataUrl,
    width: viewport.width,
    height: viewport.height,
  };
}

export async function renderPageToBlob(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  scale: number = 2.0,
  quality: number = 0.92,
  rotation: number = 0
): Promise<Blob> {
  const page = await pdfDoc.getPage(pageNumber);
  const totalRotation = (page.rotate + rotation) % 360;
  const viewport = page.getViewport({ scale, rotation: totalRotation });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: format === 'image/png' });

  if (!context) {
    throw new Error('Failed to get 2D canvas context');
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  if (format !== 'image/png') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Free canvas memory
        canvas.width = 0;
        canvas.height = 0;
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      format,
      quality
    );
  });
}

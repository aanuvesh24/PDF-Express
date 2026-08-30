import JSZip from 'jszip';
import { loadPdfDocument, renderPageToBlob } from './pdfjs-setup';
import { PdfToImgOptions } from '@/types/pdf';

export interface ExportResult {
  blob: Blob;
  filename: string;
  isZip: boolean;
  totalImages: number;
}

export function parsePageRange(rangeStr: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);

      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(maxPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          pages.add(i);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= maxPages) {
        pages.add(p);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function exportPdfPagesToImages(
  sourceBuffer: ArrayBuffer | Uint8Array,
  baseFilename: string,
  options: PdfToImgOptions,
  selectedPageNumbers?: number[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<ExportResult> {
  const pdfDoc = await loadPdfDocument(sourceBuffer);
  const totalDocPages = pdfDoc.numPages;

  let targetPages: number[] = [];

  if (options.exportMode === 'all') {
    targetPages = Array.from({ length: totalDocPages }, (_, i) => i + 1);
  } else if (options.exportMode === 'selected' && selectedPageNumbers && selectedPageNumbers.length > 0) {
    targetPages = selectedPageNumbers;
  } else if (options.exportMode === 'range' && options.rangeText) {
    targetPages = parsePageRange(options.rangeText, totalDocPages);
  }

  if (targetPages.length === 0) {
    targetPages = Array.from({ length: totalDocPages }, (_, i) => i + 1);
  }

  const cleanBaseName = baseFilename.replace(/\.pdf$/i, '') || 'document';
  const ext = options.format === 'image/jpeg' ? 'jpg' : options.format === 'image/webp' ? 'webp' : 'png';

  // Single page export (download image directly)
  if (targetPages.length === 1) {
    const pageNum = targetPages[0];
    if (onProgress) onProgress(1, 1, `Rendering high-res page ${pageNum}...`);

    const imageBlob = await renderPageToBlob(
      pdfDoc,
      pageNum,
      options.format,
      options.scale,
      options.quality
    );

    return {
      blob: imageBlob,
      filename: `${cleanBaseName}_page_${pageNum}.${ext}`,
      isZip: false,
      totalImages: 1,
    };
  }

  // Multi-page export (package as ZIP)
  const zip = new JSZip();
  const folder = zip.folder(cleanBaseName) || zip;

  for (let i = 0; i < targetPages.length; i++) {
    const pageNum = targetPages[i];
    if (onProgress) {
      onProgress(i + 1, targetPages.length, `Rendering page ${pageNum} (${i + 1}/${targetPages.length})...`);
    }

    const imageBlob = await renderPageToBlob(
      pdfDoc,
      pageNum,
      options.format,
      options.scale,
      options.quality
    );

    const padDigits = Math.max(3, String(totalDocPages).length);
    const paddedIndex = String(pageNum).padStart(padDigits, '0');
    folder.file(`${cleanBaseName}_page_${paddedIndex}.${ext}`, imageBlob);
  }

  if (onProgress) onProgress(targetPages.length, targetPages.length, 'Compressing ZIP archive...');
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return {
    blob: zipBlob,
    filename: `${cleanBaseName}_images.zip`,
    isZip: true,
    totalImages: targetPages.length,
  };
}

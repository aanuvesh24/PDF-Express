import { PDFDocument, degrees } from 'pdf-lib';
import { PageItem } from '@/types/pdf';

export async function organizePdfDocument(
  sourceBuffer: ArrayBuffer | Uint8Array,
  pageItems: PageItem[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob> {
  const activePages = pageItems.filter((p) => !p.isDeleted);
  if (activePages.length === 0) {
    throw new Error('At least one page must be included in the output PDF.');
  }

  if (onProgress) onProgress(0, activePages.length, 'Loading source document...');

  const bufferCopy = sourceBuffer instanceof Uint8Array
    ? new Uint8Array(sourceBuffer)
    : new Uint8Array(sourceBuffer.slice(0));

  const srcDoc = await PDFDocument.load(bufferCopy, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  // Extract pages according to user defined order
  const pageIndicesToCopy = activePages.map((p) => p.originalPageIndex);
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndicesToCopy);

  for (let i = 0; i < copiedPages.length; i++) {
    const targetPage = copiedPages[i];
    const pageItem = activePages[i];

    // Apply rotation
    if (pageItem.rotation !== 0) {
      const baseRotation = targetPage.getRotation().angle || 0;
      const finalRotation = (baseRotation + pageItem.rotation) % 360;
      targetPage.setRotation(degrees(finalRotation));
    }

    newDoc.addPage(targetPage);

    if (onProgress) {
      onProgress(i + 1, activePages.length, `Assembling page ${i + 1} of ${activePages.length}...`);
    }
  }

  if (onProgress) onProgress(activePages.length, activePages.length, 'Generating final PDF bytes...');
  const pdfBytes = await newDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}

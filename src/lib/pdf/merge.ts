import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from '../utils';

export interface MergeInputFile {
  id: string;
  file: File;
  name: string;
}

export type MergeProgressCallback = (current: number, total: number, message: string) => void;

export async function mergePdfDocuments(
  files: MergeInputFile[],
  onProgress?: MergeProgressCallback
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('No PDF files selected for merging.');
  }

  const mergedDoc = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const item = files[i];
    if (onProgress) {
      onProgress(i + 1, total, `Reading & merging ${item.name}...`);
    }

    const buffer = await readFileAsArrayBuffer(item.file);
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);

    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  if (onProgress) {
    onProgress(total, total, 'Finalizing merged PDF...');
  }

  const pdfBytes = await mergedDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], {
    type: 'application/pdf',
  });
}

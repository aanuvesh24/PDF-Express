'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  ArrowLeft, 
  Plus, 
  FileCheck, 
  Download, 
  RotateCcw, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';
import { Dropzone } from '@/components/shared/Dropzone';
import { FileListSortable } from '@/components/pdf/FileListSortable';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ActionToolbar } from '@/components/shared/ActionToolbar';
import { PDFFileItem } from '@/types/pdf';
import { mergePdfDocuments } from '@/lib/pdf/merge';
import { loadPdfDocument } from '@/lib/pdf/pdfjs-setup';
import { downloadBlob, formatBytes, triggerConfetti, readFileAsArrayBuffer } from '@/lib/utils';

export default function MergePdfPage() {
  const [files, setFiles] = useState<PDFFileItem[]>([]);
  const [outputFilename, setOutputFilename] = useState('merged_document.pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: '', current: 0, total: 0 });
  const [mergedResult, setMergedResult] = useState<{ blob: Blob; size: number; pageCount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesAdded = async (newFiles: File[]) => {
    setErrorMessage(null);
    setMergedResult(null);

    const items: PDFFileItem[] = [];

    for (const file of newFiles) {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let pageCount = 0;

      try {
        const buffer = await readFileAsArrayBuffer(file);
        const doc = await loadPdfDocument(buffer);
        pageCount = doc.numPages;
      } catch (err) {
        console.warn('Could not extract page count preview for', file.name, err);
      }

      items.push({
        id,
        file,
        name: file.name,
        size: file.size,
        pageCount,
      });
    }

    setFiles((prev) => [...prev, ...items]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedResult(null);
  };

  const handleClearAll = () => {
    setFiles([]);
    setMergedResult(null);
    setErrorMessage(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMessage('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setMergedResult(null);
    setProgress({ percent: 10, stage: 'Preparing documents...', current: 0, total: files.length });

    try {
      const mergedBlob = await mergePdfDocuments(
        files.map((f) => ({ id: f.id, file: f.file, name: f.name })),
        (current, total, message) => {
          const pct = Math.round((current / total) * 90);
          setProgress({ percent: pct, stage: message, current, total });
        }
      );

      // Inspect result
      const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0);
      setMergedResult({
        blob: mergedBlob,
        size: mergedBlob.size,
        pageCount: totalPages,
      });
      setProgress({ percent: 100, stage: 'Merge completed successfully!', current: files.length, total: files.length });
      triggerConfetti();

      // Trigger automatic direct download
      downloadBlob(mergedBlob, outputFilename.endsWith('.pdf') ? outputFilename : `${outputFilename}.pdf`);
    } catch (err) {
      console.error('Merge error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during PDF merging.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSelectedPages = files.reduce((acc, f) => acc + f.pageCount, 0);
  const totalSelectedSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 ring-1 ring-indigo-500/20">
          Tool: Merge
        </span>
      </div>

      {/* Tool Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Merge PDF Files</h1>
            <p className="text-sm text-slate-400">
              Combine multiple PDFs in any custom sequence into a single unified document.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State / Initial Dropzone */}
      {files.length === 0 && (
        <div className="my-8">
          <Dropzone
            accept=".pdf,application/pdf"
            multiple={true}
            maxSizeMB={150}
            onFilesSelected={handleFilesAdded}
            title="Drop multiple PDF files here to merge"
            subtitle="Drag to reorder once uploaded &bull; Processed 100% in your browser"
          />
        </div>
      )}

      {/* File List & Controls */}
      {files.length > 0 && (
        <div className="space-y-6">
          {/* Summary & Add more banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
            <div>
              <h2 className="text-sm font-semibold text-white">Files in Merge Queue ({files.length})</h2>
              <p className="text-xs text-slate-400">
                Total size: {formatBytes(totalSelectedSize)} &bull; {totalSelectedPages} total pages
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
                <Plus className="h-3.5 w-3.5 text-indigo-400" />
                Add More PDFs
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={(e) => e.target.files && handleFilesAdded(Array.from(e.target.files))}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleClearAll}
                className="rounded-xl border border-slate-700/80 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Sortable File List */}
          <FileListSortable
            files={files}
            onReorder={setFiles}
            onRemove={handleRemoveFile}
          />

          {/* Configuration & Output Filename */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white mb-3">Output Settings</h3>
            <div className="max-w-md">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Output File Name
              </label>
              <input
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                placeholder="merged_document.pdf"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <ProgressBar
              progress={progress.percent}
              stage={progress.stage}
              current={progress.current}
              total={progress.total}
            />
          )}

          {/* Success Download Card */}
          {mergedResult && !isProcessing && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 backdrop-blur-md animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                    <FileCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Merge Successful!</h4>
                    <p className="text-xs text-emerald-300">
                      Output ready: {formatBytes(mergedResult.size)} &bull; {mergedResult.pageCount} pages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => downloadBlob(mergedResult.blob, outputFilename)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                  >
                    <Download className="h-4 w-4" /> Download Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <ActionToolbar
            itemCount={files.length}
            itemLabel="files to merge"
            actionText={`Merge ${files.length} PDFs`}
            onAction={handleMerge}
            onReset={handleClearAll}
            isLoading={isProcessing}
            disabled={files.length < 2}
          />
        </div>
      )}
    </div>
  );
}

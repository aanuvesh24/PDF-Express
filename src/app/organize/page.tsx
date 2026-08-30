'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Grid, 
  ArrowLeft, 
  RotateCw, 
  Trash2, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  FileCheck, 
  Download, 
  Sparkles,
  AlertCircle,
  FileDown,
  Layers
} from 'lucide-react';
import { Dropzone } from '@/components/shared/Dropzone';
import { SortablePageGrid } from '@/components/pdf/SortablePageGrid';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ActionToolbar } from '@/components/shared/ActionToolbar';
import { PageItem } from '@/types/pdf';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdf/pdfjs-setup';
import { organizePdfDocument } from '@/lib/pdf/organize';
import { downloadBlob, formatBytes, triggerConfetti, readFileAsArrayBuffer } from '@/lib/utils';

export default function OrganizePdfPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceBuffer, setSourceBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [initialPages, setInitialPages] = useState<PageItem[]>([]);
  const [outputFilename, setOutputFilename] = useState('');
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: '', current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<PageItem | null>(null);

  const handleFileSelected = async (selectedFiles: File[]) => {
    const file = selectedFiles[0];
    if (!file) return;

    setSourceFile(file);
    setOutputFilename(`organized_${file.name}`);
    setIsLoadingPages(true);
    setErrorMessage(null);
    setPages([]);
    setProgress({ percent: 5, stage: 'Reading PDF document...', current: 0, total: 1 });

    try {
      const buffer = await readFileAsArrayBuffer(file);
      setSourceBuffer(buffer);

      const doc = await loadPdfDocument(buffer);
      const totalPages = doc.numPages;
      const loadedPages: PageItem[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress({
          percent: Math.round((i / totalPages) * 90),
          stage: `Rendering thumbnail for page ${i} of ${totalPages}...`,
          current: i,
          total: totalPages,
        });

        const { dataUrl, width, height } = await renderPageToCanvas(doc, i, 0.75);

        loadedPages.push({
          id: `page-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          originalPageIndex: i - 1,
          displayIndex: i - 1,
          rotation: 0,
          thumbnailUrl: dataUrl,
          width,
          height,
          isSelected: false,
        });
      }

      setPages(loadedPages);
      setInitialPages(JSON.parse(JSON.stringify(loadedPages)));
      setProgress({ percent: 100, stage: 'Pages loaded successfully!', current: totalPages, total: totalPages });
    } catch (err) {
      console.error('Error loading PDF pages:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to parse and render PDF pages.');
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleRotateCw = (id: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const handleRotateCcw = (id: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + 270) % 360 } : p
      )
    );
  };

  const handleDelete = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicate = (id: string) => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const target = prev[idx];
      const copy: PageItem = {
        ...target,
        id: `page-copy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      const updated = [...prev];
      updated.splice(idx + 1, 0, copy);
      return updated;
    });
  };

  const handleToggleSelect = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p))
    );
  };

  const handleSelectAll = () => {
    const allSelected = pages.every((p) => p.isSelected);
    setPages((prev) => prev.map((p) => ({ ...p, isSelected: !allSelected })));
  };

  const handleRotateAllCw = () => {
    setPages((prev) =>
      prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))
    );
  };

  const handleDeleteSelected = () => {
    setPages((prev) => prev.filter((p) => !p.isSelected));
  };

  const handleReset = () => {
    setPages(JSON.parse(JSON.stringify(initialPages)));
  };

  const handleClearFile = () => {
    setSourceFile(null);
    setSourceBuffer(null);
    setPages([]);
    setInitialPages([]);
    setErrorMessage(null);
  };

  const handleSaveAndDownload = async (extractOnlySelected = false) => {
    let buffer = sourceBuffer;
    if (!buffer || buffer.byteLength === 0) {
      if (sourceFile) {
        try {
          buffer = await readFileAsArrayBuffer(sourceFile);
          setSourceBuffer(buffer);
        } catch {
          setErrorMessage('Could not read source PDF file.');
          return;
        }
      } else {
        return;
      }
    }

    const targetPages = extractOnlySelected 
      ? pages.filter((p) => p.isSelected) 
      : pages;

    if (targetPages.length === 0) {
      setErrorMessage(
        extractOnlySelected
          ? 'No pages selected for extraction. Check the box on pages to extract.'
          : 'Your document has no pages left to export.'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProgress({ percent: 10, stage: 'Applying page order & transformations...', current: 0, total: targetPages.length });

    try {
      const outputBlob = await organizePdfDocument(
        buffer,
        targetPages,
        (current, total, message) => {
          const pct = Math.round((current / total) * 90);
          setProgress({ percent: pct, stage: message, current, total });
        }
      );

      const downloadName = extractOnlySelected
        ? `extracted_${outputFilename}`
        : outputFilename;

      downloadBlob(outputBlob, downloadName.endsWith('.pdf') ? downloadName : `${downloadName}.pdf`);
      setProgress({ percent: 100, stage: 'PDF saved successfully!', current: targetPages.length, total: targetPages.length });
      triggerConfetti();
    } catch (err) {
      console.error('Error organizing PDF:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save organized PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = pages.filter((p) => p.isSelected).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400 ring-1 ring-violet-500/20">
          Tool: Organize & Rotate
        </span>
      </div>

      {/* Tool Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/20">
            <Grid className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Organize & Rotate PDF</h1>
            <p className="text-sm text-slate-400">
              Drag pages to reorder, rotate 90°, delete unwanted pages, or extract selections.
            </p>
          </div>
        </div>
      </div>

      {/* Initial Dropzone */}
      {!sourceFile && (
        <div className="my-8 max-w-4xl mx-auto">
          <Dropzone
            accept=".pdf,application/pdf"
            multiple={false}
            maxSizeMB={150}
            onFilesSelected={handleFileSelected}
            title="Drop your PDF here to organize"
            subtitle="Renders visual page thumbnails in browser &bull; Zero server uploads"
          />
        </div>
      )}

      {/* Loading Initial Thumbnails */}
      {isLoadingPages && (
        <div className="my-12 max-w-xl mx-auto">
          <ProgressBar
            progress={progress.percent}
            stage={progress.stage}
            current={progress.current}
            total={progress.total}
          />
        </div>
      )}

      {/* Main Organize View */}
      {sourceFile && !isLoadingPages && pages.length > 0 && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
            <div>
              <h2 className="text-sm font-semibold text-white truncate max-w-md" title={sourceFile.name}>
                {sourceFile.name}
              </h2>
              <p className="text-xs text-slate-400">
                {pages.length} pages remaining &bull; {selectedCount} selected &bull; Original size: {formatBytes(sourceFile.size)}
              </p>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                {pages.every((p) => p.isSelected) ? <CheckSquare className="h-3.5 w-3.5 text-indigo-400" /> : <Square className="h-3.5 w-3.5" />}
                {pages.every((p) => p.isSelected) ? 'Deselect All' : 'Select All'}
              </button>

              <button
                type="button"
                onClick={handleRotateAllCw}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                title="Rotate all pages 90° Clockwise"
              >
                <RotateCw className="h-3.5 w-3.5 text-violet-400" />
                Rotate All
              </button>

              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete ({selectedCount})
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleClearFile}
                className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
              >
                New File
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Reorderable Page Grid */}
          <SortablePageGrid
            items={pages}
            onReorder={setPages}
            onRotateCw={handleRotateCw}
            onRotateCcw={handleRotateCcw}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onToggleSelect={handleToggleSelect}
            onPreview={setPreviewItem}
          />

          {/* Filename & Configuration */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-white mb-2">Output Options</h3>
            <div className="max-w-md">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Output File Name
              </label>
              <input
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                placeholder="organized_document.pdf"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
              />
            </div>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <ProgressBar
              progress={progress.percent}
              stage={progress.stage}
              current={progress.current}
              total={progress.total}
            />
          )}

          {/* Action Toolbar */}
          <ActionToolbar
            itemCount={pages.length}
            itemLabel="pages in document"
            actionText="Apply & Download PDF"
            onAction={() => handleSaveAndDownload(false)}
            onReset={handleReset}
            isLoading={isProcessing}
            disabled={pages.length === 0}
            secondaryAction={
              selectedCount > 0
                ? {
                    label: `Extract (${selectedCount}) Selected`,
                    onClick: () => handleSaveAndDownload(true),
                    icon: <FileDown className="h-4 w-4 text-indigo-400" />,
                  }
                : undefined
            }
          />
        </div>
      )}

      {/* Full Page Zoom Modal */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Preview: Page {pages.findIndex((p) => p.id === previewItem.id) + 1}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700"
              >
                Close (ESC)
              </button>
            </div>
            <div className="flex items-center justify-center bg-slate-950 p-2 rounded-xl">
              <img
                src={previewItem.thumbnailUrl}
                alt="Page preview"
                className="max-h-[70vh] object-contain rounded"
                style={{ transform: `rotate(${previewItem.rotation}deg)` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

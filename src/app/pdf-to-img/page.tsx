'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Image as ImageIcon, 
  ArrowLeft, 
  Download, 
  CheckSquare, 
  Square, 
  Archive, 
  FileCheck, 
  Sparkles,
  AlertCircle,
  Settings2
} from 'lucide-react';
import { Dropzone } from '@/components/shared/Dropzone';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ActionToolbar } from '@/components/shared/ActionToolbar';
import { PageItem, PdfToImgOptions, ImageFormat } from '@/types/pdf';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdf/pdfjs-setup';
import { exportPdfPagesToImages } from '@/lib/pdf/export-images';
import { downloadBlob, formatBytes, triggerConfetti, readFileAsArrayBuffer } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function PdfToImagePage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceBuffer, setSourceBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: '', current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conversion options
  const [format, setFormat] = useState<ImageFormat>('image/png');
  const [scale, setScale] = useState<number>(2.0); // 2x default for crisp High-DPI
  const [quality, setQuality] = useState<number>(0.92);
  const [exportMode, setExportMode] = useState<'all' | 'selected' | 'range'>('all');
  const [rangeText, setRangeText] = useState('');
  const [exportResult, setExportResult] = useState<{ blob: Blob; filename: string; totalImages: number } | null>(null);

  const handleFileSelected = async (selectedFiles: File[]) => {
    const file = selectedFiles[0];
    if (!file) return;

    setSourceFile(file);
    setExportResult(null);
    setErrorMessage(null);
    setIsLoadingPages(true);
    setProgress({ percent: 10, stage: 'Parsing PDF pages...', current: 0, total: 1 });

    try {
      const buffer = await readFileAsArrayBuffer(file);
      setSourceBuffer(buffer);

      const doc = await loadPdfDocument(buffer);
      const totalPages = doc.numPages;
      const loadedPages: PageItem[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress({
          percent: Math.round((i / totalPages) * 90),
          stage: `Generating preview for page ${i} of ${totalPages}...`,
          current: i,
          total: totalPages,
        });

        const { dataUrl, width, height } = await renderPageToCanvas(doc, i, 0.6);

        loadedPages.push({
          id: `p2i-${i}`,
          originalPageIndex: i - 1,
          displayIndex: i - 1,
          rotation: 0,
          thumbnailUrl: dataUrl,
          width,
          height,
          isSelected: true, // Default to all selected
        });
      }

      setPages(loadedPages);
      setProgress({ percent: 100, stage: 'PDF loaded successfully!', current: totalPages, total: totalPages });
    } catch (err) {
      console.error('Error reading PDF:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to parse PDF document.');
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleTogglePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, isSelected: select })));
  };

  const handleClear = () => {
    setSourceFile(null);
    setSourceBuffer(null);
    setPages([]);
    setExportResult(null);
    setErrorMessage(null);
  };

  const handleConvert = async () => {
    if (!sourceFile) return;

    let buffer = sourceBuffer;
    if (!buffer || buffer.byteLength === 0) {
      try {
        buffer = await readFileAsArrayBuffer(sourceFile);
        setSourceBuffer(buffer);
      } catch {
        setErrorMessage('Failed to read source PDF file.');
        return;
      }
    }

    const selectedIndices = pages
      .filter((p) => p.isSelected)
      .map((p) => p.originalPageIndex + 1);

    if (exportMode === 'selected' && selectedIndices.length === 0) {
      setErrorMessage('Please select at least one page to export.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setExportResult(null);
    setProgress({ percent: 5, stage: 'Starting high-resolution rendering...', current: 0, total: pages.length });

    try {
      const options: PdfToImgOptions = {
        format,
        scale,
        quality,
        exportMode,
        rangeText,
      };

      const result = await exportPdfPagesToImages(
        buffer,
        sourceFile.name,
        options,
        selectedIndices,
        (current, total, message) => {
          const pct = Math.round((current / total) * 95);
          setProgress({ percent: pct, stage: message, current, total });
        }
      );

      setExportResult(result);
      setProgress({ percent: 100, stage: 'Export complete!', current: result.totalImages, total: result.totalImages });
      triggerConfetti();

      // Trigger download
      downloadBlob(result.blob, result.filename);
    } catch (err) {
      console.error('Export error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during image export.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = pages.filter((p) => p.isSelected).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
          Tool: PDF to Image
        </span>
      </div>

      {/* Tool Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Convert PDF to Images</h1>
            <p className="text-sm text-slate-400">
              Extract and render PDF pages into high-DPI PNG, JPG, or WebP images with single-click ZIP bundle.
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
            title="Drop your PDF here to convert to images"
            subtitle="Outputs ultra-crisp PNG / JPG / WebP &bull; 100% in-browser WASM"
          />
        </div>
      )}

      {/* Loading Progress */}
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

      {/* Main View */}
      {sourceFile && !isLoadingPages && pages.length > 0 && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left / Main: Page Selection Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div>
                <h2 className="text-sm font-semibold text-white truncate max-w-sm" title={sourceFile.name}>
                  {sourceFile.name}
                </h2>
                <p className="text-xs text-slate-400">
                  {pages.length} total pages &bull; {selectedCount} selected for export
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAll(selectedCount !== pages.length)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  {selectedCount === pages.length ? (
                    <>
                      <Square className="h-3.5 w-3.5" /> Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-400" /> Select All
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Thumbnail Grid for Page Selection */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => handleTogglePage(p.id)}
                  className={cn(
                    'cursor-pointer group relative flex flex-col rounded-xl border bg-slate-900/80 p-2.5 transition-all',
                    p.isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/20'
                      : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between pb-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-300">
                      Page {idx + 1}
                    </span>
                    <div
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded text-[10px]',
                        p.isSelected ? 'bg-emerald-500 text-white' : 'border border-slate-700 bg-slate-800'
                      )}
                    >
                      {p.isSelected && '✓'}
                    </div>
                  </div>

                  <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center p-1 border border-slate-800">
                    <img
                      src={p.thumbnailUrl}
                      alt={`Page ${idx + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Export Settings & Controls */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                <Settings2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Export Options</h3>
              </div>

              {/* Format selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Image Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/png', label: 'PNG', desc: 'Lossless' },
                    { id: 'image/jpeg', label: 'JPG', desc: 'Standard' },
                    { id: 'image/webp', label: 'WebP', desc: 'Modern' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormat(item.id as ImageFormat)}
                      className={cn(
                        'flex flex-col items-center rounded-xl p-2.5 text-xs font-semibold transition-all border',
                        format === item.id
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-500">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution / DPI Scale */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Resolution Scale
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 1.0, label: '1.0x', desc: '72 DPI' },
                    { val: 2.0, label: '2.0x', desc: '144 DPI (Crisp)' },
                    { val: 3.0, label: '3.0x', desc: '216 DPI (Ultra)' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setScale(item.val)}
                      className={cn(
                        'flex flex-col items-center rounded-xl p-2.5 text-xs font-semibold transition-all border',
                        scale === item.val
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-500">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Pages to Export
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: `All Pages (${pages.length})` },
                    { id: 'selected', label: `Only Selected Pages (${selectedCount})` },
                    { id: 'range', label: 'Custom Page Range' },
                  ].map((mode) => (
                    <label
                      key={mode.id}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 text-xs font-medium cursor-pointer transition-all',
                        exportMode === mode.id
                          ? 'border-emerald-500/80 bg-emerald-950/20 text-emerald-200'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      )}
                    >
                      <input
                        type="radio"
                        name="exportMode"
                        value={mode.id}
                        checked={exportMode === mode.id}
                        onChange={() => setExportMode(mode.id as 'all' | 'selected' | 'range')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>{mode.label}</span>
                    </label>
                  ))}
                </div>

                {exportMode === 'range' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="e.g. 1-3, 5, 8-10"
                      value={rangeText}
                      onChange={(e) => setRangeText(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Comma-separated pages and ranges
                    </p>
                  </div>
                )}
              </div>

              {/* Convert Trigger Button */}
              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all',
                  'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400',
                  'shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50'
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span>Convert & Download Images</span>
              </button>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <ProgressBar
                progress={progress.percent}
                stage={progress.stage}
                current={progress.current}
                total={progress.total}
              />
            )}

            {/* Download summary */}
            {exportResult && !isProcessing && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-md animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Images Ready</h4>
                    <p className="text-xs text-emerald-300">
                      {exportResult.totalImages} {exportResult.totalImages === 1 ? 'image' : 'images'} &bull; {formatBytes(exportResult.blob.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadBlob(exportResult.blob, exportResult.filename)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download {exportResult.filename}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

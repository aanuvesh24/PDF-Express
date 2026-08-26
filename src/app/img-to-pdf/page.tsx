'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileImage, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  RotateCw, 
  Sparkles, 
  FileCheck, 
  Download, 
  AlertCircle,
  GripVertical,
  Settings
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dropzone } from '@/components/shared/Dropzone';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { ActionToolbar } from '@/components/shared/ActionToolbar';
import { 
  ImageFileItem, 
  ImageToPdfOptions, 
  PageSizeOption, 
  PageOrientationOption, 
  MarginOption 
} from '@/types/pdf';
import { convertImagesToPdf } from '@/lib/pdf/img-to-pdf';
import { downloadBlob, formatBytes, triggerConfetti, readFileAsDataUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SortableImageCardProps {
  item: ImageFileItem;
  index: number;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableImageCard: React.FC<SortableImageCardProps> = ({
  item,
  index,
  onRotate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-slate-900/90 p-3 transition-all shadow-md',
        isDragging
          ? 'z-50 scale-105 border-rose-400 shadow-2xl shadow-rose-500/20 bg-slate-800'
          : 'border-slate-800 hover:border-slate-700'
      )}
    >
      <div className="flex items-center justify-between pb-2">
        <span className="flex h-5 items-center rounded-md bg-slate-800 px-2 text-xs font-semibold text-slate-300 ring-1 ring-slate-700">
          #{index + 1}
        </span>

        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-slate-400 hover:text-white active:cursor-grabbing rounded hover:bg-slate-800"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center p-2 border border-slate-800/80">
        <img
          src={item.dataUrl}
          alt={item.name}
          className="max-h-full max-w-full object-contain rounded transition-transform duration-200"
          style={{ transform: `rotate(${item.rotation}deg)` }}
        />

        {item.rotation !== 0 && (
          <div className="absolute top-2 right-2 rounded-md bg-rose-600/90 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white shadow-md">
            {item.rotation}&deg;
          </div>
        )}
      </div>

      <div className="mt-2.5 truncate text-xs font-semibold text-slate-300" title={item.name}>
        {item.name}
      </div>
      <div className="text-[11px] text-slate-400">
        {formatBytes(item.size)} {item.width > 0 && `\u2022 ${item.width}x${item.height}`}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
        <button
          type="button"
          onClick={() => onRotate(item.id)}
          className="flex items-center gap-1 rounded-lg p-1.5 hover:bg-slate-800 hover:text-rose-400 transition-colors text-xs"
          title="Rotate 90° Clockwise"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Rotate</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="rounded-lg p-1.5 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          title="Delete image"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [outputFilename, setOutputFilename] = useState('images_document.pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, stage: '', current: 0, total: 0 });
  const [convertedResult, setConvertedResult] = useState<{ blob: Blob; size: number; pageCount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings
  const [pageSize, setPageSize] = useState<PageSizeOption>('a4');
  const [orientation, setOrientation] = useState<PageOrientationOption>('auto');
  const [margin, setMargin] = useState<MarginOption>('none');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleImagesSelected = async (files: File[]) => {
    setErrorMessage(null);
    setConvertedResult(null);

    const loadedItems: ImageFileItem[] = [];

    for (const file of files) {
      const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      try {
        const dataUrl = await readFileAsDataUrl(file);
        
        // Extract native dimensions
        const dims = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = dataUrl;
        });

        loadedItems.push({
          id,
          file,
          name: file.name,
          size: file.size,
          dataUrl,
          width: dims.width,
          height: dims.height,
          rotation: 0,
        });
      } catch (err) {
        console.warn('Could not read image:', file.name, err);
      }
    }

    setImages((prev) => [...prev, ...loadedItems]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((item) => item.id === active.id);
      const newIndex = images.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setImages(arrayMove(images, oldIndex, newIndex));
      }
    }
  };

  const handleRotate = (id: string) => {
    setImages((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setImages([]);
    setConvertedResult(null);
    setErrorMessage(null);
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setErrorMessage('Please upload at least one image to convert.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setConvertedResult(null);
    setProgress({ percent: 5, stage: 'Preparing image assets...', current: 0, total: images.length });

    try {
      const options: ImageToPdfOptions = {
        pageSize,
        orientation,
        margin,
        quality: 0.94,
      };

      const pdfBlob = await convertImagesToPdf(
        images,
        options,
        (current, total, message) => {
          const pct = Math.round((current / total) * 92);
          setProgress({ percent: pct, stage: message, current, total });
        }
      );

      setConvertedResult({
        blob: pdfBlob,
        size: pdfBlob.size,
        pageCount: images.length,
      });
      setProgress({ percent: 100, stage: 'PDF generated successfully!', current: images.length, total: images.length });
      triggerConfetti();

      // Trigger automatic direct download
      downloadBlob(pdfBlob, outputFilename.endsWith('.pdf') ? outputFilename : `${outputFilename}.pdf`);
    } catch (err) {
      console.error('Error generating PDF from images:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

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
        <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400 ring-1 ring-rose-500/20">
          Tool: Image to PDF
        </span>
      </div>

      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
            <FileImage className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Convert Images to PDF</h1>
            <p className="text-sm text-slate-400">
              Transform JPG, PNG, and WebP images into clean, customized PDF documents.
            </p>
          </div>
        </div>
      </div>

      {/* Initial Dropzone */}
      {images.length === 0 && (
        <div className="my-8 max-w-4xl mx-auto">
          <Dropzone
            accept=".png,.jpg,.jpeg,.webp,image/*"
            multiple={true}
            maxSizeMB={100}
            onFilesSelected={handleImagesSelected}
            title="Drop JPG, PNG, or WebP images here"
            subtitle="Drag to reorder photos &bull; Custom A4, Letter, and Fit margins"
          />
        </div>
      )}

      {/* Main Image Grid & Options */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Grid Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Images in Queue ({images.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Drag any card to change its page order in the final PDF.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
                  <Plus className="h-3.5 w-3.5 text-rose-400" />
                  Add More Images
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,image/*"
                    multiple
                    onChange={(e) => e.target.files && handleImagesSelected(Array.from(e.target.files))}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* DnD Grid */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((img, idx) => (
                    <SortableImageCard
                      key={img.id}
                      item={img}
                      index={idx}
                      onRotate={handleRotate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                <Settings className="h-5 w-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Document Settings</h3>
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Page Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'a4', label: 'A4', desc: 'Standard' },
                    { id: 'letter', label: 'Letter', desc: 'US' },
                    { id: 'fit', label: 'Fit', desc: 'Image Size' },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setPageSize(sz.id as PageSizeOption)}
                      className={cn(
                        'flex flex-col items-center rounded-xl p-2.5 text-xs font-semibold transition-all border',
                        pageSize === sz.id
                          ? 'border-rose-500 bg-rose-500/15 text-rose-300 shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                      )}
                    >
                      <span>{sz.label}</span>
                      <span className="text-[10px] text-slate-500">{sz.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Orientation */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Page Orientation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'auto', label: 'Auto', desc: 'Smart' },
                    { id: 'portrait', label: 'Portrait', desc: 'Vertical' },
                    { id: 'landscape', label: 'Landscape', desc: 'Horizontal' },
                  ].map((ori) => (
                    <button
                      key={ori.id}
                      type="button"
                      onClick={() => setOrientation(ori.id as PageOrientationOption)}
                      className={cn(
                        'flex flex-col items-center rounded-xl p-2.5 text-xs font-semibold transition-all border',
                        orientation === ori.id
                          ? 'border-rose-500 bg-rose-500/15 text-rose-300 shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                      )}
                    >
                      <span>{ori.label}</span>
                      <span className="text-[10px] text-slate-500">{ori.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Page Margins
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'None', desc: 'Edge-to-edge' },
                    { id: 'small', label: 'Small', desc: '20pt' },
                    { id: 'large', label: 'Large', desc: '40pt' },
                  ].map((mg) => (
                    <button
                      key={mg.id}
                      type="button"
                      onClick={() => setMargin(mg.id as MarginOption)}
                      className={cn(
                        'flex flex-col items-center rounded-xl p-2.5 text-xs font-semibold transition-all border',
                        margin === mg.id
                          ? 'border-rose-500 bg-rose-500/15 text-rose-300 shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                      )}
                    >
                      <span>{mg.label}</span>
                      <span className="text-[10px] text-slate-500">{mg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Output filename */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Output Filename
                </label>
                <input
                  type="text"
                  value={outputFilename}
                  onChange={(e) => setOutputFilename(e.target.value)}
                  placeholder="images_document.pdf"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-rose-500 focus:outline-none font-mono"
                />
              </div>

              {/* Convert Button */}
              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                className={cn(
                  'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all',
                  'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400',
                  'shadow-rose-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50'
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span>Create & Download PDF</span>
              </button>
            </div>

            {/* Error Message */}
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

            {/* Result card */}
            {convertedResult && !isProcessing && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 backdrop-blur-md animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">PDF Ready!</h4>
                    <p className="text-xs text-rose-300">
                      {convertedResult.pageCount} pages &bull; {formatBytes(convertedResult.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadBlob(convertedResult.blob, outputFilename)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download {outputFilename}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, AlertCircle, FileType, CheckCircle2 } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  accept,
  multiple = false,
  maxSizeMB = 100,
  onFilesSelected,
  title = 'Drag & drop your files here',
  subtitle = 'or click to browse from your device',
  disabled = false,
  className,
  icon,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const acceptedExtensions = accept
      .split(',')
      .map((item) => item.trim().toLowerCase());

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check size
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `File "${file.name}" exceeds the maximum size limit of ${maxSizeMB}MB.`
        );
        continue;
      }

      // Check format
      const fileNameLower = file.name.toLowerCase();
      const fileTypeLower = file.type.toLowerCase();

      const matches = acceptedExtensions.some((ext) => {
        if (ext.startsWith('.')) {
          return fileNameLower.endsWith(ext);
        }
        if (ext.endsWith('/*')) {
          const prefix = ext.replace('/*', '');
          return fileTypeLower.startsWith(prefix);
        }
        return fileTypeLower === ext;
      });

      if (matches || accept === '*' || accept === '*/*') {
        validFiles.push(file);
      } else {
        setErrorMessage(`"${file.name}" is not a supported file format.`);
      }

      // If not multiple, break on first file
      if (!multiple && validFiles.length === 1) break;
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (!disabled && e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!disabled && e.target.files) {
      validateAndAddFiles(e.target.files);
      // Reset value to allow selecting the same file again
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full flex flex-col items-center', className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'relative w-full cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300',
          'bg-slate-900/40 backdrop-blur-md hover:bg-slate-900/70',
          isDragActive
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01] shadow-2xl shadow-indigo-500/10'
            : 'border-slate-700/80 hover:border-indigo-500/60',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300',
              isDragActive
                ? 'bg-indigo-600 text-white scale-110 rotate-3 shadow-lg shadow-indigo-500/30'
                : 'bg-indigo-500/10 text-indigo-400 group-hover:scale-105'
            )}
          >
            {icon || <UploadCloud className="h-8 w-8" />}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="rounded-md bg-slate-800/80 px-2.5 py-1 font-mono text-slate-300 ring-1 ring-slate-700">
              {accept.replace(/\./g, ' ').toUpperCase()}
            </span>
            <span>&bull;</span>
            <span>Max {maxSizeMB}MB</span>
            {multiple && (
              <>
                <span>&bull;</span>
                <span className="text-indigo-400">Multi-file supported</span>
              </>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-500/10 px-4 py-2 text-sm text-rose-400 ring-1 ring-rose-500/20 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

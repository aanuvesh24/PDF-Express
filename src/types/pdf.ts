export interface PageItem {
  id: string;
  originalPageIndex: number; // 0-based index in the original file
  displayIndex: number;      // Current position in the reordered grid (0-based)
  rotation: number;          // 0, 90, 180, 270
  thumbnailUrl: string;      // Rendered data URL of page
  width: number;
  height: number;
  isSelected: boolean;
  isDeleted?: boolean;
}

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnailUrl?: string;
  isProcessing?: boolean;
  error?: string;
}

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
}

export type PageSizeOption = 'a4' | 'letter' | 'fit';
export type PageOrientationOption = 'auto' | 'portrait' | 'landscape';
export type MarginOption = 'none' | 'small' | 'large';

export interface ImageToPdfOptions {
  pageSize: PageSizeOption;
  orientation: PageOrientationOption;
  margin: MarginOption;
  quality: number; // 0.1 - 1.0
}

export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export interface PdfToImgOptions {
  format: ImageFormat;
  scale: number; // 1, 2, 3
  quality: number; // For jpeg/webp (0.1 - 1.0)
  exportMode: 'all' | 'selected' | 'range';
  rangeText?: string;
}

export interface ProcessingProgress {
  isProcessing: boolean;
  progress: number; // 0 - 100
  stage: string;
  current?: number;
  total?: number;
  error?: string;
}

export interface ToolMetadata {
  id: string;
  title: string;
  description: string;
  href: string;
  iconName: string;
  badge?: string;
  color: string;
  accentGradient: string;
}

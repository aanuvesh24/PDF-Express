'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  GripVertical, 
  Check, 
  Copy, 
  Maximize2 
} from 'lucide-react';
import { PageItem } from '@/types/pdf';
import { cn } from '@/lib/utils';

interface PageThumbnailProps {
  item: PageItem;
  index: number;
  onRotateCw: (id: string) => void;
  onRotateCcw: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleSelect?: (id: string) => void;
  onPreview?: (item: PageItem) => void;
  selectable?: boolean;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  item,
  index,
  onRotateCw,
  onRotateCcw,
  onDelete,
  onDuplicate,
  onToggleSelect,
  onPreview,
  selectable = true,
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
        'group relative flex flex-col rounded-2xl border bg-slate-900/90 p-3 transition-all duration-200 shadow-md',
        isDragging
          ? 'z-50 scale-105 border-indigo-400 shadow-2xl shadow-indigo-500/20 opacity-90'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5',
        item.isSelected && 'ring-2 ring-indigo-500 border-indigo-500/50 bg-indigo-950/20'
      )}
    >
      {/* Card Header: Position badge, Drag grip, Selection checkbox */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-1.5">
          {selectable && onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(item.id);
              }}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-md border text-xs transition-colors',
                item.isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'border-slate-700 bg-slate-800/80 hover:border-slate-500 text-transparent'
              )}
              title="Select page"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}

          <span className="flex h-5 items-center rounded-md bg-slate-800 px-2 text-xs font-semibold text-slate-300 ring-1 ring-slate-700">
            Page {index + 1}
          </span>

          {item.originalPageIndex + 1 !== index + 1 && (
            <span className="text-[10px] text-slate-500" title="Original page number">
              (Orig #{item.originalPageIndex + 1})
            </span>
          )}
        </div>

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-slate-400 hover:text-white active:cursor-grabbing rounded hover:bg-slate-800"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Thumbnail Viewport */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center p-2 border border-slate-800/80">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={`Page ${index + 1}`}
            className="max-h-full max-w-full object-contain rounded transition-transform duration-300 shadow-sm"
            style={{
              transform: `rotate(${item.rotation}deg)`,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1 text-slate-600">
            <span className="text-xs">Loading...</span>
          </div>
        )}

        {/* Rotation indicator badge if rotated */}
        {item.rotation !== 0 && (
          <div className="absolute top-2 right-2 rounded-md bg-indigo-600/90 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white shadow-md backdrop-blur-sm">
            {item.rotation}&deg;
          </div>
        )}

        {/* Preview icon button */}
        {onPreview && (
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="absolute bottom-2 right-2 rounded-lg bg-slate-900/80 p-1.5 text-slate-300 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-slate-800 hover:text-white"
            title="Preview full size"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Action controls footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-slate-400">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onRotateCcw(item.id)}
            className="rounded-lg p-1.5 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
            title="Rotate 90° Counter-Clockwise"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRotateCw(item.id)}
            className="rounded-lg p-1.5 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(item.id)}
              className="rounded-lg p-1.5 hover:bg-slate-800 hover:text-indigo-400 transition-colors"
              title="Duplicate page"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="rounded-lg p-1.5 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          title="Delete page"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  FileText, 
  GripVertical, 
  Trash2, 
  Layers, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import { PDFFileItem } from '@/types/pdf';
import { cn, formatBytes } from '@/lib/utils';

interface FileListItemProps {
  item: PDFFileItem;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

const FileListItem: React.FC<FileListItemProps> = ({
  item,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
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
        'group flex items-center justify-between rounded-xl border bg-slate-900/90 p-3.5 transition-all',
        isDragging
          ? 'z-50 scale-[1.02] border-indigo-400 shadow-2xl shadow-indigo-500/20 bg-slate-800'
          : 'border-slate-800 hover:border-slate-700'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 text-slate-500 hover:text-slate-200 active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Index badge */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs font-mono font-bold text-slate-400 ring-1 ring-slate-700">
          {index + 1}
        </span>

        {/* PDF File icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
          <FileText className="h-5 w-5" />
        </div>

        {/* File name & meta */}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-200" title={item.name}>
            {item.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{formatBytes(item.size)}</span>
            {item.pageCount > 0 && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-indigo-300">
                  <Layers className="h-3 w-3" />
                  {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-1 pl-2">
        {onMoveUp && (
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors ml-1"
          title="Remove file"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

interface FileListSortableProps {
  files: PDFFileItem[];
  onReorder: (newFiles: PDFFileItem[]) => void;
  onRemove: (id: string) => void;
}

export const FileListSortable: React.FC<FileListSortableProps> = ({
  files,
  onReorder,
  onRemove,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = files.findIndex((item) => item.id === active.id);
      const newIndex = files.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(files, oldIndex, newIndex));
      }
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorder(arrayMove(files, index, index - 1));
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < files.length - 1) {
      onReorder(arrayMove(files, index, index + 1));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          {files.map((file, index) => (
            <FileListItem
              key={file.id}
              item={file}
              index={index}
              total={files.length}
              onRemove={onRemove}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

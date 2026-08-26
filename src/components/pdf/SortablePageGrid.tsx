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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { PageItem } from '@/types/pdf';
import { PageThumbnail } from './PageThumbnail';

interface SortablePageGridProps {
  items: PageItem[];
  onReorder: (newItems: PageItem[]) => void;
  onRotateCw: (id: string) => void;
  onRotateCcw: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleSelect?: (id: string) => void;
  onPreview?: (item: PageItem) => void;
  selectable?: boolean;
}

export const SortablePageGrid: React.FC<SortablePageGridProps> = ({
  items,
  onReorder,
  onRotateCw,
  onRotateCcw,
  onDelete,
  onDuplicate,
  onToggleSelect,
  onPreview,
  selectable = true,
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
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          displayIndex: idx,
        }));
        onReorder(reordered);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item, index) => (
            <PageThumbnail
              key={item.id}
              item={item}
              index={index}
              onRotateCw={onRotateCw}
              onRotateCcw={onRotateCcw}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onToggleSelect={onToggleSelect}
              onPreview={onPreview}
              selectable={selectable}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

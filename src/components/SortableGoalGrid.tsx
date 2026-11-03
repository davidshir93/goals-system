import { useCallback, type ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ID } from '@/types/GoalTypes';

type SortableItemProps = {
  id: string;
  children: ReactNode;
  progressKeys?: boolean;
};

/* Keys that log progress when the card itself has focus.
   Only on the card, not on controls inside it (the menu uses ↑ ↓ itself). */
const PROGRESS_KEYS: Record<string, "inc" | "dec"> = {
  "+": "inc",
  "=": "inc", // + without Shift on most layouts
  ArrowUp: "inc",
  "-": "dec",
  ArrowDown: "dec",
};

function SortableItem({ id, children, progressKeys }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // cursor: 'grab',
  };

  // The card itself is the drag activator. Without this, dnd-kit treats a
  // Space/Enter press on ANY element inside the card (the + / − buttons, the
  // menu, WOOP) as "pick up the card": it calls preventDefault, so the
  // button's click never fires. With an activator node set, only key presses
  // on the card wrapper start a keyboard drag.
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      setActivatorNodeRef(node);
    },
    [setNodeRef, setActivatorNodeRef]
  );

  return (
    <div
      ref={setRefs}
      style={style}
      data-sortable-item
      {...attributes}
      {...listeners}
      aria-keyshortcuts={progressKeys ? "+ - ArrowUp ArrowDown" : undefined}
      onKeyDown={(e) => {
        listeners?.onKeyDown?.(e); // Space / Enter: pick up the card to reorder
        if (!progressKeys || isDragging || e.defaultPrevented || e.target !== e.currentTarget) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return; // leave ⌘+ / ⌘− zoom alone
        const action = PROGRESS_KEYS[e.key];
        if (!action) return;
        e.preventDefault(); // no page scroll on ↑ ↓
        // Click the real button: same guard, motion and screen-reader announcement as a mouse click.
        e.currentTarget.querySelector<HTMLElement>(`[data-stepper-${action}]`)?.click();
      }}
      className="rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
    >
      {children}
    </div>
  );
}

type SortableGoalGridProps = {
  items: { id: ID }[];
  onReorder: (orderedIds: ID[]) => void;
  children: (item: { id: ID }, index: number) => ReactNode;
  className?: string;
  /** Week view: + − ↑ ↓ on a focused card log progress */
  progressKeys?: boolean;
};

export function SortableGoalGrid({
  items,
  onReorder,
  children,
  className = '',
  progressKeys = false,
}: SortableGoalGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        const orderedIds = newItems.map((item) => item.id);
        onReorder(orderedIds);
      }
    },
    [items, onReorder]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${className}`}
        >
          {items.map((item, index) => (
            <SortableItem key={item.id} id={item.id} progressKeys={progressKeys}>
              {children(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

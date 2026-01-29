import { useCallback, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ID } from "@/types/GoalTypes";
import { useTranslation } from "react-i18next";

type SortableTableRowProps = {
  id: string;
  children: (dragHandleProps: React.HTMLAttributes<HTMLDivElement>, isDragging: boolean) => ReactNode;
};

function SortableTableRow({ id, children }: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tbody ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners }, isDragging)}
    </tbody>
  );
}

type SortableGoalTableProps = {
  items: { id: ID }[];
  onReorder: (orderedIds: ID[]) => void;
  children: (
    item: { id: ID },
    index: number,
    dragHandleProps: React.HTMLAttributes<HTMLDivElement>,
    isDragging: boolean
  ) => ReactNode;
  className?: string;
  showParentGoals?: boolean;
};

export function SortableGoalTable({
  items,
  onReorder,
  children,
  className = "",
  showParentGoals = false,
}: SortableGoalTableProps) {
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`overflow-x-auto rounded-lg border ${className}`}>
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="w-10 px-2 py-3 text-left text-xs font-medium text-muted-foreground">
                  {/* Drag handle column */}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground min-w-[140px]">
                  {t("table.categoryIdentity")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                  {t("table.goal")}
                </th>
                {showParentGoals && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                    {t("table.parentGoal")}
                  </th>
                )}
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground w-[200px]">
                  {t("table.progress")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                  {t("table.notes")}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            {items.map((item, index) => (
              <SortableTableRow key={item.id} id={item.id}>
                {(dragHandleProps, isDragging) =>
                  children(item, index, dragHandleProps, isDragging)
                }
              </SortableTableRow>
            ))}
          </table>
        </div>
      </SortableContext>
    </DndContext>
  );
}

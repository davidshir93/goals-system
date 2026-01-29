import { useState, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import type { EnrichedGoalType, ID, PlanItem, YearGoal } from "@/types/GoalTypes";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { getTextColorForBg } from "@/utils/colors";

type GoalTableRowProps = {
  goal: EnrichedGoalType;
  showParentGoals?: boolean;
  onEditWeeklyProgress?: (goalId: ID, done: number) => void;
  onDelete?: (goalId: ID) => void;
  canDelete?: boolean;
  deleteWarning?: string;
  parentYearGoal?: YearGoal;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
};

export const GoalTableRow = forwardRef<HTMLTableRowElement, GoalTableRowProps>(
  function GoalTableRow(
    {
      goal,
      showParentGoals = false,
      onEditWeeklyProgress,
      onDelete,
      canDelete = true,
      deleteWarning,
      parentYearGoal,
      dragHandleProps,
      isDragging,
    },
    ref
  ) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [localDone, setLocalDone] = useState(goal.done || 0);

    useEffect(() => {
      setLocalDone(goal.done || 0);
    }, [goal.done]);

    const woopSource = goal.type === "year" ? goal : parentYearGoal;
    const hasOutcome = woopSource?.outcome && woopSource.outcome.length > 0;
    const hasObstacles = woopSource?.obstacles && woopSource.obstacles.length > 0;
    const hasPlan = woopSource?.plan && woopSource.plan.length > 0;
    const hasWoopContent = hasOutcome || hasObstacles || hasPlan;
    const hasNotes = goal.notes && goal.notes.trim().length > 0;

    const defaultTab = hasOutcome ? "outcome" : hasObstacles ? "obstacles" : "plan";

    const isPlanItemArray = (plan: unknown): plan is PlanItem[] => {
      return (
        Array.isArray(plan) &&
        plan.length > 0 &&
        typeof plan[0] === "object" &&
        "obstacle" in plan[0]
      );
    };

    const editPath = `/${goal.type}/edit/${goal.id}`;

    const handleDelete = () => {
      if (canDelete && onDelete) {
        onDelete(goal.id);
        setShowDeleteConfirm(false);
      }
    };

    const truncateText = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + "...";
    };

    return (
      <>
        <tr
          ref={ref}
          className={`border-b transition-colors hover:bg-muted/50 ${
            isDragging ? "opacity-50 bg-muted" : ""
          }`}
        >
          {/* Drag Handle */}
          <td className="w-10 px-2 align-middle">
            <div
              {...dragHandleProps}
              className="flex items-center justify-center h-8 w-8 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              title={t("table.dragHandle")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="5" r="1" />
                <circle cx="9" cy="12" r="1" />
                <circle cx="9" cy="19" r="1" />
                <circle cx="15" cy="5" r="1" />
                <circle cx="15" cy="12" r="1" />
                <circle cx="15" cy="19" r="1" />
              </svg>
            </div>
          </td>

          {/* Category/Identity */}
          <td className="px-3 py-2 min-w-[160px] align-middle">
            <div className="flex flex-row flex-wrap gap-1.5 items-center">
              {goal.category && (
                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-2 py-0.5 border whitespace-nowrap"
                  style={{
                    backgroundColor: goal.category.color,
                    color: getTextColorForBg(goal.category.color),
                    borderColor: `${goal.category.color}30`,
                  }}
                >
                  {goal.category.name}
                </Badge>
              )}
              {goal.identity && (
                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-2 py-0.5 border whitespace-nowrap"
                  style={{
                    backgroundColor: goal.identity.color,
                    color: getTextColorForBg(goal.identity.color),
                    borderColor: `${goal.identity.color}30`,
                  }}
                >
                  {goal.identity.name}
                </Badge>
              )}
            </div>
          </td>

          {/* Goal Name */}
          <td className="px-3 py-2 align-middle">
            <div className="flex items-center gap-2">
              {hasWoopContent && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title={isExpanded ? t("table.collapseWoop") : t("table.expandWoop")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    } rtl-flip`}
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              )}
              <span className="font-medium text-base">{goal.wish}</span>
            </div>
          </td>

          {/* Parent Goal */}
          {showParentGoals && (
            <td className="px-3 py-2 text-sm text-muted-foreground max-w-[200px] align-middle">
              {goal.parentYearGoalWish && (
                <span title={goal.parentYearGoalWish}>
                  {truncateText(goal.parentYearGoalWish, 30)}
                </span>
              )}
              {goal.parentQuarterGoalWish && !goal.parentYearGoalWish && (
                <span title={goal.parentQuarterGoalWish}>
                  {truncateText(goal.parentQuarterGoalWish, 30)}
                </span>
              )}
            </td>
          )}

          {/* Progress */}
          <td className="px-3 py-2 w-[300px] align-middle">
            {goal.type === "week" && (
              <Slider
                value={[localDone]}
                max={goal.planned}
                step={1}
                doneColor={goal.category?.color || "black"}
                compact
                onValueChange={(val) => {
                  const [done] = val;
                  setLocalDone(done);
                  onEditWeeklyProgress?.(goal.id, done);
                }}
              />
            )}
            {(goal.type === "quarter" || goal.type === "year") &&
              !goal.emptyProgress &&
              goal.doneAveragePercent !== undefined && (
                <Slider
                  value={[Math.round(Number(goal.doneAveragePercent))]}
                  max={100}
                  step={1}
                  className="cursor-not-allowed"
                  doneColor={goal.category?.color || "lightblue"}
                  disabled
                  compact
                  isSummary
                />
              )}
          </td>

          {/* Notes */}
          <td className="px-3 py-2 text-sm text-muted-foreground max-w-[150px] align-middle">
            {hasNotes && (
              <span title={goal.notes} className="truncate block">
                {truncateText(goal.notes!, 25)}
              </span>
            )}
          </td>

          {/* Actions */}
          <td className="px-3 py-2 align-middle">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Link to={editPath}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              )}
            </div>
          </td>
        </tr>

        {/* Delete Confirmation Row */}
        {showDeleteConfirm && (
          <tr className="border-b bg-destructive/5">
            <td colSpan={7} className="px-4 py-3">
              <div className="flex items-center gap-4">
                {!canDelete && deleteWarning ? (
                  <>
                    <p className="text-sm text-destructive font-medium">
                      {t("goals.cannotDelete")}
                    </p>
                    <p className="text-xs text-destructive/80">{deleteWarning}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-destructive">
                      {t("goals.deleteConfirm")}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                      >
                        {t("common.delete")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </td>
          </tr>
        )}

        {/* Expanded WOOP Row */}
        {isExpanded && hasWoopContent && woopSource && (
          <tr className="border-b bg-muted/30">
            <td colSpan={7} className="px-4 py-3">
              <div className="border rounded-lg overflow-hidden bg-background">
                <Tabs defaultValue={defaultTab}>
                  <TabsList className="w-full rounded-none border-b bg-muted/30 p-0 h-auto">
                    {hasOutcome && (
                      <TabsTrigger
                        value="outcome"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent px-3 py-2 text-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {t("goalCard.outcomes")}
                        </span>
                      </TabsTrigger>
                    )}
                    {hasObstacles && (
                      <TabsTrigger
                        value="obstacles"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-3 py-2 text-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                          {t("goalCard.obstacles")}
                        </span>
                      </TabsTrigger>
                    )}
                    {hasPlan && (
                      <TabsTrigger
                        value="plan"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-3 py-2 text-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {t("goalCard.plan")}
                        </span>
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {hasOutcome && (
                    <TabsContent value="outcome" className="p-3 mt-0">
                      <ul className="space-y-2">
                        {woopSource.outcome!.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5"></span>
                            <p className="text-xs text-muted-foreground">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  )}

                  {hasObstacles && (
                    <TabsContent value="obstacles" className="p-3 mt-0">
                      <ul className="space-y-2">
                        {woopSource.obstacles!.map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5"></span>
                            <p className="text-xs text-muted-foreground">{item}</p>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  )}

                  {hasPlan && (
                    <TabsContent value="plan" className="p-3 mt-0">
                      {isPlanItemArray(woopSource.plan) ? (
                        <div className="space-y-2">
                          {woopSource.plan.map((item, index) => (
                            <div
                              key={index}
                              className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10"
                            >
                              <div className="flex items-start gap-2 mb-1.5">
                                <span className="text-[10px] font-bold text-orange-500 shrink-0">
                                  {t("goalCard.if")}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {item.obstacle}
                                </p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold text-green-500 shrink-0">
                                  {t("goalCard.then")}
                                </span>
                                <p className="text-xs font-medium">
                                  {item.action || (
                                    <span className="text-muted-foreground italic">
                                      {t("goalCard.noActionDefined")}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {(woopSource.plan as unknown as string[]).map(
                            (item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                                <p className="text-xs text-muted-foreground">
                                  {item}
                                </p>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }
);

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { EnrichedGoalType, ID, PlanItem, YearGoal } from "@/types/GoalTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { getTextColorForBg } from "@/utils/colors";

type GoalCardProps = {
  goal: EnrichedGoalType;
  showParentGoals?: boolean;
  onEditWeeklyProgress?: (goalId: ID, done: number) => void;
  onDelete?: (goalId: ID) => void;
  canDelete?: boolean;
  deleteWarning?: string;
  parentYearGoal?: YearGoal;
};

export default function GoalCard({
  goal,
  onEditWeeklyProgress,
  showParentGoals = true,
  onDelete,
  canDelete = true,
  deleteWarning,
  parentYearGoal,
}: GoalCardProps) {
  const { t } = useTranslation()
  const [showWoop, setShowWoop] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localDone, setLocalDone] = useState(goal.done || 0);

  // Sync local state when goal.done changes (from server updates or other sources)
  useEffect(() => {
    setLocalDone(goal.done || 0);
  }, [goal.done]);

  // For year goals, use own WOOP. For quarter/week goals, use parent's WOOP
  const woopSource = goal.type === 'year' ? goal : parentYearGoal;

  const hasOutcome = woopSource?.outcome && woopSource.outcome.length > 0;
  const hasObstacles = woopSource?.obstacles && woopSource.obstacles.length > 0;
  const hasPlan = woopSource?.plan && woopSource.plan.length > 0;
  const hasWoopContent = hasOutcome || hasObstacles || hasPlan;
  const hasNotes = goal.notes && goal.notes.trim().length > 0;

  const defaultTab = hasOutcome ? "outcome" : hasObstacles ? "obstacles" : "plan";

  // Type guard for PlanItem
  const isPlanItemArray = (plan: unknown): plan is PlanItem[] => {
    return Array.isArray(plan) && plan.length > 0 && typeof plan[0] === 'object' && 'obstacle' in plan[0];
  };

  const editPath = `/${goal.type}/edit/${goal.id}`;

  const handleDelete = () => {
    if (canDelete && onDelete) {
      onDelete(goal.id);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card className="bg-card hover:shadow-md transition-all duration-200 h-full">
      <CardHeader className="pb-2 space-y-2">
        {/* Badges and Actions Row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {goal.category && (
              <Badge
                variant="secondary"
                className="text-xs font-medium px-2.5 py-0.5 border"
                style={{
                  backgroundColor: goal.category.color,
                  color: getTextColorForBg(goal.category.color),
                  borderColor: `${goal.category.color}30`
                }}
              >
                {goal.category.name}
              </Badge>
            )}
            {goal.identity && (
              <Badge
                variant="secondary"
                className="text-xs font-medium px-2.5 py-0.5 border"
                style={{
                  backgroundColor: goal.identity.color,
                  color: getTextColorForBg(goal.identity.color),
                  borderColor: `${goal.identity.color}30`
                }}
              >
                {goal.identity.name}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            >
              <Link to={editPath}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
              </Link>
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
            {!canDelete && deleteWarning ? (
              <>
                <p className="text-sm text-destructive font-medium">{t('goals.cannotDelete')}</p>
                <p className="text-xs text-destructive/80">{deleteWarning}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-destructive">{t('goals.deleteConfirm')}</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    {t('common.delete')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Goal Title */}
        <CardTitle className="text-xl font-bold leading-snug">
          {goal.wish}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Parent Goals */}
        {showParentGoals && (goal.parentQuarterGoalWish || goal.parentYearGoalWish) && (
          <div className="p-2.5 rounded-lg bg-muted/50 space-y-1.5 text-sm">
            {goal.parentYearGoalWish && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5 font-medium">{t('goals.parentYear')}</span>
                <p className="text-muted-foreground">{goal.parentYearGoalWish}</p>
              </div>
            )}
            {goal.parentQuarterGoalWish && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5 font-medium">{t('goals.parentQuarter')}</span>
                <p className="text-muted-foreground">{goal.parentQuarterGoalWish}</p>
              </div>
            )}
          </div>
        )}

        {/* Weekly Progress Slider */}
        {goal.type === "week" && (
          <div>
            <Slider
              value={[localDone]}
              max={goal.planned}
              step={1}
              doneColor={goal.category?.color || "black"}
              onValueChange={(val) => {
                const [done] = val;
                setLocalDone(done); // Update UI immediately
                onEditWeeklyProgress?.(goal.id, done); // Persist to server
              }}
            />
          </div>
        )}

        {/* Quarter/Year Progress (Read-only) */}
        {(goal.type === "quarter" || goal.type === "year") &&
          !goal.emptyProgress &&
          goal.doneAveragePercent !== undefined && (
            <div>
              <Slider
                value={[Math.round(Number(goal.doneAveragePercent))]}
                max={100}
                step={1}
                className="cursor-not-allowed"
                doneColor={goal.category?.color || "lightblue"}
                disabled
                isSummary
              />
            </div>
          )}

        {/* WOOP Section - Show parent's WOOP for quarter/week goals */}
        {hasWoopContent && (
          <div className="pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowWoop(!showWoop)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full cursor-pointer"
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
                className={`transition-transform duration-200 ${showWoop ? "rotate-90" : ""} rtl-flip`}
              >
                <path d="m9 18 6-6-6-6"/>
              </svg>
              <span className="text-xs font-medium cursor-pointer">
                {goal.type !== 'year' && parentYearGoal
                  ? `${showWoop ? t('goalCard.hideWOOP') : t('goalCard.showWOOP')} (${t('goals.parentGoalDetails')})`
                  : (showWoop ? t('goalCard.hideWOOP') : t('goalCard.showWOOP'))
                }
              </span>
            </button>

            {showWoop && woopSource && (
              <div className="mt-3 border rounded-lg overflow-hidden">
                <Tabs defaultValue={defaultTab}>
                  <TabsList className="w-full rounded-none border-b bg-muted/30 p-0 h-auto">
                    {hasOutcome && (
                      <TabsTrigger
                        value="outcome"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent px-3 py-2 text-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          {t('goalCard.outcomes')}
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
                          {t('goalCard.obstacles')}
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
                          {t('goalCard.plan')}
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
                            <div key={index} className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                              <div className="flex items-start gap-2 mb-1.5">
                                <span className="text-[10px] font-bold text-orange-500 shrink-0">{t('goalCard.if')}</span>
                                <p className="text-xs text-muted-foreground">{item.obstacle}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] font-bold text-green-500 shrink-0">{t('goalCard.then')}</span>
                                <p className="text-xs font-medium">{item.action || <span className="text-muted-foreground italic">{t('goalCard.noActionDefined')}</span>}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Fallback for old string[] format
                        <ul className="space-y-2">
                          {(woopSource.plan as unknown as string[]).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                              <p className="text-xs text-muted-foreground">{item}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}
          </div>
        )}

        
        {/* Notes Section */}
        {hasNotes && (
          <div>
              <div className="mt-2 p-3 rounded-lg bg-muted/30 border">
                <p className="text-sm text-foreground whitespace-pre-wrap">{goal.notes}</p>
              </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

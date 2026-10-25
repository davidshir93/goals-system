import { useState, useEffect, useId, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { EnrichedGoalType, ID, PlanItem, YearGoal } from "@/types/GoalTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { ProgressStepper } from "./ui/progress-stepper";
import { GoalExpansionDialog } from "./GoalExpansionDialog";
import { ActionMenu } from "./ActionMenu";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Tabs, TabsTrigger, TabsContent } from "./ui/tabs";
import { SlidingTabsList } from "./ui/sliding-tabs-list";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { categoryColorVar } from "@/tokens/categories";

type GoalCardProps = {
  goal: EnrichedGoalType;
  showParentGoals?: boolean;
  onEditWeeklyProgress?: (goalId: ID, done: number) => void;
  onDelete?: (goalId: ID) => void;
  canDelete?: boolean;
  deleteWarning?: string;
  parentYearGoal?: YearGoal;
  /** Names for the parent-goal tags (e.g. "Q3", "2026"); the page looks them up once for all cards. */
  quarterName?: string;
  yearName?: string;
};

export default function GoalCard({
  goal,
  onEditWeeklyProgress,
  showParentGoals = true,
  onDelete,
  canDelete = true,
  deleteWarning,
  parentYearGoal,
  quarterName: quarterNameProp,
  yearName: yearNameProp,
}: GoalCardProps) {
  const { t } = useTranslation()
  const [showWoop, setShowWoop] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localDone, setLocalDone] = useState(goal.done || 0);
  // Two or more columns (sm and up): WOOP opens in a modal so the grid never stretches.
  // One column (mobile): it expands inside the card.
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const cardRef = useRef<HTMLDivElement>(null);
  const woopToggleRef = useRef<HTMLButtonElement>(null);
  const woopPanelId = useId();
  const woopHeadingId = useId();
  const navigate = useNavigate();
  const confirmCancelRef = useRef<HTMLButtonElement>(null);
  // Delete chosen from the menu: move focus into the confirmation (on Cancel, the safe choice).
  useEffect(() => {
    if (showDeleteConfirm) confirmCancelRef.current?.focus();
  }, [showDeleteConfirm]);
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    cardRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus();
  };

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

  // Open on the plan: it's what the card's WOOP line previews, and the part you act on.
  const defaultTab = hasPlan ? "plan" : hasOutcome ? "outcome" : "obstacles";
  // Controlled, so the sliding pill knows the active tab; reset to Plan each time WOOP opens.
  const [woopTab, setWoopTab] = useState(defaultTab);

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


  /* The card shows the start of the WOOP itself (Figma), not a generic
   * "Show WOOP" line: the first plan pair as "If … → …", else the first
   * outcome, else the first obstacle. Quarter and week goals show their
   * year goal's WOOP. */
  const woopPreview = (() => {
    const plan = woopSource?.plan;
    if (isPlanItemArray(plan)) {
      const first = plan[0];
      return t("goalCard.planPreview", {
        obstacle: first.obstacle,
        action: first.action || "…",
        interpolation: { escapeValue: false },
      });
    }
    if (Array.isArray(plan) && typeof plan[0] === "string") return plan[0] as string;
    return woopSource?.outcome?.[0] ?? woopSource?.obstacles?.[0] ?? "";
  })();

  const TAB =
    "type-caption-strong flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-muted-foreground data-[state=active]:text-foreground relative z-10 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-transparent";
  const OUTCOME = "var(--category-fern-fill)";
  const OBSTACLE = "var(--category-ochre-fill)";
  const PLAN = "var(--category-azure-fill)";
  const dot = (color: string, extra = "") => (
    <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${extra}`} style={{ background: color }} />
  );
  const woopTabs = woopSource ? (
    <Tabs value={woopTab} onValueChange={setWoopTab}>
      <SlidingTabsList value={woopTab} className="flex h-auto w-full gap-1 rounded-xl bg-[var(--surface-sunken)] p-1">
        {hasOutcome && <TabsTrigger value="outcome" className={TAB}>{dot(OUTCOME)}{t('goalCard.outcomes')}</TabsTrigger>}
        {hasObstacles && <TabsTrigger value="obstacles" className={TAB}>{dot(OBSTACLE)}{t('goalCard.obstacles')}</TabsTrigger>}
        {hasPlan && <TabsTrigger value="plan" className={TAB}>{dot(PLAN)}{t('goalCard.plan')}</TabsTrigger>}
      </SlidingTabsList>

      {hasOutcome && (
        <TabsContent value="outcome" className="mt-4 animate-[woop-tab-in_var(--motion-woop-tab-content-duration)_var(--motion-woop-tab-content-easing)_both]">
          <ul className="space-y-2">
            {woopSource.outcome!.map((item, index) => (
              <li key={index} className="type-body-text flex items-start gap-2">{dot(OUTCOME, "mt-2")}{item}</li>
            ))}
          </ul>
        </TabsContent>
      )}

      {hasObstacles && (
        <TabsContent value="obstacles" className="mt-4 animate-[woop-tab-in_var(--motion-woop-tab-content-duration)_var(--motion-woop-tab-content-easing)_both]">
          <ul className="space-y-2">
            {woopSource.obstacles!.map((item, index) => (
              <li key={index} className="type-body-text flex items-start gap-2">{dot(OBSTACLE, "mt-2")}{item}</li>
            ))}
          </ul>
        </TabsContent>
      )}

      {hasPlan && (
        <TabsContent value="plan" className="mt-4 animate-[woop-tab-in_var(--motion-woop-tab-content-duration)_var(--motion-woop-tab-content-easing)_both]">
          {isPlanItemArray(woopSource.plan) ? (
            <div className="divide-y">
              {woopSource.plan.map((item, index) => (
                <div key={index} className="grid grid-cols-[3rem_1fr] gap-x-3 gap-y-1.5 py-3 first:pt-0 last:pb-0">
                  <span className="type-caption-strong pt-0.5 tracking-wider" style={{ color: OBSTACLE }}>{t('goalCard.if')}</span>
                  <p className="type-body-text text-muted-foreground">{item.obstacle}</p>
                  <span className="type-caption-strong pt-0.5 tracking-wider" style={{ color: OUTCOME }}>{t('goalCard.then')}</span>
                  <p className="type-body-title">
                    {item.action || <span className="type-body-text italic text-muted-foreground">{t('goalCard.noActionDefined')}</span>}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            // Fallback for old string[] format
            <ul className="space-y-2">
              {(woopSource.plan as unknown as string[]).map((item, index) => (
                <li key={index} className="type-body-text flex items-start gap-2">{dot(PLAN, "mt-2")}{item}</li>
              ))}
            </ul>
          )}
        </TabsContent>
      )}
    </Tabs>
  ) : null;

  const categoryChip = goal.category ? (
    <span className="type-caption-strong inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
      <span aria-hidden="true" className="size-2 rounded-full" style={{ background: categoryColorVar(goal.category.color) }} />
      {goal.category.name}
    </span>
  ) : null;

  /* Parent goals, as in Figma: two quiet lines under the title — the period
   * as a small tag (Q3, then 2026: Week › Quarter › Year), then the goal on one
   * line. Same block on the card and in the expanded view. */
  const periodTag = (label: string) => label.replace(/[:：]\s*$/, "");
  const quarterName = quarterNameProp ?? periodTag(t("goals.parentQuarter"));
  const yearName = yearNameProp ?? periodTag(t("goals.parentYear"));
  const parentRow = (period: string, wish: string) => (
    <div className="flex min-w-0 items-start gap-2">
      <dt className="type-caption-strong shrink-0 rounded-md bg-[var(--surface-sunken)] px-1.5 py-0.5 text-[var(--text-secondary)]">
        {period}
      </dt>
      <dd className="type-caption min-w-0 pt-0.5 line-clamp-2 break-words text-[var(--text-secondary)]" title={wish}>
        {wish}
      </dd>
    </div>
  );
  // Year goals only. Same block on the card and in the expanded view.
  const description =
    goal.type === "year" && goal.description ? (
      <p className="type-body-text text-[var(--text-secondary)]">{goal.description}</p>
    ) : null;

  const parentGoals =
    showParentGoals && (goal.parentQuarterGoalWish || goal.parentYearGoalWish) ? (
      <dl className="min-w-0 space-y-1">
        {goal.parentQuarterGoalWish && parentRow(quarterName, goal.parentQuarterGoalWish)}
        {goal.parentYearGoalWish && parentRow(yearName, goal.parentYearGoalWish)}
      </dl>
    ) : null;

  // Shared by the card and the expanded view.
  const progressControl = (
    <>
        {/* Weekly progress: − / bar / + */}
        {goal.type === "week" && (
          <ProgressStepper
            label={goal.wish}
            value={localDone}
            max={goal.planned}
            color={categoryColorVar(goal.category?.color, "fill", "var(--text-primary)")}
            onChange={(done) => {
              setLocalDone(done); // Update UI immediately
              onEditWeeklyProgress?.(goal.id, done); // Persist to server
            }}
          />
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
                doneColor={categoryColorVar(goal.category?.color)}
                disabled
                isSummary
              />
            </div>
          )}
    </>
  );

  const notesBlock = (
    <>
        {/* Notes Section */}
        {hasNotes && (
          <div>
              <div className="mt-2 p-3 rounded-lg bg-muted/30 border">
                <p className="type-body-text text-foreground whitespace-pre-wrap">{goal.notes}</p>
              </div>
          </div>
        )}
    </>
  );

  return (
    <Card ref={cardRef} data-expanded={isDesktop && showWoop ? "" : undefined} className="h-full gap-4 py-6 transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="grid-cols-[minmax(0,1fr)] gap-2 px-6">
        {/* Badges and Actions Row */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {categoryChip}
          </div>
          <ActionMenu
            label={t("goalCard.moreActions", { goal: goal.wish })}
            triggerContent={
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="19" cy="12" r="1.75" />
              </svg>
            }
            triggerClassName="size-8 shrink-0 text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
            items={[
              {
                label: t("common.edit"),
                icon: (
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                ),
                onSelect: () => navigate(editPath),
              },
              ...(onDelete
                ? [
                    {
                      label: t("common.delete"),
                      tone: "danger" as const,
                      icon: (
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      ),
                      onSelect: () => setShowDeleteConfirm(true),
                    },
                  ]
                : []),
            ]}
          />
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
            {!canDelete && deleteWarning ? (
              <>
                <p className="type-body-title text-destructive">{t('goals.cannotDelete')}</p>
                <p className="type-caption text-destructive/80">{deleteWarning}</p>
                <Button
                  ref={confirmCancelRef}
                  variant="outline"
                  size="sm"
                  onClick={cancelDelete}
                >
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <>
                <p className="type-body-text text-destructive">{t('goals.deleteConfirm')}</p>
                <div className="flex justify-end gap-2">
                  <Button
                    ref={confirmCancelRef}
                    variant="outline"
                    size="sm"
                    onClick={cancelDelete}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Goal Title */}
        <CardTitle className="type-main-title">
          {goal.wish}
        </CardTitle>

        {/* Description - Only for yearly goals */}
        {description}

        {/* Parent goals sit in the heading, 8px under the title (Figma) */}
        {parentGoals}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 px-6">

        {progressControl}

        {notesBlock}

        {/* WOOP Section - Show parent's WOOP for quarter/week goals */}
        {/* Pinned to the bottom, so WOOP lines up across the cards in a row */}
        {hasWoopContent && (
          <div className="mt-auto">
            <button
              ref={woopToggleRef}
              type="button"
              onClick={() => {
                if (!showWoop) setWoopTab(defaultTab);
                setShowWoop(!showWoop);
              }}
              {...(isDesktop
                ? { "aria-haspopup": "dialog" as const }
                : { "aria-expanded": showWoop, "aria-controls": woopPanelId })}
              className="flex w-full min-w-0 cursor-pointer items-center gap-2 text-start"
            >
              <svg
                width={isDesktop ? 14 : 16}
                height={isDesktop ? 14 : 16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={isDesktop ? 2.25 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`shrink-0 text-[var(--text-secondary)] ${!isDesktop && showWoop ? "rotate-180" : ""}`}
                style={{
                  transitionProperty: "transform",
                  transitionDuration: showWoop ? "var(--motion-woop-expand-duration)" : "var(--motion-woop-collapse-duration)",
                  transitionTimingFunction: showWoop ? "var(--motion-woop-expand-easing)" : "var(--motion-woop-collapse-easing)",
                }}
              >
                {isDesktop ? (
                  /* Desktop opens the expanded card in a modal: "open larger", not "expand below" */
                  <>
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </>
                ) : (
                  /* Mobile expands in place, downward */
                  <path d="m6 9 6 6 6-6" />
                )}
              </svg>
              <span className="type-caption-strong shrink-0 uppercase tracking-wider text-[var(--text-secondary)]">WOOP</span>
              {woopPreview && (
                <span className="type-caption min-w-0 truncate text-[var(--text-muted)]">{woopPreview}</span>
              )}
            </button>

            {isDesktop ? (
              showWoop && woopSource && (
                <GoalExpansionDialog
                  originRef={cardRef}
                  eyebrow={categoryChip}
                  title={goal.wish}
                  onClose={() => {
                    setShowWoop(false);
                    woopToggleRef.current?.focus({ preventScroll: true });
                  }}
                >
                  {(description || parentGoals) && (
                    <div className="space-y-2">
                      {description}
                      {parentGoals}
                    </div>
                  )}
                  {progressControl}
                  {woopTabs && (
                    <section aria-labelledby={woopHeadingId} className="space-y-3 border-t pt-6">
                      <h3 id={woopHeadingId} className="type-caption-strong uppercase tracking-wider text-muted-foreground">
                        WOOP
                      </h3>
                      {woopTabs}
                    </section>
                  )}
                  {notesBlock}
                </GoalExpansionDialog>
              )
            ) : (
              /* Mobile: expands in place. Always rendered so it can animate;
                 inert while closed, so it can't be focused or read. */
              <div
                id={woopPanelId}
                inert={!showWoop}
                className="grid"
                style={{
                  gridTemplateRows: showWoop ? "1fr" : "0fr",
                  transitionProperty: "grid-template-rows",
                  transitionDuration: showWoop ? "var(--motion-woop-expand-duration)" : "var(--motion-woop-collapse-duration)",
                  transitionTimingFunction: showWoop ? "var(--motion-woop-expand-easing)" : "var(--motion-woop-collapse-easing)",
                }}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="mt-3">{woopTabs}</div>
                </div>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import type { EnrichedGoalType, ID, PlanItem } from "@/types/GoalTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";

type GoalCardProps = {
  goal: EnrichedGoalType;
  showParentGoals?: boolean;
  onEditWeeklyProgress?: (goalId: ID, done: number) => void;
};

export default function GoalCard({
  goal,
  onEditWeeklyProgress,
  showParentGoals = true,
}: GoalCardProps) {
  const [showWoop, setShowWoop] = useState(false);

  const hasOutcome = goal.outcome && goal.outcome.length > 0;
  const hasObstacles = goal.obstacles && goal.obstacles.length > 0;
  const hasPlan = goal.plan && goal.plan.length > 0;
  const hasWoopContent = hasOutcome || hasObstacles || hasPlan;

  const defaultTab = hasOutcome ? "outcome" : hasObstacles ? "obstacles" : "plan";

  // Type guard for PlanItem
  const isPlanItemArray = (plan: unknown): plan is PlanItem[] => {
    return Array.isArray(plan) && plan.length > 0 && typeof plan[0] === 'object' && 'obstacle' in plan[0];
  };

  const editPath = `/${goal.type}/edit/${goal.id}`;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            {goal.category && (
              <Badge
                variant="default"
                className="text-xs"
                style={{ backgroundColor: goal.category.color }}
              >
                {goal.category.name}
              </Badge>
            )}
            {goal.identity && (
              <Badge
                variant="default"
                className="text-xs"
                style={{ backgroundColor: goal.identity.color }}
              >
                {goal.identity.name}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -mt-1 -mr-2">
            <Link to={editPath}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                <path d="m15 5 4 4"/>
              </svg>
            </Link>
          </Button>
        </div>

        <CardTitle className="text-2xl font-bold leading-tight">{goal.wish}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {showParentGoals && (goal.parentQuarterGoalWish || goal.parentYearGoalWish) && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50 space-y-2">
            {goal.parentYearGoalWish && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5">Year:</span>
                <p className="text-sm font-medium">{goal.parentYearGoalWish}</p>
              </div>
            )}
            {goal.parentQuarterGoalWish && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground shrink-0 pt-0.5">Quarter:</span>
                <p className="text-sm font-medium">{goal.parentQuarterGoalWish}</p>
              </div>
            )}
          </div>
        )}

        {goal.type === "week" && (
          <Slider
            defaultValue={[goal.done || 0]}
            max={goal.planned}
            step={1}
            className="mt-2 cursor-pointer"
            doneColor={goal.category?.color || "black"}
            onValueChange={(val) => {
              const [done] = val;
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
              className="mt-2 cursor-not-allowed"
              doneColor={goal.category?.color || "lightblue"}
              disabled
              isSummary
            />
          )}

        {hasWoopContent && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowWoop(!showWoop)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                className={`transition-transform ${showWoop ? "rotate-90" : ""}`}
              >
                <path d="m9 18 6-6-6-6"/>
              </svg>
              {showWoop ? "Hide" : "Show"} Mental Contrasting
            </button>

            {showWoop && (
              <div className="mt-3 border rounded-lg overflow-hidden">
                <Tabs defaultValue={defaultTab}>
                  <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 p-0 h-auto">
                    {hasOutcome && (
                      <TabsTrigger
                        value="outcome"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent px-4 py-2"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Outcomes
                        </span>
                      </TabsTrigger>
                    )}
                    {hasObstacles && (
                      <TabsTrigger
                        value="obstacles"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-4 py-2"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          Obstacles
                        </span>
                      </TabsTrigger>
                    )}
                    {hasPlan && (
                      <TabsTrigger
                        value="plan"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-4 py-2"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Plan
                        </span>
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {hasOutcome && (
                    <TabsContent value="outcome" className="p-4 mt-0">
                      <div className="space-y-2">
                        {goal.outcome!.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <p className="text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}

                  {hasObstacles && (
                    <TabsContent value="obstacles" className="p-4 mt-0">
                      <div className="space-y-2">
                        {goal.obstacles!.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <p className="text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}

                  {hasPlan && (
                    <TabsContent value="plan" className="p-4 mt-0">
                      <div className="space-y-3">
                        {isPlanItemArray(goal.plan) ? (
                          goal.plan.map((item, index) => (
                            <div key={index} className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                              <div className="flex items-start gap-2 mb-2">
                                <span className="text-xs font-semibold text-orange-600 shrink-0">IF</span>
                                <p className="text-sm text-muted-foreground italic">{item.obstacle}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-green-600 shrink-0">THEN</span>
                                <p className="text-sm font-medium">{item.action || <span className="text-muted-foreground italic">No action defined</span>}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Fallback for old string[] format
                          (goal.plan as unknown as string[]).map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <p className="text-sm">{item}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

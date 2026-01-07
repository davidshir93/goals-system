import type { EnrichedGoalType, ID } from "@/types/GoalTypes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";

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
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex gap-2 ">
          <Badge
            variant="default"
            className="w-fit"
            style={{ backgroundColor: goal.category?.color || "white" }}
          >
            {goal.category?.name || "???"}
          </Badge>
          <Badge
            variant="default"
            className="w-fit"
            style={{ backgroundColor: goal.identity?.color || "white" }}
          >
            {goal.identity?.name || "???"}
          </Badge>
        </div>

        <CardTitle className="text-3xl font-extrabold">{goal.wish}</CardTitle>
        {/* <CardDescription>Card Description</CardDescription> */}
        {/* <CardAction>Card Action</CardAction> */}
      </CardHeader>
      <CardContent>
        {showParentGoals && (
          <div className="mb-6">
            {goal.parentQuarterGoalWish && (
              <div>
                <p className="text-xs">Quarter Goal:</p>
                <p className="mb-2 font-semibold">
                  {goal.parentQuarterGoalWish}
                </p>
              </div>
            )}

            {showParentGoals && goal.parentYearGoalWish && (
              <div>
                <p className="text-xs">Year Goal:</p>
                <p className="mb-2 font-semibold">{goal.parentYearGoalWish}</p>
              </div>
            )}
          </div>
        )}

        {goal.type === "week" && (
          <>
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
          </>
        )}

        {(goal.type === "quarter" || goal.type === "year") &&
          !goal.emptyProgress &&
          goal.doneAveragePercent !== undefined && (
            <>
              <Slider
                value={[Math.round(Number(goal.doneAveragePercent))]}
                max={100}
                step={1}
                className="mt-2 cursor-not-allowed"
                doneColor={goal.category?.color || "lightblue"}
                disabled
                isSummary
              />
            </>
          )}
      </CardContent>
      {/* <CardFooter>
                <p>Card Footer</p>
            </CardFooter> */}
    </Card>
  );
}

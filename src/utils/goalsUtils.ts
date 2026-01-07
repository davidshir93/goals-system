import type {
  Category,
  EnrichedGoalType,
  Goal,
  Identity,
  QuarterGoal,
  YearGoal,
} from "@/types/GoalTypes";

const emptyCategory: Category = {
  id: "no category",
  color: "black",
  name: "No Category",
};

const emptyIdentity: Identity = {
  id: "no identity",
  color: "black",
  name: "No Identity",
};

export function enrichGoal(
  goal: Goal,
  quarterlyGoals: QuarterGoal[],
  yearlyGoals: YearGoal[],
  categories: Category[],
  identities: Identity[]
) {
  let quarterlyGoal: QuarterGoal | undefined, yearlyGoal: YearGoal | undefined;

  const enrichedGoal: EnrichedGoalType = { ...goal };

  if (goal.type === "week") {
    quarterlyGoal = quarterlyGoals?.find(
      (currGoal) => currGoal.id === goal.parentQuarterGoalId
    );

    if (quarterlyGoal) {
      enrichedGoal.parentQuarterGoalWish = quarterlyGoal.wish;
      yearlyGoal = yearlyGoals?.find(
        (currGoal) => currGoal.id === quarterlyGoal!.parentYearGoalId
      );

      if (yearlyGoal) {
        enrichedGoal.parentYearGoalWish = yearlyGoal.wish;
      }
    }
  }

  if (goal.type === "quarter") {
    yearlyGoal = yearlyGoals?.find(
      (currGoal) => currGoal.id === goal.parentYearGoalId
    );

    if (yearlyGoal) {
      enrichedGoal.parentYearGoalWish = yearlyGoal.wish;
    }

    if (goal.weeklyProgress && typeof goal.weeklyProgress === "object") {
      const totalPlanned = Object.values(goal.weeklyProgress).reduce(
        (acc, week) => acc + week.planned,
        0
      );

      const totalDone = Object.values(goal.weeklyProgress).reduce(
        (acc, week) => acc + week.done,
        0
      );

      enrichedGoal.doneAveragePercent =
        totalPlanned > 0 ? (totalDone / totalPlanned) * 100 : 0;
    }
  }

  if (goal.type === "year") {
    yearlyGoal = goal;

    if (goal.quarterProgress && typeof goal.quarterProgress === "object") {
      const totalPlanned = Object.values(goal.quarterProgress).reduce(
        (acc, quarter) => acc + quarter.planned,
        0
      );

      const totalDone = Object.values(goal.quarterProgress).reduce(
        (acc, quarter) => acc + quarter.done,
        0
      );

      enrichedGoal.doneAveragePercent =
        totalPlanned > 0 ? (totalDone / totalPlanned) * 100 : 0;
    }
  }

  enrichedGoal.category =
    categories?.find((cat) => cat.id === yearlyGoal?.categoryId) ||
    emptyCategory;

  enrichedGoal.identity =
    identities?.find((cat) => cat.id === yearlyGoal?.identityId) ||
    emptyIdentity;

  return enrichedGoal;
}

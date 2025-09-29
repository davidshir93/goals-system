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
  }

  if (goal.type === "year") {
    yearlyGoal = goal;
  }

  enrichedGoal.category =
    categories?.find((cat) => cat.id === yearlyGoal?.categoryId) ||
    emptyCategory;

  enrichedGoal.identity =
    identities?.find((cat) => cat.id === yearlyGoal?.identityId) ||
    emptyIdentity;

  return enrichedGoal;
}

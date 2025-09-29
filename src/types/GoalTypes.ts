export type ID = string;

export type Category = {
  id: ID;
  name: string;
  color: string;
};

export type Identity = {
  id: ID;
  name: string;
  color: string;
};

type GoalType = "year" | "quarter" | "week";

type BaseGoal = {
  id: ID;
  type: GoalType;
  wish: string;
  outcome?: string; // required for year goals
  obstacles?: string; // required for year goals
  plan?: string; // required for year goals
  notes?: string;
  yearId: ID;
  // Frontend State Only
  emptyProgress?: boolean;
  doneAveragePercent?: number;
};

export type YearGoal = Omit<BaseGoal, "outcome" | "obstacles" | "plan"> & {
  type: "year";
  categoryId: ID;
  identityId: ID;
  outcome: string;
  obstacles: string;
  plan: string;
};

export type QuarterGoal = BaseGoal & {
  type: "quarter";
  parentYearGoalId: ID;
  quarterId: ID;
};

export type WeekGoal = BaseGoal & {
  type: "week";
  parentQuarterGoalId: ID;
  quarterId: ID;
  weekId: ID;
  planned: number;
  done: number;
};

export type Goal = YearGoal | QuarterGoal | WeekGoal;

export type EnrichedGoalType = Goal & {
  category?: Category;
  identity?: Identity;
  parentQuarterGoalWish?: string;
  parentYearGoalWish?: string;
};

export type Period = {
  id: ID;
  name: string;
  type: "year" | "quarter" | "week";
};

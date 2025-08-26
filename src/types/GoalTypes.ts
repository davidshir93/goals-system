export type ID = string;

type GoalType = "year" | "quarter" | "week";

type BaseGoal = {
  id: ID;
  type: GoalType;
  wish: string;
  outcome?: string; // required for year goals
  obstacle?: string; // required for year goals
  plan?: string; // required for year goals
  notes?: string;
  // Frontend State Only
  emptyProgress?: boolean;
  doneAveragePercent?: number;
};

export type YearGoal = Omit<BaseGoal, "outcome" | "obstacle" | "plan"> & {
  type: "year";
  categoryId: ID;
  identityId: ID;
  outcome: string;
  obstacle: string;
  plan: string;
};

export type QuarterGoal = BaseGoal & {
  type: "quarter";
  parentYearGoalId: ID;
};

export type WeekGoal = BaseGoal & {
  type: "week";
  parentQuarterGoalId: ID;
  planned: number;
  done: number;
};

export type Goal = YearGoal | QuarterGoal | WeekGoal;

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

export type Period = {
  id: ID;
  name: string;
  type: "year" | "quarter" | "week";
};

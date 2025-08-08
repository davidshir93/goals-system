type GoalType = "year" | "quarter" | "week";

type BaseGoal = {
  id: string;
  type: GoalType;
  userId: string;
  periodId: string;
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
  categoryId: string;
  identityId: string;
  outcome: string;
  obstacle: string;
  plan: string;
};

export type QuarterGoal = BaseGoal & {
  type: "quarter";
  parentYearId: string;
};

export type WeekGoal = BaseGoal & {
  type: "week";
  parentQuarterId: string;
  planned: number;
  done: number;
};

export type Goal = YearGoal | QuarterGoal | WeekGoal;

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Identity = {
  id: string;
  name: string;
  color: string;
};

export type Period = {
  id: string;
  type: "year" | "quarter" | "week";
  value: number; // year -> 2025, quarter -> 1..4, week -> 1..52
};

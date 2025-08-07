type GoalType = "year" | "quarter" | "week";

type BaseGoal = {
  id: string;
  type: GoalType;
  userId: string;
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
  timeSlots: number;
  slotsDone: number;
};

export type Goal = YearGoal | QuarterGoal | WeekGoal;

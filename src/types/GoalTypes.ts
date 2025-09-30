export type ID = string;

export type Category = {
  id: ID;
  name: string;
  color: string;
};

export type NewCategoriesPayload = {
  uid: ID;
  items: Category[];
};

export type Identity = {
  id: ID;
  name: string;
  color: string;
};

export type NewIdentitiesPayload = {
  uid: ID;
  items: Identity[];
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

export type NewYearlyGoalPayload = {
  uid: ID;
  yearId: ID;
  yearlyGoalData: Omit<YearGoal, "id">;
};

export type NewQuarterlyGoalPayload = {
  uid: ID;
  yearId: ID;
  quarterId: ID;
  quarterGoalData: Omit<QuarterGoal, "id">;
};

export type NewWeeklyGoalPayload = {
  uid: ID;
  yearId: ID;
  quarterId: ID;
  weekId: ID;
  weeklyGoalData: Omit<WeekGoal, "id">;
};

export type EditWeeklyGoalPayload = {
  uid: ID;
  yearId: ID;
  quarterId: ID;
  weekId: ID;
  goalId: ID;
  updatedFields: Partial<WeekGoal>;
};

export type Period = {
  id: ID;
  name: string;
  type: "year" | "quarter" | "week";
};

export type NewYearPayload = {
  uid: ID;
  newYearId: ID;
  newYearData: Period;
};

export type NewQuarterPayload = {
  uid: ID;
  selectedYear: ID;
  newQuarterId: ID;
  newQuarterData: Period;
};

export type NewWeekPayload = {
  uid: ID;
  selectedYear: ID;
  selectedQuarter: ID;
  newWeekId: ID;
  newWeekData: Period;
};

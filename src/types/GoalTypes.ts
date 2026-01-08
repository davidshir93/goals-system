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

type Progress = {
  goalId: ID;
  planned: number;
  done: number;
};

export type PlanItem = {
  obstacle: string;
  action: string;
};

type BaseGoal = {
  id: ID;
  type: GoalType;
  wish: string;
  outcome?: string[]; // required for year goals
  obstacles?: string[]; // required for year goals
  plan?: PlanItem[]; // required for year goals
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
  outcome: string[];
  obstacles: string[];
  plan: PlanItem[];
  quarterProgress: Progress[] | [];
};

export type QuarterGoal = BaseGoal & {
  type: "quarter";
  parentYearGoalId: ID;
  quarterId: ID;
  weeklyProgress: Progress[] | [];
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
  yearlyGoalData: Omit<YearGoal, "id" | "quarterProgress">;
};

export type NewQuarterlyGoalPayload = {
  uid: ID;
  yearId: ID;
  quarterId: ID;
  quarterGoalData: Omit<QuarterGoal, "id" | "weekProgress">;
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

export type EditYearlyGoalPayload = {
  uid: ID;
  yearId: ID;
  goalId: ID;
  updatedFields: Partial<YearGoal>;
};

export type EditQuarterlyGoalPayload = {
  uid: ID;
  yearId: ID;
  quarterId: ID;
  goalId: ID;
  updatedFields: Partial<QuarterGoal>;
};

export type DeleteYearlyGoalPayload = {
  uid: ID;
  yearId: ID;
  goalId: ID;
};

export type DeleteQuarterlyGoalPayload = {
  uid: ID;
  yearId: ID;
  quarterId: ID;
  goalId: ID;
};

export type DeleteWeeklyGoalPayload = {
  uid: ID;
  yearId: ID;
  quarterId: ID;
  weekId: ID;
  goalId: ID;
};

export type CopyWeeklyGoalsPayload = {
  uid: ID;
  yearId: ID;
  sourceQuarterId: ID;
  sourceWeekId: ID;
  targetQuarterId: ID;
  targetWeekId: ID;
};

export type Period = {
  id: ID;
  name: string;
  type: "year" | "quarter" | "week";
  notes?: string;
};

export type UpdatePeriodNotesPayload = {
  uid: ID;
  yearId: ID;
  quarterId?: ID;
  weekId?: ID;
  periodType: "year" | "quarter" | "week";
  notes: string;
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

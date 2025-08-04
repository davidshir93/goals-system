type Goal = {
  id: string;
  userId: string;
  wish: string;
  outcome?: string;
  obstacle?: string;
  plan?: string;
  notes?: string;
  // Frontend State Only
  emptyProgress?: boolean;
  doneAveragePercent?: number;
};

export type YearlyGoal = Goal & {
  yearId: string;
  categoryId: string;
  identityId: string;
};

export type QuarterlyGoal = Goal & {
  quarterId: string;
  parentYearlyId: string;
};

export type WeeklyGoal = Goal & {
  weekId: string;
  parentQuartelyId: string;
  timeSlots: number;
  slotsDone: number;
};

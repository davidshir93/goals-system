import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  CategoriesRepo,
  IdentitiesRepo,
  QuarterlyGoals,
  QuartersRepo,
  WeeklyGoals,
  WeeksRepo,
  YearlyGoals,
  YearsRepo,
  UserPreferencesRepo,
  type UserPreferences,
} from "./repos";
import type {
  Category,
  CopyWeeklyGoalsPayload,
  DeleteQuarterlyGoalPayload,
  DeleteWeeklyGoalPayload,
  DeleteYearlyGoalPayload,
  EditQuarterlyGoalPayload,
  EditWeeklyGoalPayload,
  EditYearlyGoalPayload,
  ID,
  Identity,
  NewCategoriesPayload,
  NewIdentitiesPayload,
  NewQuarterlyGoalPayload,
  NewQuarterPayload,
  NewWeeklyGoalPayload,
  NewWeekPayload,
  NewYearlyGoalPayload,
  NewYearPayload,
  Period,
  QuarterGoal,
  ReorderQuarterlyGoalsPayload,
  ReorderWeeklyGoalsPayload,
  ReorderYearlyGoalsPayload,
  WeekGoal,
  YearGoal,
} from "@/types/GoalTypes";

const qk = {
  userPreferences: (uid: ID) => ["userPreferences", { uid }] as const,
  categories: (uid: ID) => ["categories", { uid }] as const,
  identities: (uid: ID) => ["identities", { uid }] as const,
  years: (uid: ID) => ["years", { uid }] as const,
  yearlyGoals: (uid: ID, yearId: ID) =>
    ["yearlyGoals", { uid, yearId }] as const,
  quarters: (uid: ID, yearId: ID) => ["quarters", { uid }, { yearId }] as const,
  quarterlyGoals: (uid: ID, yearId: ID, quarterId: ID) =>
    ["quarterlyGoals", { uid, yearId, quarterId }] as const,
  weeks: (uid: ID, yearId: ID, quarterId: ID) =>
    ["weeks", { uid, yearId, quarterId }] as const,
  weeklyGoals: (uid: ID, yearId: ID, quarterId: ID, weekId: ID) =>
    ["weeklyGoals", { uid, yearId, quarterId, weekId }] as const,
};

export function useUserPreferences(uid: ID): UseQueryResult<UserPreferences | null> {
  const enabled = Boolean(uid);

  return useQuery({
    queryKey: qk.userPreferences(uid),
    queryFn: () => UserPreferencesRepo.get(uid),
    staleTime: 60_000,
    enabled,
  });
}

export function useUpdateUserPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, preferences }: { uid: ID; preferences: Partial<UserPreferences> }) =>
      UserPreferencesRepo.update(uid, preferences),

    onSuccess: ({ uid }) => {
      qc.invalidateQueries({ queryKey: qk.userPreferences(uid) });
    },

    onMutate: async ({ uid, preferences }: { uid: ID; preferences: Partial<UserPreferences> }) => {
      await qc.cancelQueries({ queryKey: qk.userPreferences(uid) });
      const prevPreferences: UserPreferences | null = qc.getQueryData(qk.userPreferences(uid)) || null;

      qc.setQueryData(qk.userPreferences(uid), (prev: UserPreferences | null) => ({
        ...prev,
        ...preferences,
      }));

      return { prevPreferences };
    },

    onError(error, { uid }, context) {
      qc.setQueryData(qk.userPreferences(uid), context?.prevPreferences);
      console.log(error);
    },
  });
}

export function useCategories(uid: ID): UseQueryResult<Category[]> {
  const enabled = Boolean(uid);

  return useQuery({
    queryKey: qk.categories(uid),
    queryFn: () => CategoriesRepo.listAll(uid),
    staleTime: 60_000, // 1 min,
    enabled,
  });
}

export function useAddCategories() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, items }: NewCategoriesPayload) =>
      CategoriesRepo.addCategories(uid, items),

    onSuccess: (uid) => {
      qc.invalidateQueries({ queryKey: qk.categories(uid) });
    },

    onMutate: async ({ uid, items }: NewCategoriesPayload) => {
      await qc.cancelQueries({ queryKey: qk.categories(uid) });
      const prevCategories: Category[] =
        qc.getQueryData(qk.categories(uid)) || [];

      qc.setQueryData(qk.categories(uid), items);

      return { prevCategories };
    },

    onError(error, { uid }, context) {
      qc.setQueryData(qk.categories(uid), context?.prevCategories);
      console.log(error);
    },
  });
}

export function useIdentities(uid: ID): UseQueryResult<Identity[]> {
  const enabled = Boolean(uid);

  return useQuery({
    queryKey: qk.identities(uid),
    queryFn: () => IdentitiesRepo.listAll(uid),
    staleTime: 60_000,
    enabled,
  });
}

export function useAddIdentities() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, items }: NewIdentitiesPayload) =>
      IdentitiesRepo.addIdentities(uid, items),

    onSuccess: (uid) => {
      qc.invalidateQueries({ queryKey: qk.identities(uid) });
    },

    onMutate: async ({ uid, items }: NewIdentitiesPayload) => {
      await qc.cancelQueries({ queryKey: qk.identities(uid) });
      const prevIdentities: Category[] =
        qc.getQueryData(qk.identities(uid)) || [];

      qc.setQueryData(qk.identities(uid), items);

      return { prevIdentities };
    },

    onError(error, { uid }, context) {
      qc.setQueryData(qk.identities(uid), context?.prevIdentities);
      console.log(error);
    },
  });
}

export function useYears(uid: ID): UseQueryResult<Period[]> {
  const enabled = Boolean(uid);

  return useQuery({
    queryKey: qk.years(uid),
    queryFn: () => YearsRepo.listAll(uid),
    staleTime: 60_000,
    enabled,
  });
}

export function useAddYear() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, newYearId, newYearData }: NewYearPayload) =>
      YearsRepo.addYear(uid, newYearId, newYearData),

    onSuccess: (uid) => {
      qc.invalidateQueries({ queryKey: qk.years(uid) });
    },

    onMutate: async ({ uid, newYearId, newYearData }: NewYearPayload) => {
      await qc.cancelQueries({ queryKey: qk.years(uid) });
      const prevYears: Period[] = qc.getQueryData(qk.years(uid)) || [];

      qc.setQueryData(qk.years(uid), (prevYears: Period[]) => {
        return [...prevYears, { ...newYearData, id: newYearId }];
      });

      return { prevYears };
    },

    onError(error, { uid }, context) {
      qc.setQueryData(qk.years(uid), context?.prevYears);
      console.log(error);
    },
  });
}

export function useUpdateYearNotes() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, yearId, notes }: { uid: ID; yearId: ID; notes: string }) =>
      YearsRepo.updateNotes(uid, yearId, notes),

    onSuccess: ({ uid }) => {
      qc.invalidateQueries({ queryKey: qk.years(uid) });
    },

    onMutate: async ({ uid, yearId, notes }: { uid: ID; yearId: ID; notes: string }) => {
      await qc.cancelQueries({ queryKey: qk.years(uid) });
      const prevYears: Period[] = qc.getQueryData(qk.years(uid)) || [];

      qc.setQueryData(qk.years(uid), (prevYears: Period[]) => {
        return prevYears.map(y => y.id === yearId ? { ...y, notes } : y);
      });

      return { prevYears };
    },

    onError(error, { uid }, context) {
      qc.setQueryData(qk.years(uid), context?.prevYears);
      console.log(error);
    },
  });
}

export function useYearlyGoals(
  uid: ID,
  yearId: ID
): UseQueryResult<YearGoal[]> {
  const enabled = Boolean(uid) && Boolean(yearId);

  return useQuery({
    queryKey: qk.yearlyGoals(uid, yearId),
    queryFn: () => YearlyGoals.listAll(uid, yearId),
    staleTime: 60_000,
    enabled,
  });
}

export function useAddYearlyGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, yearId, yearlyGoalData }: NewYearlyGoalPayload) =>
      YearlyGoals.addYearlyGoal(uid, yearId, yearlyGoalData),

    onSuccess: ({ uid, yearId }) => {
      qc.invalidateQueries({ queryKey: qk.yearlyGoals(uid, yearId) });
    },

    onMutate: async ({ uid, yearId, yearlyGoalData }: NewYearlyGoalPayload) => {
      await qc.cancelQueries({ queryKey: qk.yearlyGoals(uid, yearId) });

      const prevYearlyGoals: YearGoal[] =
        qc.getQueryData(qk.yearlyGoals(uid, yearId)) || [];

      qc.setQueryData(
        qk.yearlyGoals(uid, yearId),
        (prevYearlyGoals: YearGoal[]) => {
          return [...prevYearlyGoals, { ...yearlyGoalData }];
        }
      );

      return { prevYearlyGoals };
    },

    onError(error, { uid, yearId }, context) {
      qc.setQueryData(qk.yearlyGoals(uid, yearId), context?.prevYearlyGoals);
      console.log(error);
    },
  });
}

export function useEditYearlyGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      yearId,
      goalId,
      updatedFields,
    }: EditYearlyGoalPayload) =>
      YearlyGoals.editYearlyGoal(uid, yearId, goalId, updatedFields),

    onSuccess: ({ uid, yearId }) => {
      qc.invalidateQueries({ queryKey: qk.yearlyGoals(uid, yearId) });
    },

    onMutate: async ({
      uid,
      yearId,
      goalId,
      updatedFields,
    }: EditYearlyGoalPayload) => {
      await qc.cancelQueries({ queryKey: qk.yearlyGoals(uid, yearId) });

      const prevYearlyGoals: YearGoal[] =
        qc.getQueryData(qk.yearlyGoals(uid, yearId)) || [];

      qc.setQueryData(
        qk.yearlyGoals(uid, yearId),
        (prevYearlyGoals: YearGoal[]) => {
          return prevYearlyGoals.map((goal) =>
            goal.id === goalId ? { ...goal, ...updatedFields } : goal
          );
        }
      );

      return { prevYearlyGoals };
    },

    onError(error, { uid, yearId }, context) {
      qc.setQueryData(qk.yearlyGoals(uid, yearId), context?.prevYearlyGoals);
      console.log(error);
    },
  });
}

export function useDeleteYearlyGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, yearId, goalId }: DeleteYearlyGoalPayload) =>
      YearlyGoals.deleteYearlyGoal(uid, yearId, goalId),

    onSuccess: ({ uid, yearId }) => {
      qc.invalidateQueries({ queryKey: qk.yearlyGoals(uid, yearId) });
    },

    onMutate: async ({ uid, yearId, goalId }: DeleteYearlyGoalPayload) => {
      await qc.cancelQueries({ queryKey: qk.yearlyGoals(uid, yearId) });

      const prevYearlyGoals: YearGoal[] =
        qc.getQueryData(qk.yearlyGoals(uid, yearId)) || [];

      qc.setQueryData(
        qk.yearlyGoals(uid, yearId),
        (prevYearlyGoals: YearGoal[]) => {
          return prevYearlyGoals.filter((goal) => goal.id !== goalId);
        }
      );

      return { prevYearlyGoals };
    },

    onError(error, { uid, yearId }, context) {
      qc.setQueryData(qk.yearlyGoals(uid, yearId), context?.prevYearlyGoals);
      console.log(error);
    },
  });
}

export function useQuarters(uid: ID, yearId: ID): UseQueryResult<Period[]> {
  const enabled = Boolean(uid) && Boolean(yearId);

  return useQuery({
    queryKey: qk.quarters(uid, yearId),
    queryFn: () => QuartersRepo.listAll(uid, yearId),
    staleTime: 60_000,
    enabled,
  });
}

export function useAddQuarter() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      selectedYear,
      newQuarterId,
      newQuarterData,
    }: NewQuarterPayload) =>
      QuartersRepo.addQuarter(uid, selectedYear, newQuarterId, newQuarterData),

    onSuccess: ({ uid, selectedYear }) => {
      qc.invalidateQueries({ queryKey: qk.quarters(uid, selectedYear) });
    },

    onMutate: async ({
      uid,
      selectedYear,
      newQuarterId,
      newQuarterData,
    }: NewQuarterPayload) => {
      await qc.cancelQueries({ queryKey: qk.quarters(uid, selectedYear) });
      const prevQuarters: Period[] =
        qc.getQueryData(qk.quarters(uid, selectedYear)) || [];

      qc.setQueryData(
        qk.quarters(uid, selectedYear),
        (prevQuarters: Period[]) => {
          return [...prevQuarters, { ...newQuarterData, id: newQuarterId }];
        }
      );

      return { prevQuarters };
    },

    onError(error, { uid, selectedYear }, context) {
      qc.setQueryData(qk.quarters(uid, selectedYear), context?.prevQuarters);
      console.log(error);
    },
  });
}

export function useUpdateQuarterNotes() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, yearId, quarterId, notes }: { uid: ID; yearId: ID; quarterId: ID; notes: string }) =>
      QuartersRepo.updateNotes(uid, yearId, quarterId, notes),

    onSuccess: ({ uid, yearId }) => {
      qc.invalidateQueries({ queryKey: qk.quarters(uid, yearId) });
    },

    onMutate: async ({ uid, yearId, quarterId, notes }: { uid: ID; yearId: ID; quarterId: ID; notes: string }) => {
      await qc.cancelQueries({ queryKey: qk.quarters(uid, yearId) });
      const prevQuarters: Period[] = qc.getQueryData(qk.quarters(uid, yearId)) || [];

      qc.setQueryData(qk.quarters(uid, yearId), (prevQuarters: Period[]) => {
        return prevQuarters.map(q => q.id === quarterId ? { ...q, notes } : q);
      });

      return { prevQuarters };
    },

    onError(error, { uid, yearId }, context) {
      qc.setQueryData(qk.quarters(uid, yearId), context?.prevQuarters);
      console.log(error);
    },
  });
}

export function useQuarterlyGoals(
  uid: ID,
  yearId: ID,
  quarterId: ID
): UseQueryResult<QuarterGoal[]> {
  const enabled = Boolean(uid) && Boolean(yearId) && Boolean(quarterId);

  return useQuery({
    queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
    queryFn: () => QuarterlyGoals.listAll(uid, yearId, quarterId),
    enabled,
    staleTime: 60_000,
  });
}

export function useAddQuarterlyGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      yearId,
      quarterId,
      quarterGoalData,
    }: NewQuarterlyGoalPayload) =>
      QuarterlyGoals.addQuarterlyGoal(uid, yearId, quarterId, quarterGoalData),

    onSuccess: ({ uid, yearId, quarterId }) => {
      qc.invalidateQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });
    },

    onMutate: async ({
      uid,
      yearId,
      quarterId,
      quarterGoalData,
    }: NewQuarterlyGoalPayload) => {
      await qc.cancelQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });

      const prevQuarterlyGoals: QuarterGoal[] =
        qc.getQueryData(qk.quarterlyGoals(uid, yearId, quarterId)) || [];

      qc.setQueryData(
        qk.quarterlyGoals(uid, yearId, quarterId),
        (prevQuarterlyGoals: QuarterGoal[]) => {
          return [...prevQuarterlyGoals, { ...quarterGoalData }];
        }
      );

      return { prevQuarterlyGoals };
    },

    onError(error, { uid, yearId, quarterId }, context) {
      qc.setQueryData(
        qk.quarterlyGoals(uid, yearId, quarterId),
        context?.prevQuarterlyGoals
      );
      console.log(error);
    },
  });
}

export function useEditQuarterlyGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      yearId,
      quarterId,
      goalId,
      updatedFields,
    }: EditQuarterlyGoalPayload) =>
      QuarterlyGoals.editQuarterlyGoal(
        uid,
        yearId,
        quarterId,
        goalId,
        updatedFields
      ),

    onSuccess: ({ uid, yearId, quarterId }) => {
      qc.invalidateQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });
    },

    onMutate: async ({
      uid,
      yearId,
      quarterId,
      goalId,
      updatedFields,
    }: EditQuarterlyGoalPayload) => {
      await qc.cancelQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });

      const prevQuarterlyGoals: QuarterGoal[] =
        qc.getQueryData(qk.quarterlyGoals(uid, yearId, quarterId)) || [];

      qc.setQueryData(
        qk.quarterlyGoals(uid, yearId, quarterId),
        (prevQuarterlyGoals: QuarterGoal[]) => {
          return prevQuarterlyGoals.map((goal) =>
            goal.id === goalId ? { ...goal, ...updatedFields } : goal
          );
        }
      );

      return { prevQuarterlyGoals };
    },

    onError(error, { uid, yearId, quarterId }, context) {
      qc.setQueryData(
        qk.quarterlyGoals(uid, yearId, quarterId),
        context?.prevQuarterlyGoals
      );
      console.log(error);
    },
  });
}

export function useDeleteQuarterlyGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, yearId, quarterId, goalId }: DeleteQuarterlyGoalPayload) =>
      QuarterlyGoals.deleteQuarterlyGoal(uid, yearId, quarterId, goalId),

    onSuccess: ({ uid, yearId, quarterId }) => {
      qc.invalidateQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });
      // Also invalidate yearly goals since we removed progress from parent
      qc.invalidateQueries({
        queryKey: qk.yearlyGoals(uid, yearId),
      });
    },

    onMutate: async ({ uid, yearId, quarterId, goalId }: DeleteQuarterlyGoalPayload) => {
      await qc.cancelQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });

      const prevQuarterlyGoals: QuarterGoal[] =
        qc.getQueryData(qk.quarterlyGoals(uid, yearId, quarterId)) || [];

      qc.setQueryData(
        qk.quarterlyGoals(uid, yearId, quarterId),
        (prevQuarterlyGoals: QuarterGoal[]) => {
          return prevQuarterlyGoals.filter((goal) => goal.id !== goalId);
        }
      );

      return { prevQuarterlyGoals };
    },

    onError(error, { uid, yearId, quarterId }, context) {
      qc.setQueryData(
        qk.quarterlyGoals(uid, yearId, quarterId),
        context?.prevQuarterlyGoals
      );
      console.log(error);
    },
  });
}

export function useWeeks(
  uid: ID,
  yearId: ID,
  quarterId: ID
): UseQueryResult<Period[]> {
  const enabled = Boolean(uid) && Boolean(yearId) && Boolean(quarterId);

  return useQuery({
    queryKey: qk.weeks(uid, yearId, quarterId),
    queryFn: () => WeeksRepo.listAll(uid, yearId, quarterId),
    staleTime: 60_000,
    enabled,
  });
}

export function useAddWeek() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      selectedYear,
      selectedQuarter,
      newWeekId,
      newWeekData,
    }: NewWeekPayload) =>
      WeeksRepo.addWeek(
        uid,
        selectedYear,
        selectedQuarter,
        newWeekId,
        newWeekData
      ),

    onSuccess: ({ uid, selectedYear, selectedQuarter }) => {
      qc.invalidateQueries({
        queryKey: qk.weeks(uid, selectedYear, selectedQuarter),
      });
    },

    onMutate: async ({
      uid,
      selectedYear,
      selectedQuarter,
      newWeekId,
      newWeekData,
    }: NewWeekPayload) => {
      await qc.cancelQueries({
        queryKey: qk.weeks(uid, selectedYear, selectedQuarter),
      });
      const prevWeeks: Period[] =
        qc.getQueryData(qk.weeks(uid, selectedYear, selectedQuarter)) || [];

      qc.setQueryData(
        qk.weeks(uid, selectedYear, selectedQuarter),
        (prevWeeks: Period[]) => {
          return [...prevWeeks, { ...newWeekData, id: newWeekId }];
        }
      );

      return { prevWeeks };
    },

    onError(error, { uid, selectedYear, selectedQuarter }, context) {
      qc.setQueryData(
        qk.weeks(uid, selectedYear, selectedQuarter),
        context?.prevWeeks
      );
      console.log(error);
    },
  });
}

export function useUpdateWeekNotes() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, yearId, quarterId, weekId, notes }: { uid: ID; yearId: ID; quarterId: ID; weekId: ID; notes: string }) =>
      WeeksRepo.updateNotes(uid, yearId, quarterId, weekId, notes),

    onSuccess: ({ uid, yearId, quarterId }) => {
      qc.invalidateQueries({ queryKey: qk.weeks(uid, yearId, quarterId) });
    },

    onMutate: async ({ uid, yearId, quarterId, weekId, notes }: { uid: ID; yearId: ID; quarterId: ID; weekId: ID; notes: string }) => {
      await qc.cancelQueries({ queryKey: qk.weeks(uid, yearId, quarterId) });
      const prevWeeks: Period[] = qc.getQueryData(qk.weeks(uid, yearId, quarterId)) || [];

      qc.setQueryData(qk.weeks(uid, yearId, quarterId), (prevWeeks: Period[]) => {
        return prevWeeks.map(w => w.id === weekId ? { ...w, notes } : w);
      });

      return { prevWeeks };
    },

    onError(error, { uid, yearId, quarterId }, context) {
      qc.setQueryData(qk.weeks(uid, yearId, quarterId), context?.prevWeeks);
      console.log(error);
    },
  });
}

export function useWeeklyGoals(
  uid: ID,
  yearId: ID,
  quarterId: ID,
  weekId: ID
): UseQueryResult<WeekGoal[]> {
  const enabled =
    Boolean(uid) && Boolean(yearId) && Boolean(quarterId) && Boolean(weekId);

  return useQuery({
    queryKey: qk.weeklyGoals(uid, yearId, quarterId, weekId),
    queryFn: () => WeeklyGoals.listAll(uid, yearId, quarterId, weekId),
    enabled,
    staleTime: 60_000,
  });
}

export function useAddWeeklyGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      yearId,
      quarterId,
      weekId,
      weeklyGoalData,
    }: NewWeeklyGoalPayload) =>
      WeeklyGoals.addWeeklyGoal(uid, yearId, quarterId, weekId, weeklyGoalData),

    onSuccess: ({ uid, yearId, quarterId, weekId }) => {
      qc.invalidateQueries({
        queryKey: qk.weeklyGoals(uid, yearId, quarterId, weekId),
      });
    },

    onMutate: async ({
      uid,
      yearId,
      quarterId,
      weekId,
      weeklyGoalData,
    }: NewWeeklyGoalPayload) => {
      await qc.cancelQueries({
        queryKey: qk.weeklyGoals(uid, yearId, quarterId, weekId),
      });

      const prevWeeklyGoals: WeekGoal[] =
        qc.getQueryData(qk.weeklyGoals(uid, yearId, quarterId, weekId)) || [];

      qc.setQueryData(
        qk.weeklyGoals(uid, yearId, quarterId, weekId),
        (prevWeeklyGoals: WeekGoal[]) => {
          return [...prevWeeklyGoals, { ...weeklyGoalData }];
        }
      );

      return { prevWeeklyGoals };
    },

    onError(error, { uid, yearId, quarterId, weekId }, context) {
      qc.setQueryData(
        qk.weeklyGoals(uid, yearId, quarterId, weekId),
        context?.prevWeeklyGoals
      );
      console.log(error);
    },
  });
}

export function UseEditWeeklyGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      yearId,
      quarterId,
      weekId,
      goalId,
      updatedFields,
    }: EditWeeklyGoalPayload) =>
      WeeklyGoals.editWeeklyGoal(
        uid,
        yearId,
        quarterId,
        weekId,
        goalId,
        updatedFields
      ),

    onSuccess: ({ uid, yearId, quarterId, weekId }) => {
      qc.invalidateQueries({
        queryKey: qk.weeklyGoals(uid, yearId, quarterId, weekId),
      });
      qc.invalidateQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });
      qc.invalidateQueries({
        queryKey: qk.yearlyGoals(uid, yearId),
      });
    },

    onMutate: async ({
      uid,
      yearId,
      quarterId,
      weekId,
    }: EditWeeklyGoalPayload) => {
      await qc.cancelQueries({
        queryKey: qk.weeklyGoals(uid, yearId, quarterId, weekId),
      });

      const prevWeeklyGoals: WeekGoal[] =
        qc.getQueryData(qk.weeklyGoals(uid, yearId, quarterId, weekId)) || [];

      qc.setQueryData(
        qk.weeklyGoals(uid, yearId, quarterId, weekId),
        (prevWeeklyGoals: WeekGoal[]) => {
          return [...prevWeeklyGoals];
        }
      );

      return { prevWeeklyGoals };
    },

    onError(error, { uid, yearId, quarterId, weekId }, context) {
      qc.setQueryData(
        qk.weeklyGoals(uid, yearId, quarterId, weekId),
        context?.prevWeeklyGoals
      );
      console.log(error);
    },
  });
}

export function useDeleteWeeklyGoal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      yearId,
      quarterId,
      weekId,
      goalId,
    }: DeleteWeeklyGoalPayload) =>
      WeeklyGoals.deleteWeeklyGoal(uid, yearId, quarterId, weekId, goalId),

    onSuccess: ({ uid, yearId, quarterId, weekId }) => {
      qc.invalidateQueries({
        queryKey: qk.weeklyGoals(uid, yearId, quarterId, weekId),
      });
      // Also invalidate quarterly and yearly goals since we removed progress from parents
      qc.invalidateQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });
      qc.invalidateQueries({
        queryKey: qk.yearlyGoals(uid, yearId),
      });
    },

    onMutate: async ({
      uid,
      yearId,
      quarterId,
      weekId,
      goalId,
    }: DeleteWeeklyGoalPayload) => {
      await qc.cancelQueries({
        queryKey: qk.weeklyGoals(uid, yearId, quarterId, weekId),
      });

      const prevWeeklyGoals: WeekGoal[] =
        qc.getQueryData(qk.weeklyGoals(uid, yearId, quarterId, weekId)) || [];

      qc.setQueryData(
        qk.weeklyGoals(uid, yearId, quarterId, weekId),
        (prevWeeklyGoals: WeekGoal[]) => {
          return prevWeeklyGoals.filter((goal) => goal.id !== goalId);
        }
      );

      return { prevWeeklyGoals };
    },

    onError(error, { uid, yearId, quarterId, weekId }, context) {
      qc.setQueryData(
        qk.weeklyGoals(uid, yearId, quarterId, weekId),
        context?.prevWeeklyGoals
      );
      console.log(error);
    },
  });
}

export function useCopyWeeklyGoals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      yearId,
      sourceQuarterId,
      sourceWeekId,
      targetQuarterId,
      targetWeekId,
    }: CopyWeeklyGoalsPayload) =>
      WeeklyGoals.copyFromWeek(
        uid,
        yearId,
        sourceQuarterId,
        sourceWeekId,
        targetQuarterId,
        targetWeekId
      ),

    onSuccess: (createdGoals, { uid, yearId, targetQuarterId, targetWeekId }) => {
      // Set the newly created goals in cache
      qc.setQueryData(
        qk.weeklyGoals(uid, yearId, targetQuarterId, targetWeekId),
        createdGoals
      );
    },

    onError(error) {
      console.error("Error copying weekly goals:", error);
    },
  });
}

export function useReorderYearlyGoals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, yearId, orderedGoalIds }: ReorderYearlyGoalsPayload) =>
      YearlyGoals.reorderGoals(uid, yearId, orderedGoalIds),

    onMutate: async ({ uid, yearId, orderedGoalIds }: ReorderYearlyGoalsPayload) => {
      await qc.cancelQueries({ queryKey: qk.yearlyGoals(uid, yearId) });

      const prevYearlyGoals: YearGoal[] =
        qc.getQueryData(qk.yearlyGoals(uid, yearId)) || [];

      // Optimistically update with new order
      const reorderedGoals = orderedGoalIds
        .map((id, index) => {
          const goal = prevYearlyGoals.find((g) => g.id === id);
          return goal ? { ...goal, sortOrder: index } : null;
        })
        .filter((g): g is YearGoal => g !== null);

      qc.setQueryData(qk.yearlyGoals(uid, yearId), reorderedGoals);

      return { prevYearlyGoals };
    },

    onError(error, { uid, yearId }, context) {
      qc.setQueryData(qk.yearlyGoals(uid, yearId), context?.prevYearlyGoals);
      console.error("Error reordering yearly goals:", error);
    },

    onSuccess: ({ uid, yearId }) => {
      qc.invalidateQueries({ queryKey: qk.yearlyGoals(uid, yearId) });
    },
  });
}

export function useReorderQuarterlyGoals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      yearId,
      quarterId,
      orderedGoalIds,
    }: ReorderQuarterlyGoalsPayload) =>
      QuarterlyGoals.reorderGoals(uid, yearId, quarterId, orderedGoalIds),

    onMutate: async ({
      uid,
      yearId,
      quarterId,
      orderedGoalIds,
    }: ReorderQuarterlyGoalsPayload) => {
      await qc.cancelQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });

      const prevQuarterlyGoals: QuarterGoal[] =
        qc.getQueryData(qk.quarterlyGoals(uid, yearId, quarterId)) || [];

      // Optimistically update with new order
      const reorderedGoals = orderedGoalIds
        .map((id, index) => {
          const goal = prevQuarterlyGoals.find((g) => g.id === id);
          return goal ? { ...goal, sortOrder: index } : null;
        })
        .filter((g): g is QuarterGoal => g !== null);

      qc.setQueryData(qk.quarterlyGoals(uid, yearId, quarterId), reorderedGoals);

      return { prevQuarterlyGoals };
    },

    onError(error, { uid, yearId, quarterId }, context) {
      qc.setQueryData(
        qk.quarterlyGoals(uid, yearId, quarterId),
        context?.prevQuarterlyGoals
      );
      console.error("Error reordering quarterly goals:", error);
    },

    onSuccess: ({ uid, yearId, quarterId }) => {
      qc.invalidateQueries({
        queryKey: qk.quarterlyGoals(uid, yearId, quarterId),
      });
    },
  });
}

export function useReorderWeeklyGoals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      uid,
      yearId,
      quarterId,
      weekId,
      orderedGoalIds,
    }: ReorderWeeklyGoalsPayload) =>
      WeeklyGoals.reorderGoals(uid, yearId, quarterId, weekId, orderedGoalIds),

    onMutate: async ({
      uid,
      yearId,
      quarterId,
      weekId,
      orderedGoalIds,
    }: ReorderWeeklyGoalsPayload) => {
      await qc.cancelQueries({
        queryKey: qk.weeklyGoals(uid, yearId, quarterId, weekId),
      });

      const prevWeeklyGoals: WeekGoal[] =
        qc.getQueryData(qk.weeklyGoals(uid, yearId, quarterId, weekId)) || [];

      // Optimistically update with new order
      const reorderedGoals = orderedGoalIds
        .map((id, index) => {
          const goal = prevWeeklyGoals.find((g) => g.id === id);
          return goal ? { ...goal, sortOrder: index } : null;
        })
        .filter((g): g is WeekGoal => g !== null);

      qc.setQueryData(
        qk.weeklyGoals(uid, yearId, quarterId, weekId),
        reorderedGoals
      );

      return { prevWeeklyGoals };
    },

    onError(error, { uid, yearId, quarterId, weekId }, context) {
      qc.setQueryData(
        qk.weeklyGoals(uid, yearId, quarterId, weekId),
        context?.prevWeeklyGoals
      );
      console.error("Error reordering weekly goals:", error);
    },

    onSuccess: ({ uid, yearId, quarterId, weekId }) => {
      qc.invalidateQueries({
        queryKey: qk.weeklyGoals(uid, yearId, quarterId, weekId),
      });
    },
  });
}

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
} from "./repos";
import type {
  Category,
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
  WeekGoal,
  YearGoal,
} from "@/types/GoalTypes";

const qk = {
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

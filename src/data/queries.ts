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

export function useIdentities(uid: ID): UseQueryResult<Identity[]> {
  const enabled = Boolean(uid);

  return useQuery({
    queryKey: qk.identities(uid),
    queryFn: () => IdentitiesRepo.listAll(uid),
    staleTime: 60_000,
    enabled,
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

type NewYearPayload = {
  uid: ID;
  newYearId: ID;
  newYearData: Period;
};

export function useAddYear() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, newYearId, newYearData }: NewYearPayload) =>
      YearsRepo.addYear(uid, newYearId, newYearData),
    onSuccess: (uid) => {
      // invalidate the list for this year so UI refreshes
      qc.invalidateQueries({ queryKey: qk.years(uid) });
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

export function useQuarters(uid: ID, yearId: ID): UseQueryResult<Period[]> {
  const enabled = Boolean(uid) && Boolean(yearId);

  return useQuery({
    queryKey: qk.quarters(uid, yearId),
    queryFn: () => QuartersRepo.listAll(uid, yearId),
    staleTime: 60_000,
    enabled,
  });
}

type NewQuarterPayload = {
  uid: ID;
  selectedYear: ID;
  newQuarterId: ID;
  newQuarterData: Period;
};

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
      // invalidate the list for this year so UI refreshes
      qc.invalidateQueries({ queryKey: qk.quarters(uid, selectedYear) });
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

type NewWeekPayload = {
  uid: ID;
  selectedYear: ID;
  selectedQuarter: ID;
  newWeekId: ID;
  newWeekData: Period;
};

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
      // invalidate the list for this year so UI refreshes
      qc.invalidateQueries({
        queryKey: qk.weeks(uid, selectedYear, selectedQuarter),
      });
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

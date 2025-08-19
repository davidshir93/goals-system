import { useQuery, type UseQueryResult } from "@tanstack/react-query";
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
  console.log("entered useCategories, uid: " + uid);
  return useQuery({
    queryKey: qk.categories(uid),
    queryFn: () => CategoriesRepo.listAll(uid),
    staleTime: 60_000, // 1 min
  });
}

export function useIdentities(uid: ID): UseQueryResult<Identity[]> {
  return useQuery({
    queryKey: qk.identities(uid),
    queryFn: () => IdentitiesRepo.listAll(uid),
    staleTime: 60_000,
  });
}

export function useYears(uid: ID): UseQueryResult<Period[]> {
  return useQuery({
    queryKey: qk.years(uid),
    queryFn: () => YearsRepo.listAll(uid),
    staleTime: 60_000,
  });
}

export function useYearlyGoals(
  uid: ID,
  yearId: ID
): UseQueryResult<YearGoal[]> {
  return useQuery({
    queryKey: qk.yearlyGoals(uid, yearId),
    queryFn: () => YearlyGoals.listAll(uid, yearId),
    staleTime: 60_000,
  });
}

export function useQuarters(
  uid: ID,
  yearId: ID
  // options?: { enabled?: boolean }
): UseQueryResult<Period[]> {
  return useQuery({
    queryKey: qk.quarters(uid, yearId),
    queryFn: () => QuartersRepo.listAll(uid, yearId),
    // enabled: !!uid && !!yearId && (options?.enabled ?? true),
    staleTime: 60_000,
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
  // options?: { enabled?: boolean }
): UseQueryResult<Period[]> {
  return useQuery({
    queryKey: qk.weeks(uid, yearId, quarterId),
    queryFn: () => WeeksRepo.listAll(uid, yearId, quarterId),
    // enabled: !!uid && !!yearId && (options?.enabled ?? true),
    staleTime: 60_000,
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

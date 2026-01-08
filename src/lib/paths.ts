import type { ID } from "@/types/GoalTypes";

export const paths = {
  user: (uid: ID) => `usersData/${uid}`,
  userPreferences: (uid: ID) => `${paths.user(uid)}/preferences/settings`,
  categories: (uid: ID) => `${paths.user(uid)}/categories`,
  identities: (uid: ID) => `${paths.user(uid)}/identities`,
  years: (uid: ID) => `${paths.user(uid)}/years`,
  yearlyGoals: (uid: ID, yearId: ID) =>
    `${paths.user(uid)}/years/${yearId}/yearlyGoals`,
  quarters: (uid: ID, yearId: ID) =>
    `${paths.user(uid)}/years/${yearId}/quarters`,
  quarterlyGoals: (uid: ID, yearId: ID, quarterId: ID) =>
    `${paths.user(uid)}/years/${yearId}/quarters/${quarterId}/quarterlyGoals`,
  weeks: (uid: ID, yearId: ID, quarterId: ID) =>
    `${paths.user(uid)}/years/${yearId}/quarters/${quarterId}/weeks`,
  weeklyGoals: (uid: ID, yearId: ID, quarterId: ID, weekId: ID) =>
    `${paths.user(
      uid
    )}/years/${yearId}/quarters/${quarterId}/weeks/${weekId}/weeklygoals`,
};

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useOnboarding, type Level } from "@/hooks/useOnboarding";

/* Keeps a typed-in or bookmarked URL from skipping a step: /week before a quarter
 * exists goes to the nearest page you can use, and /quarter/new without a yearly
 * goal goes back to /quarter, which explains what's missing. */
export function LevelGuard({ level, adding, children }: { level: Level; adding?: boolean; children: ReactNode }) {
  const onboarding = useOnboarding();
  if (!onboarding.ready) return null;
  if (!onboarding.canOpen(level)) return <Navigate to={`/${onboarding.nearestOpen(level)}`} replace />;
  if (adding && !onboarding.canAddGoal(level)) return <Navigate to={`/${level}`} replace />;
  return <>{children}</>;
}

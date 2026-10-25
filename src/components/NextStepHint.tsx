import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOnboarding, type Level } from "@/hooks/useOnboarding";
import { Button } from "./ui/button";

const ORDER: Record<Level, number> = { year: 0, quarter: 1, week: 2 };

/* Onboarding nudge under the goals: once this page is done (e.g. the first yearly
 * goal is in), point to the page where the next step happens. Hidden once the
 * account is fully set up, and on the page the next step is on. */
export function NextStepHint({ level }: { level: Level }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ready, step, homePage } = useOnboarding();
  if (!ready || step === "ready" || ORDER[homePage] <= ORDER[level]) return null;

  const text =
    step === "createQuarter" ? t("onboarding.nextCreateQuarter")
    : step === "addQuarterGoal" ? t("onboarding.nextAddQuarterGoal")
    : t("onboarding.nextCreateWeek");
  const action = homePage === "quarter" ? t("onboarding.openQuarter") : t("onboarding.openWeek");

  return (
    <aside className="flex flex-col items-start gap-3 rounded-xl bg-[var(--surface-sunken)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:ring-1 dark:ring-inset dark:ring-[var(--border-subtle)]">
      <p className="type-body-text text-[var(--text-primary)]">{text}</p>
      <Button onClick={() => navigate(`/${homePage}`)}>{action}</Button>
    </aside>
  );
}

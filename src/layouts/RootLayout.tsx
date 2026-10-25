import { NavBar } from "@/components/NavBar"
import { WeekSkeleton } from "@/components/WeekSkeleton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useGoals } from "@/context/GoalsContext";
import { useCategories, useQuarterlyGoals, useQuarters, useWeeklyGoals, useWeeks, useYearlyGoals, useYears } from "@/data/queries";
import { useEffect, useState } from "react";
import { Outlet, ScrollRestoration } from "react-router"
import { useTranslation } from "react-i18next"

const STUCK_LOADING_MS = 5_000

export function RootLayout() {
    const { t } = useTranslation()
    const { loading: authLoading, user } = useAuth()
    const { selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, selectedWeek, setSelectedWeek } = useGoals();

    const { data: years, isLoading: yearsLoading, error: yearsErr } = useYears(user?.uid || '');
    const { data: quarters, isLoading: quartersLoading, error: quartersErr } = useQuarters(user?.uid || '', selectedYear);
    const { data: weeks, isLoading: weeksLoading, error: weeksErr } = useWeeks(user?.uid || '', selectedYear, selectedQuarter);
    const { isLoading: catLoading } = useCategories(user?.uid || "");
    const { isLoading: yearlyGoalsLoading } = useYearlyGoals(user?.uid || "", selectedYear);
    const { isLoading: quarterlyGoalsLoading } = useQuarterlyGoals(user?.uid || "", selectedYear, selectedQuarter);
    const { isLoading: weeklyGoalsLoading } = useWeeklyGoals(user?.uid || "", selectedYear, selectedQuarter, selectedWeek);

    useEffect(() => {
        if (years?.length && years[years?.length - 1]) {
            // TODO: support saving the last selected period in localStorage too
            setSelectedYear(years[years?.length - 1].id)
        } else {
            setSelectedYear("")
        }
    }, [years, setSelectedYear])

    useEffect(() => {
        if (quarters?.length && quarters[quarters?.length - 1]) {
            // TODO: support saving the last selected period in localStorage too
            setSelectedQuarter(quarters[quarters?.length - 1].id)
        } else {
            setSelectedQuarter("")
        }
    }, [quarters, setSelectedQuarter])

    useEffect(() => {
        if (weeks?.length && weeks[weeks?.length - 1]) {
            // TODO: support saving the last selected period in localStorage too
            setSelectedWeek(weeks[weeks?.length - 1].id)
        } else {
            setSelectedWeek("")
        }
    }, [weeks, setSelectedWeek])

    const appLoading = authLoading || yearsLoading || quartersLoading || weeksLoading || weeklyGoalsLoading || quarterlyGoalsLoading || yearlyGoalsLoading || catLoading;

    const [stuck, setStuck] = useState(false);

    useEffect(() => {
        if (!appLoading) {
            setStuck(false);
            return;
        }
        const timer = setTimeout(() => setStuck(true), STUCK_LOADING_MS);
        return () => clearTimeout(timer);
    }, [appLoading]);

    if (appLoading) return (
        <div className="min-h-dvh bg-background">
            <NavBar />
            <main>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                    <WeekSkeleton />
                    {stuck && (
                        <div className="mt-6 flex flex-col items-center gap-2 text-center">
                            <p className="type-body-text text-[var(--text-secondary)]">{t('common.stillLoading')}</p>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                {t('common.reloadPage')}
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )

    const appError = yearsErr || quartersErr || weeksErr;

    if (appError) throw new Error('Error in fetching data' + JSON.stringify(yearsErr) + JSON.stringify(quartersErr) + JSON.stringify(weeksErr))

    return (
        <div className="min-h-dvh bg-background">
            <NavBar />
            <ScrollRestoration />
            <main>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                    {!appLoading && <Outlet />}
                </div>
            </main>
        </div>
    )
}

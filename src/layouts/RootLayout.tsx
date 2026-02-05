import { NavBar } from "@/components/NavBar"
import { useAuth } from "@/context/AuthContext"
import { useGoals } from "@/context/GoalsContext";
import { useCategories, useIdentities, useQuarterlyGoals, useQuarters, useWeeklyGoals, useWeeks, useYearlyGoals, useYears } from "@/data/queries";
import { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router"
import { useTranslation } from "react-i18next"

export function RootLayout() {
    const { t } = useTranslation()
    const { loading: authLoading, user } = useAuth()
    const { selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, selectedWeek, setSelectedWeek } = useGoals();

    const { data: years, isLoading: yearsLoading, error: yearsErr } = useYears(user?.uid || '');
    const { data: quarters, isLoading: quartersLoading, error: quartersErr } = useQuarters(user?.uid || '', selectedYear);
    const { data: weeks, isLoading: weeksLoading, error: weeksErr } = useWeeks(user?.uid || '', selectedYear, selectedQuarter);
    const { isLoading: catLoading } = useCategories(user?.uid || "");
    const { isLoading: idLoading } = useIdentities(user?.uid || "");
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

    const appLoading = authLoading || yearsLoading || quartersLoading || weeksLoading || weeklyGoalsLoading || quarterlyGoalsLoading || yearlyGoalsLoading || catLoading || idLoading;

    if (appLoading) return (
        <div className="flex items-center flex-col justify-center text-center min-h-dvh bg-background">
            <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
        </div>
                <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>            
                </div>
    )

    const appError = yearsErr || quartersErr || weeksErr;

    if (appError) throw new Error('Error in fetching data' + JSON.stringify(yearsErr) + JSON.stringify(quartersErr) + JSON.stringify(weeksErr))

    return (
        <div className="min-h-dvh bg-background">
            <NavBar />
            <ScrollRestoration />
            <main className={`${appLoading ? "loading" : ""}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                    {!appLoading && <Outlet />}
                </div>
            </main>
        </div>
    )
}

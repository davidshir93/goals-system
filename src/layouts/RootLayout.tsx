import { NavBar } from "@/components/NavBar"
import { WeekSkeleton } from "@/components/WeekSkeleton"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/Modal"
import { useAuth } from "@/context/AuthContext"
import { useGoals } from "@/context/GoalsContext";
import { useCategories, useQuarterlyGoals, useQuarters, useWeeklyGoals, useWeeks, useYearlyGoals, useYears } from "@/data/queries";
import { useEffect, useState } from "react";
import { Outlet, ScrollRestoration } from "react-router"
import { useTranslation } from "react-i18next"

// Long enough for a slow phone connection to finish a normal launch.
const STUCK_LOADING_MS = 12_000

const latestId = (periods?: { id: string }[]) => periods?.length ? periods[periods.length - 1].id : ""

export function RootLayout() {
    const { t } = useTranslation()
    const { loading: authLoading, user } = useAuth()
    const { selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, selectedWeek, setSelectedWeek } = useGoals();

    const { data: years, error: yearsErr } = useYears(user?.uid || '');
    const { data: quarters, error: quartersErr } = useQuarters(user?.uid || '', selectedYear);
    const { data: weeks, error: weeksErr } = useWeeks(user?.uid || '', selectedYear, selectedQuarter);
    const { data: categories } = useCategories(user?.uid || "");
    const { data: yearlyGoals } = useYearlyGoals(user?.uid || "", selectedYear);
    const { data: quarterlyGoals } = useQuarterlyGoals(user?.uid || "", selectedYear, selectedQuarter);
    const { data: weeklyGoals } = useWeeklyGoals(user?.uid || "", selectedYear, selectedQuarter, selectedWeek);

    useEffect(() => {
        // Still loading: keep the remembered period so the queries below it can start.
        if (!years) return
        setSelectedYear(latestId(years))
    }, [years, setSelectedYear])

    useEffect(() => {
        // Still loading: keep the remembered period so the queries below it can start.
        if (!quarters) return
        setSelectedQuarter(latestId(quarters))
    }, [quarters, setSelectedQuarter])

    useEffect(() => {
        // Still loading: keep the remembered period so the queries below it can start.
        if (!weeks) return
        setSelectedWeek(latestId(weeks))
    }, [weeks, setSelectedWeek])

    /* Loading is decided from the data, not from isLoading. Each level's query
     * only starts once the level above has picked its period, so between levels
     * nothing is "loading" for a render — gating on isLoading showed the app,
     * then the skeleton again, once per level. */
    const selectedDataLoaded =
        years !== undefined && categories !== undefined &&
        (years.length === 0 || (selectedYear !== "" && quarters !== undefined && yearlyGoals !== undefined &&
            (quarters.length === 0 || (selectedQuarter !== "" && weeks !== undefined && quarterlyGoals !== undefined &&
                (weeks.length === 0 || (selectedWeek !== "" && weeklyGoals !== undefined))))));

    // On launch, also wait until the latest period is the one selected, so the
    // app opens once, on the right week.
    const onLatestPeriod =
        selectedYear === latestId(years) && selectedQuarter === latestId(quarters) && selectedWeek === latestId(weeks);

    const [launched, setLaunched] = useState(false);
    const ready = !authLoading && (!user || (selectedDataLoaded && (launched || onLatestPeriod)));
    useEffect(() => {
        if (ready) setLaunched(true);
    }, [ready]);

    const appLoading = !ready;

    const [stuck, setStuck] = useState(false);
    const [keepWaiting, setKeepWaiting] = useState(false);

    useEffect(() => {
        if (!appLoading) {
            setStuck(false);
            setKeepWaiting(false); // a later slow load asks again
            return;
        }
        const timer = setTimeout(() => setStuck(true), STUCK_LOADING_MS);
        return () => clearTimeout(timer);
    }, [appLoading]);

    const appError = yearsErr || quartersErr || weeksErr;

    if (appError) throw new Error('Error in fetching data' + JSON.stringify(yearsErr) + JSON.stringify(quartersErr) + JSON.stringify(weeksErr))

    if (appLoading) return (
        <div className="min-h-dvh bg-background">
            <NavBar />
            <main>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
                    <WeekSkeleton />
                </div>
            </main>
            {/* Stuck: a centred dialog over everything, so it can't be missed on a
                phone. "Keep waiting" closes it; the skeleton stays and the app
                still opens on its own if the data arrives. */}
            <Modal isOpen={stuck && !keepWaiting} onClose={() => setKeepWaiting(true)} labelledBy="stuck-title">
                <div className="flex flex-col items-center gap-4 text-center">
                    <h2 id="stuck-title" className="type-body-title text-[var(--text-primary)]">{t('common.stillLoading')}</h2>
                    <p className="type-body-text text-[var(--text-secondary)]">{t('common.stuckHint')}</p>
                    <div className="flex w-full flex-col gap-2">
                        <Button autoFocus className="w-full" onClick={() => window.location.reload()}>
                            {t('common.reloadPage')}
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => setKeepWaiting(true)}>
                            {t('common.keepWaiting')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )

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

import { NavBar } from "@/components/NavBar"
import { useAuth } from "@/context/AuthContext"
import { useGoals } from "@/context/GoalsContext";
import { useQuarters, useWeeks, useYears } from "@/data/queries";
import { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router"

export function RootLayout() {
    const { loading: authLoading, user } = useAuth()
    const { selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, setSelectedWeek } = useGoals();

    const { data: years, isLoading: yearsLoading, error: yearsErr } = useYears(user?.uid || '');
    const { data: quarters, isLoading: quartersLoading, error: quartersErr } = useQuarters(user?.uid || '', selectedYear);
    const { data: weeks, isLoading: weeksLoading, error: weeksErr } = useWeeks(user?.uid || '', selectedYear, selectedQuarter);

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

    const appLoading = authLoading || yearsLoading || quartersLoading || weeksLoading;

    if (appLoading) return <div className="loading-spinner" />

    const appError = yearsErr || quartersErr || weeksErr;

    if (appError) throw new Error('Error in fetching data' + JSON.stringify(yearsErr) + JSON.stringify(quartersErr) + JSON.stringify(weeksErr))

    return (
        <>
            <NavBar />
            <ScrollRestoration />
            {/* TODO: Handle data loading state UI */}
            <div className={`container mx-auto max-w-md mb-6 p-6 ${appLoading ? "loading" : ""}`}>
                {!appLoading && <Outlet />}
            </div>
        </>
    )
}

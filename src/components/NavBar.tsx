import { useAuth } from "@/context/AuthContext"
import { NavLink } from "react-router-dom"
import { Button } from "./ui/button"
import { useGoals } from "@/context/GoalsContext"
import PeriodSelector from "./PeriodSelector"
import { useQuarters, useWeeks, useYears } from "@/data/queries"
import { useEffect } from "react"

export const NavBar = () => {
    const { user, logOut } = useAuth()
    const { selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, selectedWeek, setSelectedWeek } = useGoals();

    const { data: years, isLoading: yearsLoading, error: yearsErr } = useYears(user?.uid || '');

    useEffect(() => {
        if (years?.length && years[years?.length - 1]) {
            setSelectedYear(years[years?.length - 1].id)
            console.log('>>>>>SET selected year as');
            console.log(years[years?.length - 1].id);
        }
    }, [years, setSelectedYear])

    // const { data: quarters, isLoading: quartersLoading, error: quartersErr } = useQuarters(user?.uid || '', selectedYear, { enabled: !!user?.uid && !!selectedYear });
    const { data: quarters, isLoading: quartersLoading, error: quartersErr } = useQuarters(user?.uid || '', selectedYear);

    useEffect(() => {
        console.log('fetched quarters');
        console.log(quarters);
    }, [quarters])

    useEffect(() => {
        if (quarters?.length && quarters[quarters?.length - 1]) {
            setSelectedQuarter(quarters[quarters?.length - 1].id)
            console.log('>>>>>SET selected quarter as');
            console.log(quarters[quarters?.length - 1].id);
        }
    }, [quarters, setSelectedQuarter])

    // const { data: weeks, isLoading: weeksLoading, error: weeksErr } = useWeeks(user?.uid || '', selectedYear, { enabled: !!user?.uid && !!selectedYear });
    const { data: weeks, isLoading: weeksLoading, error: weeksErr } = useWeeks(user?.uid || '', selectedYear, selectedQuarter);

    useEffect(() => {
        console.log('fetched weeks');
        console.log(weeks);
    }, [weeks])

    useEffect(() => {
        if (weeks?.length && weeks[weeks?.length - 1]) {
            setSelectedWeek(weeks[weeks?.length - 1].id)
            console.log('>>>>>SET selected week as');
            console.log(weeks[weeks?.length - 1].id);
        }
    }, [weeks, setSelectedWeek])

    return <nav className="top-nav mt-4">
        <ul className="nav-list bottom-4 flex gap-8 mx-auto justify-center items-center">
            {
                user == null ?
                    <>
                        <li>
                            <NavLink to="/login">Login</NavLink>
                        </li>
                        <li>
                            <NavLink to="/signup">Signup</NavLink>
                        </li>
                    </>
                    : <>
                        <li>
                            <NavLink to="/week" className="flex flex-col justify-center items-center gap-1">
                                Week
                                {/* <PeriodSelector isLoading={true} periods={weeks} /> */}
                                <PeriodSelector isLoading={weeksLoading || weeksErr} periods={weeks} selectedPeriod={selectedWeek} onChange={setSelectedWeek} width={90} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/quarter" className="flex flex-col justify-center items-center gap-1">
                                Quarter
                                {/* <PeriodSelector periods={quarters} /> */}

                                <PeriodSelector isLoading={quartersLoading || quartersErr} periods={quarters} selectedPeriod={selectedQuarter} onChange={setSelectedQuarter} width={90} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/year" className="flex flex-col justify-center items-center gap-1">
                                Year
                                <PeriodSelector isLoading={yearsLoading || yearsErr} periods={years} selectedPeriod={selectedYear} onChange={setSelectedYear} width={90} />
                            </NavLink>
                        </li>
                        <li>
                            <Button onClick={logOut}>Logout</Button>
                        </li>
                    </>
            }
        </ul>
    </nav >
}
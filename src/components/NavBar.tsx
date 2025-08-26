import { useAuth } from "@/context/AuthContext"
import { NavLink } from "react-router-dom"
import { Button } from "./ui/button"
import { useGoals } from "@/context/GoalsContext"
import PeriodSelector from "./PeriodSelector"
import { useQuarters, useWeeks, useYears } from "@/data/queries"

export const NavBar = () => {
    const { user, logOut } = useAuth()
    const { selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, selectedWeek, setSelectedWeek } = useGoals();

    const { data: years } = useYears(user?.uid || '');
    const { data: quarters } = useQuarters(user?.uid || '', selectedYear);
    const { data: weeks } = useWeeks(user?.uid || '', selectedYear, selectedQuarter);

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
                                <PeriodSelector type='week' periods={weeks ?? []} selectedPeriod={selectedWeek} onChange={setSelectedWeek} width={90} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/quarter" className="flex flex-col justify-center items-center gap-1">
                                Quarter
                                <PeriodSelector type="quarter" periods={quarters ?? []} selectedPeriod={selectedQuarter} onChange={setSelectedQuarter} width={90} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/year" className="flex flex-col justify-center items-center gap-1">
                                Year
                                <PeriodSelector type="year" periods={years ?? []} selectedPeriod={selectedYear} onChange={setSelectedYear} width={90} />
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
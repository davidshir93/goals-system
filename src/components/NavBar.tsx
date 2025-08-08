import { useAuth } from "@/context/AuthContext"
import { NavLink } from "react-router-dom"
import { Button } from "./ui/button"
import { useGoals } from "@/context/GoalsContext"
import PeriodSelector from "./PeriodSelector"

export const NavBar = () => {
    const { user, logOut } = useAuth()
    const { periods } = useGoals();

    const years = periods.filter(period => period.type === 'year')
    const quarters = periods.filter(period => period.type === 'quarter')
    const weeks = periods.filter(period => period.type === 'week')

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
                                <PeriodSelector periods={weeks} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/quarter" className="flex flex-col justify-center items-center gap-1">
                                Quarter
                                <PeriodSelector periods={quarters} />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/year" className="flex flex-col justify-center items-center gap-1">
                                Year
                                <PeriodSelector periods={years} width={90} />
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
import { useAuth } from "@/context/AuthContext"
import { NavLink } from "react-router-dom"
import { Button } from "./ui/button"

export const NavBar = () => {
    const { user, logOut } = useAuth()
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
                            <NavLink to="/week">Week</NavLink>
                        </li>
                        <li>
                            <NavLink to="/quarter">Quarter</NavLink>
                        </li>
                        <li>
                            <NavLink to="/year">Year</NavLink>
                        </li>
                        <li>
                            <Button onClick={logOut}>Logout</Button>
                        </li>
                    </>
            }
        </ul>
    </nav>
}
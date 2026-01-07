import { useAuth } from "@/context/AuthContext"
import { NavLink } from "react-router-dom"
import { Button } from "./ui/button"
import { useGoals } from "@/context/GoalsContext"
import PeriodSelector from "./PeriodSelector"
import { useQuarters, useWeeks, useYears } from "@/data/queries"
import { ThemeToggle } from "./ThemeToggle"
import { useState } from "react"

export const NavBar = () => {
    const { user, logOut } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, selectedWeek, setSelectedWeek } = useGoals();

    const { data: years } = useYears(user?.uid || '');
    const { data: quarters } = useQuarters(user?.uid || '', selectedYear);
    const { data: weeks } = useWeeks(user?.uid || '', selectedYear, selectedQuarter);

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`;

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo / Brand */}
                    <div className="flex items-center gap-2">
                        <NavLink to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
                            Goals
                        </NavLink>
                    </div>

                    {/* Desktop Navigation */}
                    {user && (
                        <div className="hidden md:flex items-center gap-1">
                            <NavLink to="/week" className={navLinkClasses}>
                                <div className="flex items-center gap-2">
                                    <span>Week</span>
                                    <PeriodSelector
                                        type='week'
                                        periods={weeks ?? []}
                                        selectedPeriod={selectedWeek}
                                        onChange={setSelectedWeek}
                                        width={100}
                                    />
                                </div>
                            </NavLink>
                            <NavLink to="/quarter" className={navLinkClasses}>
                                <div className="flex items-center gap-2">
                                    <span>Quarter</span>
                                    <PeriodSelector
                                        type="quarter"
                                        periods={quarters ?? []}
                                        selectedPeriod={selectedQuarter}
                                        onChange={setSelectedQuarter}
                                        width={100}
                                    />
                                </div>
                            </NavLink>
                            <NavLink to="/year" className={navLinkClasses}>
                                <div className="flex items-center gap-2">
                                    <span>Year</span>
                                    <PeriodSelector
                                        type="year"
                                        periods={years ?? []}
                                        selectedPeriod={selectedYear}
                                        onChange={setSelectedYear}
                                        width={100}
                                    />
                                </div>
                            </NavLink>
                        </div>
                    )}

                    {/* Right side actions */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {user ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logOut}
                                    className="hidden md:flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" x2="9" y1="12" y2="12" />
                                    </svg>
                                    Logout
                                </Button>

                                {/* Mobile menu button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    aria-label="Toggle menu"
                                >
                                    {mobileMenuOpen ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="4" x2="20" y1="12" y2="12" />
                                            <line x1="4" x2="20" y1="6" y2="6" />
                                            <line x1="4" x2="20" y1="18" y2="18" />
                                        </svg>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <NavLink to="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </NavLink>
                                <NavLink to="/signup">
                                    <Button size="sm">Sign Up</Button>
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && user && (
                    <div className="md:hidden border-t py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <NavLink
                            to="/week"
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="font-medium">Week</span>
                            <PeriodSelector
                                type='week'
                                periods={weeks ?? []}
                                selectedPeriod={selectedWeek}
                                onChange={setSelectedWeek}
                                width={110}
                            />
                        </NavLink>
                        <NavLink
                            to="/quarter"
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="font-medium">Quarter</span>
                            <PeriodSelector
                                type="quarter"
                                periods={quarters ?? []}
                                selectedPeriod={selectedQuarter}
                                onChange={setSelectedQuarter}
                                width={110}
                            />
                        </NavLink>
                        <NavLink
                            to="/year"
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="font-medium">Year</span>
                            <PeriodSelector
                                type="year"
                                periods={years ?? []}
                                selectedPeriod={selectedYear}
                                onChange={setSelectedYear}
                                width={110}
                            />
                        </NavLink>
                        <div className="pt-2 border-t mt-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    logOut()
                                    setMobileMenuOpen(false)
                                }}
                                className="w-full justify-start"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" x2="9" y1="12" y2="12" />
                                </svg>
                                Logout
                            </Button>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}

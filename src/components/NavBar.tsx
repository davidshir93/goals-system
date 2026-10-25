import { useAuth } from "@/context/AuthContext"
import { NavLink } from "react-router-dom"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { AccountMenu } from "./AccountMenu"
import { useTranslation } from "react-i18next"

/* Top bar, as in Figma: the logo, then language, theme and the account menu.
 * Moving between Year, Quarter and Week happens in each page's breadcrumb. */
export const NavBar = () => {
    const { t } = useTranslation()
    const { user, loading } = useAuth()

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-background">
            <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <NavLink to="/" className="type-main-title hover:opacity-80 transition-opacity">
                        {t('nav.brand')}
                    </NavLink>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        {loading ? null : user ? (
                            <AccountMenu />
                        ) : (
                            <div className="flex items-center gap-2">
                                <NavLink to="/login">
                                    <Button variant="ghost" size="sm">{t('nav.login')}</Button>
                                </NavLink>
                                <NavLink to="/signup">
                                    <Button size="sm">{t('nav.signUp')}</Button>
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}

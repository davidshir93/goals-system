import { NavBar } from "@/components/NavBar"
import { AuthProvider } from "@/context/AuthContext"
import { Outlet, ScrollRestoration, useNavigation } from "react-router"

export function RootLayout() {
    const { state } = useNavigation()
    const isLoading = state === "loading"

    return (
        <AuthProvider>
            <NavBar />
            <ScrollRestoration />
            {isLoading && <div className="loading-spinner" />}
            <div className={`container mx-auto mb-6 p-6 ${isLoading ? "loading" : ""}`}>
                <Outlet />
            </div>
        </AuthProvider>
    )
}

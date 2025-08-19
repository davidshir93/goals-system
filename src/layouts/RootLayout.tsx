import { NavBar } from "@/components/NavBar"
import { useAuth } from "@/context/AuthContext"
import { Outlet, ScrollRestoration } from "react-router"

export function RootLayout() {
    const { loading } = useAuth()

    if (loading) return <div className="loading-spinner" />
    return (
        <>
            <NavBar />
            <ScrollRestoration />
            {/* TODO: Handle data loading state UI */}
            <div className={`container mx-auto max-w-md mb-6 p-6 ${loading ? "loading" : ""}`}>
                {!loading && <Outlet />}
            </div>
        </>
    )
}

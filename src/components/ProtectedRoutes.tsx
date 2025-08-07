import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoutes() {
    const { user } = useAuth()
    const location = useLocation();

    return user !== null ? <Outlet /> : <Navigate to="/login" state={{ from: location }} />
}
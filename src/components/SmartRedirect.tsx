import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import { useYears, useQuarters, useWeeks } from "@/data/queries";
import { Navigate } from "react-router-dom";

export default function SmartRedirect() {
    const { user } = useAuth();
    const { selectedYear, selectedQuarter } = useGoals();

    const { data: years, isLoading: yearsLoading } = useYears(user?.uid || '');
    const { data: quarters, isLoading: quartersLoading } = useQuarters(user?.uid || '', selectedYear);
    const { data: weeks, isLoading: weeksLoading } = useWeeks(user?.uid || '', selectedYear, selectedQuarter);

    // Wait for data to load before deciding where to redirect
    if (yearsLoading) {
        return null; // Loading state handled by RootLayout
    }

    // No years exist - go to year page to create first period
    if (!years || years.length === 0) {
        return <Navigate to="/year" replace />;
    }

    // Years exist but checking quarters
    if (quartersLoading) {
        return null;
    }

    // No quarters exist - go to quarter page to create first quarter
    if (!quarters || quarters.length === 0) {
        return <Navigate to="/quarter" replace />;
    }

    // Quarters exist but checking weeks
    if (weeksLoading) {
        return null;
    }

    // No weeks exist - go to week page to create first week
    if (!weeks || weeks.length === 0) {
        return <Navigate to="/week" replace />;
    }

    // All periods exist - go to week (most specific)
    return <Navigate to="/week" replace />;
}

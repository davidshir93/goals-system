import type { Dispatch, ReactNode, SetStateAction } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Category, ID, Identity, Period } from "@/types/GoalTypes"

type GoalsContextType = {
    loading: boolean
    categories: Category[]
    identities: Identity[]
    periods: Period[],
    selectedYear: ID,
    selectedQuarter: ID,
    selectedWeek: ID,
    setSelectedYear: Dispatch<SetStateAction<ID>>,
    setSelectedQuarter: Dispatch<SetStateAction<ID>>,
    setSelectedWeek: Dispatch<SetStateAction<ID>>,
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined)

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<Category[]>([])
    const [identities, setIdentities] = useState<Identity[]>([])
    const [periods, setPeriods] = useState<Period[]>([])
    const [selectedYear, setSelectedYear] = useState<ID>("")
    const [selectedQuarter, setSelectedQuarter] = useState<ID>("")
    const [selectedWeek, setSelectedWeek] = useState<ID>("")

    useEffect(() => {
        // Mock yearly goals
        setGoals([
            {
                id: "1",
                type: "year",
                periodId: "year-2025",
                wish: "Build this project",
                categoryId: "cat-1",
                identityId: "idn-1",
                outcome: "Win the world!",
                obstacle: "Angry people",
                plan: "Compassion and patience",
                notes: "Focus on MVP first"
            },
            {
                id: "2",
                type: "year",
                periodId: "year-2025",
                userId: "user-1",
                wish: "Travel to Japan",
                categoryId: "cat-2",
                identityId: "idn-2",
                outcome: "Experience new culture",
                obstacle: "Budget",
                plan: "Save monthly",
                notes: "Book tickets early"
            },
            // Mock quarterly goals
            {
                id: "q1",
                type: "quarter",
                periodId: "quarter-2025-3",
                userId: "user-1",
                wish: "Finish MVP",
                parentYearId: "1",
                notes: "Prioritize core features"
            },
            // Mock weekly goals
            {
                id: "w1",
                type: "week",
                periodId: "week-2025-08",
                userId: "user-1",
                wish: "Implement auth",
                parentQuarterId: "q1",
                planned: 5,
                done: 0,
                notes: "Use custom provider",
            }
        ]);

        // Mock categories
        setCategories([
            { id: crypto.randomUUID(), name: "Development", color: "#b2d1ffff" },
            { id: crypto.randomUUID(), name: "Travel", color: "#bbffbdff" }
        ]);

        // Mock identities
        setIdentities([
            { id: crypto.randomUUID(), name: "Builder", color: "#aab7ffff" },
            { id: crypto.randomUUID(), name: "Explorer", color: "#bbfff8ff" }
        ]);

        // Mock periods
        setPeriods(seedPeriods())

        setLoading(false);
    }, []);

    return (
        <GoalsContext.Provider value={{ loading, periods, categories, identities, selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, selectedWeek, setSelectedWeek }}>
            {children}
        </GoalsContext.Provider>
    )
}

export const useGoals = () => {
    const context = useContext(GoalsContext)
    if (!context) {
        throw new Error("useGoals must be used within a GoalsProvider")
    }
    return context
}
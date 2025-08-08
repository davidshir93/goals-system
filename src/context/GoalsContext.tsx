import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Category, Goal, Identity, Period } from "@/types/GoalTypes"

type GoalsContextType = {
    loading: boolean
    goals: Goal[]
    categories: Category[]
    identities: Identity[]
    periods: Period[]
}

const GoalsContext = createContext<GoalsContextType | undefined>({
    loading: true,
    goals: [],
    categories: [],
    identities: [],
    periods: []
})

// mock generator
const seedPeriods = (year = 2025): Period[] => {
    const yearPeriod: Period = { id: `year-${year}`, type: "year", value: year };

    const quarterPeriods: Period[] = Array.from({ length: 4 }, (_, i) => {
        const q = i + 1;
        return { id: `quarter-${year}-${q}`, type: "quarter", value: q };
    });

    // keep it simple: 52 weeks (ISO sometimes has 53, but 52 is fine for mock)
    const weekPeriods: Period[] = Array.from({ length: 13 }, (_, i) => {
        const w = i + 1;
        const wStr = String(w).padStart(2, "0");
        return { id: `week-${year}-${wStr}`, type: "week", value: w };
    });

    return [yearPeriod, ...quarterPeriods, ...weekPeriods];
};

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true)
    const [goals, setGoals] = useState<Goal[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [identities, setIdentities] = useState<Identity[]>([])
    const [periods, setPeriods] = useState<Period[]>([])

    useEffect(() => {
        // Mock yearly goals
        setGoals([
            {
                id: "1",
                type: "year",
                periodId: "year-2025",
                userId: "user-1",
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
            { id: "cat-1", name: "Development", color: "#ff9800" },
            { id: "cat-2", name: "Travel", color: "#4caf50" }
        ]);

        // Mock identities
        setIdentities([
            { id: "idn-1", name: "Builder", color: "#3f51b5" },
            { id: "idn-2", name: "Explorer", color: "#009688" }
        ]);

        // Mock periods
        setPeriods(seedPeriods())

        setLoading(false);
    }, []);

    return (
        <GoalsContext.Provider value={{ loading, goals, periods, categories, identities }}>
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
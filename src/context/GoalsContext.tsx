import type { Dispatch, ReactNode, SetStateAction } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { ID } from "@/types/GoalTypes"

type GoalsContextType = {
    selectedYear: ID,
    selectedQuarter: ID,
    selectedWeek: ID,
    setSelectedYear: Dispatch<SetStateAction<ID>>,
    setSelectedQuarter: Dispatch<SetStateAction<ID>>,
    setSelectedWeek: Dispatch<SetStateAction<ID>>,
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined)

// The last selected period, so on launch the year, quarter and week queries can
// start together instead of waiting on each other (RootLayout still corrects
// the selection to the latest period once the lists arrive).
const STORAGE_KEY = "selectedPeriod"

function readStoredPeriod(): { year: ID; quarter: ID; week: ID } {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
        return { year: stored.year ?? "", quarter: stored.quarter ?? "", week: stored.week ?? "" }
    } catch {
        return { year: "", quarter: "", week: "" }
    }
}

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
    const [stored] = useState(readStoredPeriod)
    const [selectedYear, setSelectedYear] = useState<ID>(stored.year)
    const [selectedQuarter, setSelectedQuarter] = useState<ID>(stored.quarter)
    const [selectedWeek, setSelectedWeek] = useState<ID>(stored.week)

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ year: selectedYear, quarter: selectedQuarter, week: selectedWeek }))
        } catch {
            // Storage blocked (private mode): launch just loads one level at a time.
        }
    }, [selectedYear, selectedQuarter, selectedWeek])

    return (
        <GoalsContext.Provider value={{ selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, selectedWeek, setSelectedWeek }}>
            {children}
        </GoalsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGoals = () => {
    const context = useContext(GoalsContext)
    if (!context) {
        throw new Error("useGoals must be used within a GoalsProvider")
    }
    return context
}
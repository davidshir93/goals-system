import type { Dispatch, ReactNode, SetStateAction } from "react"
import { createContext, useContext, useState } from "react"
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

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
    const [selectedYear, setSelectedYear] = useState<ID>("")
    const [selectedQuarter, setSelectedQuarter] = useState<ID>("")
    const [selectedWeek, setSelectedWeek] = useState<ID>("")

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
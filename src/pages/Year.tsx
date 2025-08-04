import type { YearlyGoal } from "@/types/GoalTypes"

type YearProps = {
    yearlyGoals: YearlyGoal[]
}

export default function Year({ yearlyGoals }: YearProps) {
    return (
        <>
            <div>Year</div>
            {yearlyGoals.length > 0 && 'All Yearly Goals'}
            {yearlyGoals[0]}
        </>
    )
}
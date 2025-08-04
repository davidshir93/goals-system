import type { QuarterlyGoal, WeeklyGoal, YearlyGoal } from '@/types/GoalTypes'

type Props = { goal: YearlyGoal | QuarterlyGoal | WeeklyGoal }

export default function GoalCard({ goal }: Props) {
    return (
        <div>GoalCard</div>
    )
}
import { useGoals } from "@/context/GoalsContext"

export default function Quarter() {
    const { goals } = useGoals();

    const quarterGoals = goals.filter(goal => goal.type === 'quarter');
    return (
        <>
            <ul>
                {quarterGoals.map(goal => <li>{JSON.stringify(goal)}</li>)}
            </ul>
        </>

    )
}
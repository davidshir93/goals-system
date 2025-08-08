import { useGoals } from "@/context/GoalsContext"

export default function Year() {
    const { goals } = useGoals();

    const yearGoals = goals.filter(goal => goal.type === 'year');
    return (
        <>
            <ul>
                {yearGoals.map(goal => <li>{JSON.stringify(goal)}</li>)}
            </ul>
        </>

    )
}
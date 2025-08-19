
import type { ID, Period } from "@/types/GoalTypes"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

type Props = {
    isLoading?: boolean,
    selectedPeriod: ID,
    periods: Period[],
    onChange: (value: ID) => void
    width?: number
}

export default function PeriodSelector({ isLoading, periods, selectedPeriod, onChange, width = 80 }: Props) {
    if (periods?.length < 1 || isLoading) return null

    return (
        <Select
            value={selectedPeriod}
            onValueChange={(val) => onChange(val)}
        >
            <SelectTrigger className={`w-[${width}px]`}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {isLoading ? <SelectItem key="loading" value="loading">Loading...</SelectItem>
                        : periods.map(period => <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
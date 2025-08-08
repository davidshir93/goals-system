
import type { Period } from "@/types/GoalTypes"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"

type Props = { periods: Period[], width?: number }

export default function PeriodSelector({ periods, width = 80 }: Props) {
    if (periods.length < 1) return null
    return (
        <Select >
            <SelectTrigger className={`w-[${width}px]`}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{periods[0].type}</SelectLabel>
                    {periods.map(period => <SelectItem key={period.id} value={period.value.toString()}>{period.value.toString()}</SelectItem>)}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
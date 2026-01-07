
import type { ID, Period } from "@/types/GoalTypes"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useState } from "react"
import PeriodForm from "./PeriodForm"
import { Modal } from "./Modal"

type Props = {
    type: 'week' | 'quarter' | 'year',
    selectedPeriod: ID,
    periods: Period[],
    onChange: (value: ID) => void
    width?: number
}

export default function PeriodSelector({ type, periods, selectedPeriod, onChange, width = 80 }: Props) {

    const [newPeriodModalOpen, setNewPeriodModalOpen] = useState(false)

    let showNewButton = false;
    switch (type) {
        case 'year':
            showNewButton = true;
            break;

        case 'quarter':
            showNewButton = periods?.length < 4 || true;
            break;

        case "week":
            showNewButton = periods?.length < 13 || true;
            break;

        default:
            break;
    }

    const handleValueChange = (val: string) => {
        if (val === 'new') {
            setNewPeriodModalOpen(true)
        } else {
            onChange(val)
        }
    }

    return (<>
        <Select
            value={selectedPeriod}
            onValueChange={handleValueChange}
        >
            <SelectTrigger className="h-8 text-xs" style={{ width: `${width}px` }}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {periods.map(period => <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>)}
                    {showNewButton && <SelectItem key='new' value='new'>New {type[0].toUpperCase() + type.slice(1)}</SelectItem>}
                </SelectGroup>
            </SelectContent>
        </Select>
        <Modal isOpen={newPeriodModalOpen} onClose={() => setNewPeriodModalOpen(false)}>
            <PeriodForm type={type} existPeriods={periods} closeModal={() => setNewPeriodModalOpen(false)} />
        </Modal>
    </>

    )
}
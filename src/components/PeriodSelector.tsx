
import type { ID, Period } from "@/types/GoalTypes"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useState } from "react"
import PeriodForm from "./PeriodForm"
import { Modal } from "./Modal"
import { useTranslation } from "react-i18next"

type Props = {
    type: 'week' | 'quarter' | 'year',
    selectedPeriod: ID,
    periods: Period[],
    onChange: (value: ID) => void
    width?: number
    /** "chevron": only the ⌄ button, for the page breadcrumb. Needs `label`. */
    variant?: 'default' | 'chevron'
    /** Accessible name for the chevron variant, e.g. "Change year". */
    label?: string
    /** Chevron variant: grey, for levels below the current page. */
    muted?: boolean
}

export default function PeriodSelector({ type, periods, selectedPeriod, onChange, width = 80, variant = 'default', label, muted = false }: Props) {
    const { t } = useTranslation()

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

    const getNewPeriodText = () => {
        switch (type) {
            case 'year': return t('periods.newYear')
            case 'quarter': return t('periods.newQuarter')
            case 'week': return t('periods.newWeek')
        }
    }

    return (<>
        <Select
            value={selectedPeriod}
            onValueChange={handleValueChange}
        >
            {variant === 'chevron' ? (
                <SelectTrigger
                    aria-label={label}
                    className={"size-8 justify-center gap-0 rounded-full border-0 bg-transparent p-0 shadow-none hover:bg-[var(--border-subtle)] dark:bg-transparent dark:hover:bg-[var(--border-subtle)] data-[size=default]:h-8 [&>span:first-child]:hidden [&_svg]:size-5 [&_svg]:opacity-100 " + (muted ? "[&_svg:not([class*='text-'])]:text-[var(--text-muted)]" : "[&_svg:not([class*='text-'])]:text-[var(--text-secondary)]")}
                />
            ) : (
                <SelectTrigger className="type-caption h-8" style={{ width: `${width}px` }}>
                    <SelectValue />
                </SelectTrigger>
            )}
            <SelectContent>
                <SelectGroup>
                    {periods.map(period => <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>)}
                    {showNewButton && <SelectItem key='new' value='new'>{getNewPeriodText()}</SelectItem>}
                </SelectGroup>
            </SelectContent>
        </Select>
        <Modal isOpen={newPeriodModalOpen} onClose={() => setNewPeriodModalOpen(false)}>
            <PeriodForm type={type} existPeriods={periods} closeModal={() => setNewPeriodModalOpen(false)} />
        </Modal>
    </>

    )
}

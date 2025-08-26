import * as z from 'zod'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from './ui/form'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useAuth } from '@/context/AuthContext'
import { useGoals } from '@/context/GoalsContext'
import { IntFromInput } from '@/schemas/common'
import type { Period } from '@/types/GoalTypes'
import { getCurrentQuarter, getCurrentWeekInQuarter } from '@/utils/dates'
import { useAddQuarter, useAddWeek, useAddYear } from '@/data/queries'

type PeriodFormProps = {
    type: 'year' | 'quarter' | 'week',
    existPeriods: Period[],
    closeModal: () => void
}

export default function PeriodForm({ type, existPeriods, closeModal }: PeriodFormProps) {

    const YearlyPeriodFormSchema = z.object({
        type: z.literal('year'),
        name: IntFromInput.refine((n) => n >= 1900 && n < 2100, "Year must be ≥ 1900")
            .refine((n) => !existPeriods.find(year => year.name == n.toString()), "Year already exist"),
    });

    const QuarterlyPeriodFormSchema = z.object({
        type: z.literal('quarter'),
        name: IntFromInput.refine((n) => n >= 1 && n <= 4, "Quarter must be between 1 and 4")
            .refine((n) => !existPeriods.find(quarter => quarter.name == 'Q' + n.toString()), "Quarter already exist"),
    });

    const WeeklyPeriodFormSchema = z.object({
        type: z.literal('week'),
        name: IntFromInput.refine((n) => n >= 1 && n <= 13, "Week must be between 1 and 13")
            .refine((n) => !existPeriods.find(week => week.name == 'W' + n.toString()), "Week already exist"),
    });

    const PerTypeSchema = z.discriminatedUnion("type", [
        YearlyPeriodFormSchema,
        QuarterlyPeriodFormSchema,
        WeeklyPeriodFormSchema
    ])

    type PeriodFormType = z.infer<typeof PerTypeSchema>;
    type PeriodFormOutput = z.output<typeof PerTypeSchema>;

    const defaultValues: PeriodFormType =
        type === 'year'
            ? { type: 'year', name: new Date().getFullYear() }
            : type === 'quarter'
                ? { type: 'quarter', name: getCurrentQuarter() }
                : { type: 'week', name: getCurrentWeekInQuarter() };

    const form = useForm<PeriodFormType>({
        resolver: zodResolver(PerTypeSchema) as Resolver<PeriodFormOutput>,
        defaultValues,
    })

    const { user } = useAuth()

    const { selectedYear, selectedQuarter } = useGoals();

    const addYear = useAddYear();
    const addQuarter = useAddQuarter();
    const addWeek = useAddWeek();

    const handleSubmit = async (data: PeriodFormType) => {
        console.log('>>>>> ENTERED handleSubmit');

        if (!user || (type === 'quarter' && !selectedYear) || (type === 'week' && (!selectedYear || !selectedQuarter))) return

        let id, dataToSend;

        switch (type) {
            case 'year':
                console.log(data);
                id = data.name.toString();
                dataToSend = {
                    id,
                    type,
                    name: data.name.toString()
                }
                await addYear.mutateAsync({ uid: user.uid, newYearId: id, newYearData: dataToSend })
                break;

            case 'quarter':
                console.log(data);
                id = selectedYear + '-' + data.name.toString();
                dataToSend = {
                    type,
                    id,
                    name: 'Q' + data.name.toString()
                }
                await addQuarter.mutateAsync({ uid: user.uid, selectedYear, newQuarterId: id, newQuarterData: dataToSend })
                break;

            case 'week':
                console.log(data);
                id = selectedQuarter + '-' + data.name.toString();
                dataToSend = {
                    type,
                    id,
                    name: 'W' + data.name.toString()
                }
                await addWeek.mutateAsync({ uid: user.uid, selectedYear, selectedQuarter, newWeekId: id, newWeekData: dataToSend })
                break;

            default:
                console.log('No type passed!!!');

        }

        closeModal()
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()} className='mt-4 grid grid-cols-1 gap-4'>

                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New {type}</FormLabel>
                                <FormControl>
                                    <Input type='number' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type='button' onClick={form.handleSubmit(handleSubmit, (err) => console.error('Validation errors:', err))}>Add</Button>
                </form>
            </Form >
        </>

    )
}
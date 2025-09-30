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
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Id, IntFromInput } from '@/schemas/common'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useAddQuarterlyGoal, useAddWeeklyGoal, useAddYearlyGoal, useCategories, useIdentities, useQuarterlyGoals, useYearlyGoals } from '@/data/queries'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '@/context/GoalsContext'
import type { ID } from '@/types/GoalTypes'
import { Modal } from './Modal'
import ItemsListForm from './ItemsListForm'
import { useState } from 'react'

type GoalFormProps = {
    type: 'year' | 'quarter' | 'week'
}

const AllGoalsFormSchema = z.object({
    type: z.union([z.literal('year'), z.literal('quarter'), z.literal('week')]),
    wish: z.string().min(10, "The first step to achieving a goal is to write a wish!").max(120, "Max 120 chars"),
    outcome: z.string().trim().optional().default(""),
    obstacles: z.string().trim().optional().default(""),
    plan: z.string().trim().optional().default(""),
    notes: z.string().trim().max(2000).optional().default(""),
})

const YearlyGoalFormSchema = z.object({
    type: z.literal('year'),
    categoryId: Id.min(1, "A yearly goal must include a category."),
    identityId: Id.min(1, "A yearly goal must include an identity."),
    // The following fields are only required in yearlyGoals
    outcome: z.string().trim().min(10, "Min 10 chars").max(4000).default(""),
    obstacles: z.string().trim().min(10, "Min 10 chars").max(4000).default(""),
    plan: z.string().trim().min(10, "Min 10 chars").max(4000).default(""),
});

const QuarterlyGoalFormSchema = z.object({
    type: z.literal('quarter'),
    parentYearGoalId: z.string().trim().min(1, "A quarterly goal must derive from a yearly goal.")
})

const WeeklyGoalFormSchema = z.object({
    type: z.literal('week'),
    parentQuarterGoalId: z.string().trim().min(1, "A weekly goal must derive from a quarterly goal."),
    planned: IntFromInput.refine((n) => n >= 1, "Planned must be ≥ 1").default(1),
})

const perTypeSchema = z.discriminatedUnion("type", [
    YearlyGoalFormSchema,
    QuarterlyGoalFormSchema,
    WeeklyGoalFormSchema
])

export const GoalFormSchema = AllGoalsFormSchema.and(perTypeSchema)

export type GoalFormType = z.infer<typeof GoalFormSchema>;
type GoalFormOutput = z.output<typeof GoalFormSchema>;

export default function GoalForm({ type }: GoalFormProps) {

    const [editCategoriesModalOpen, setEditCategoriesModalOpen] = useState(false)
    const [editIdentitiesModalOpen, setEditIdentitiesModalOpen] = useState(false)


    const defaultValues: GoalFormType =
        type === 'year'
            ? { type: 'year', wish: '', outcome: '', obstacles: '', plan: '', categoryId: '', identityId: '', notes: '' }
            : type === 'quarter'
                ? { type: 'quarter', wish: '', outcome: '', obstacles: '', plan: '', parentYearGoalId: '', notes: '' }
                : { type: 'week', wish: '', outcome: '', obstacles: '', plan: '', parentQuarterGoalId: '', planned: 1, notes: '' };

    const form = useForm<GoalFormType>({
        resolver: zodResolver(GoalFormSchema) as Resolver<GoalFormOutput>,
        defaultValues
    })

    const { user } = useAuth()
    const { data: categories, isLoading: catLoading, error: catErr } = useCategories(user?.uid || '');
    const { data: identities, isLoading: idLoading, error: idErr } = useIdentities(user?.uid || '');
    const { selectedYear, selectedQuarter, selectedWeek } = useGoals();
    const { data: yearlyGoals, isLoading: yearlyGoalsLoading, error: yearlyGoalsErr } = useYearlyGoals(user?.uid || '', selectedYear);
    const { data: quarterlyGoals, isLoading: quarterlyGoalsLoading, error: quarterlyGoalsErr } = useQuarterlyGoals(user?.uid || '', selectedYear, selectedQuarter);

    const navigate = useNavigate()

    const addYearlyGoal = useAddYearlyGoal();
    const addQuarterlyGoal = useAddQuarterlyGoal()
    const addWeeklyGoal = useAddWeeklyGoal()

    const handleSubmit = async (data: GoalFormType) => {
        if (!user) return

        if (data.type === 'year') {
            await addYearlyGoal.mutateAsync({
                uid: user.uid,
                yearId: selectedYear,
                yearlyGoalData: { ...data, type: "year", yearId: selectedYear }
            })
        }

        if (data.type === 'quarter') {
            await addQuarterlyGoal.mutateAsync({
                uid: user.uid,
                yearId: selectedYear,
                quarterId: selectedQuarter,
                quarterGoalData: { ...data, type: 'quarter', yearId: selectedYear, quarterId: selectedQuarter }
            })
        }

        if (data.type === 'week') {
            await addWeeklyGoal.mutateAsync({
                uid: user.uid,
                yearId: selectedYear,
                quarterId: selectedQuarter,
                weekId: selectedWeek,
                weeklyGoalData: { ...data, type: 'week', done: 0, yearId: selectedYear, quarterId: selectedQuarter, weekId: selectedWeek }
            })
        }

        navigate("..")
    }

    if (catLoading || idLoading || yearlyGoalsLoading || quarterlyGoalsLoading) {
        return <div className="p-3 text-yellow-600">Loading data...</div>;
    }

    if (catErr || idErr || yearlyGoalsErr || quarterlyGoalsErr) {
        return <div className="p-3 text-red-600">Failed to load data.</div>;
    }

    function findYearlyGoalCategoryColor(yearlyGoalId: ID) {
        const yearlyGoal = yearlyGoals?.find(goal => goal.id === yearlyGoalId)
        const category = categories?.find(cat => cat.id === yearlyGoal?.categoryId)
        return category?.color || 'white'
    }

    function findQuarterGoalCategoryColor(quarterlyGoalId: ID) {
        const quarterlyGoal = quarterlyGoals?.find(goal => goal.id === quarterlyGoalId)
        const yearlyGoal = yearlyGoals?.find(goal => goal.id === quarterlyGoal?.parentYearGoalId)
        const category = categories?.find(cat => cat.id === yearlyGoal?.categoryId)
        return category?.color || 'white'
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit, (err) => console.error('Validation errors:', err))} className='mt-4 grid grid-cols-1 gap-4'>

                    {/* Category */}
                    {type === 'year' && categories &&
                        (<>
                            <FormField
                                name="categoryId"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(val) => {
                                                    if (val === 'edit') {
                                                        setEditCategoriesModalOpen(true)
                                                    } else {
                                                        field.onChange(val)
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-full" style={{ backgroundColor: `${categories.find(cat => cat.id === field.value)?.color}` }}>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {categories.map(category => (
                                                            <SelectItem key={category.id} value={category.id} style={{ backgroundColor: `${category.color}` }} className='my-2'>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem key='edit' value='edit'>Edit Categories</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Modal isOpen={editCategoriesModalOpen} onClose={() => setEditCategoriesModalOpen(false)}>
                                <ItemsListForm type='category' currentItems={categories} closeModal={() => setEditCategoriesModalOpen(false)} />
                            </Modal>
                        </>)}

                    {/* Identity */}
                    {type === 'year' && identities && (<>
                        <FormField
                            name="identityId"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Identity</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={(val) => {
                                                if (val === 'edit') {
                                                    setEditIdentitiesModalOpen(true)
                                                } else {
                                                    console.log(field);
                                                    field.onChange(val)
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full" style={{ backgroundColor: `${identities.find(cat => cat.id === field.value)?.color}` }}>
                                                <SelectValue placeholder="Select an identity" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {identities.map(identity => (
                                                        <SelectItem key={identity.id} value={identity.id} style={{ backgroundColor: `${identity.color}` }} className='my-2'>
                                                            {identity.name}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem key='edit' value='edit'>Edit Identities</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Modal isOpen={editIdentitiesModalOpen} onClose={() => setEditIdentitiesModalOpen(false)}>
                            <ItemsListForm type='identity' currentItems={identities} closeModal={() => setEditIdentitiesModalOpen(false)} />
                        </Modal>
                    </>)}

                    {/* Parent quarter goal */}
                    {type === 'week' && quarterlyGoals && (<FormField
                        name="parentQuarterGoalId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent Quarter Goal</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full" style={{ backgroundColor: `${findQuarterGoalCategoryColor(field.value)}` }}>
                                            <SelectValue placeholder="Select a parent quarterly goal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {quarterlyGoals.map(quarterlyGoal => (
                                                    <SelectItem key={quarterlyGoal.id} value={quarterlyGoal.id} className='my-2' style={{ backgroundColor: `${findQuarterGoalCategoryColor(quarterlyGoal.id)}` }}>
                                                        {quarterlyGoal.wish}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />)}

                    {/* Parent year goal */}
                    {type === 'quarter' && yearlyGoals && (<FormField
                        name="parentYearGoalId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent Yearly Goal</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full" style={{ backgroundColor: `${findYearlyGoalCategoryColor(field.value)}` }}>
                                            <SelectValue placeholder="Select a parent yearly goal." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {yearlyGoals.map(yearlyGoal => (
                                                    <SelectItem key={yearlyGoal.id} value={yearlyGoal.id} className='my-2' style={{ backgroundColor: `${findYearlyGoalCategoryColor(yearlyGoal.id)}` }}>
                                                        {yearlyGoal.wish}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />)}

                    {/* Wish */}
                    <FormField
                        name="wish"
                        key="wish"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Wish</FormLabel>
                                <FormControl>
                                    <Input placeholder={`What do you want to achieve this ${type}?`} className='text-lg' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Outcome */}
                    <FormField
                        name="outcome"
                        key="outcome"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Outcome</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="What will be the result of achieving this wish?" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Obstacles */}
                    <FormField
                        name="obstacles"
                        key="obstacles"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Obstacles</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="What will be the obstacles you'll probably be facing trying to achieve that goal?" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Plan */}
                    <FormField
                        name="plan"
                        key="plan"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plan</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="What will you do to overcome those obstacles?" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Planned */}
                    {type === 'week' &&
                        <FormField
                            name="planned"
                            key="planned"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Planned</FormLabel>
                                    <FormControl>
                                        <Input type='number' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }

                    <Button type='submit'>Submit</Button>
                    <Button type="button" variant="outline" onClick={() => navigate("..")}>
                        Cancel
                    </Button>
                </form>
            </Form>
        </>

    )
}
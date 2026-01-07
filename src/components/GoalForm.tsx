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

const PlanItemSchema = z.object({
    obstacle: z.string().trim(),
    action: z.string().trim(),
});

const AllGoalsFormSchema = z.object({
    type: z.union([z.literal('year'), z.literal('quarter'), z.literal('week')]),
    wish: z.string().min(10, "The first step to achieving a goal is to write a wish!").max(120, "Max 120 chars"),
    outcome: z.array(z.string().trim()).optional().default([]),
    obstacles: z.array(z.string().trim()).optional().default([]),
    plan: z.array(PlanItemSchema).optional().default([]),
    notes: z.string().trim().max(2000).optional().default(""),
})

const YearlyGoalFormSchema = z.object({
    type: z.literal('year'),
    categoryId: Id.min(1, "A yearly goal must include a category."),
    identityId: Id.min(1, "A yearly goal must include an identity."),
    // The following fields are only required in yearlyGoals
    outcome: z.array(z.string().trim()).min(1, "Add at least one outcome"),
    obstacles: z.array(z.string().trim()).min(1, "Add at least one obstacle"),
    plan: z.array(PlanItemSchema).min(1, "Add a plan for at least one obstacle"),
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
            ? { type: 'year', wish: '', outcome: [], obstacles: [], plan: [], categoryId: '', identityId: '', notes: '' }
            : type === 'quarter'
                ? { type: 'quarter', wish: '', outcome: [], obstacles: [], plan: [], parentYearGoalId: '', notes: '' }
                : { type: 'week', wish: '', outcome: [], obstacles: [], plan: [], parentQuarterGoalId: '', planned: 1, notes: '' };

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
                quarterGoalData: { ...data, type: 'quarter', yearId: selectedYear, quarterId: selectedQuarter, weeklyProgress: [] }
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
                            <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">Goal Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={`What do you want to achieve this ${type}?`}
                                        className='text-xl font-bold h-14 px-4 border-2 border-primary/20 focus:border-primary transition-colors'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* WOOP Section */}
                    <div className={`space-y-4 ${type === 'year' ? '' : 'opacity-80'}`}>
                        {type === 'year' && (
                            <div className="flex items-center gap-2 pt-2">
                                <div className="h-px flex-1 bg-border"></div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mental Contrasting</span>
                                <div className="h-px flex-1 bg-border"></div>
                            </div>
                        )}

                        {/* Outcome */}
                        <FormField
                            name="outcome"
                            key="outcome"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={type === 'year' ? 'font-semibold' : ''}>
                                        Outcomes {type !== 'year' && <span className="text-muted-foreground font-normal">(optional)</span>}
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground mb-2">Visualize success: What will achieving this feel like? What changes?</p>
                                    <div className="space-y-2">
                                        {(field.value as string[])?.map((item, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    value={item}
                                                    onChange={(e) => {
                                                        const newItems = [...(field.value as string[])];
                                                        newItems[index] = e.target.value;
                                                        field.onChange(newItems);
                                                    }}
                                                    placeholder={`Outcome ${index + 1}`}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newItems = (field.value as string[]).filter((_, i) => i !== index);
                                                        field.onChange(newItems);
                                                    }}
                                                >
                                                    X
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => field.onChange([...(field.value as string[] || []), ''])}
                                        >
                                            + Add Outcome
                                        </Button>
                                    </div>
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
                                    <FormLabel className={type === 'year' ? 'font-semibold' : ''}>
                                        Obstacles {type !== 'year' && <span className="text-muted-foreground font-normal">(optional)</span>}
                                    </FormLabel>
                                    <p className="text-xs text-muted-foreground mb-2">Be honest: What internal obstacles might hold you back?</p>
                                    <div className="space-y-2">
                                        {(field.value as string[])?.map((item, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    value={item}
                                                    onChange={(e) => {
                                                        const newItems = [...(field.value as string[])];
                                                        newItems[index] = e.target.value;
                                                        field.onChange(newItems);
                                                    }}
                                                    placeholder={`Obstacle ${index + 1}`}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newItems = (field.value as string[]).filter((_, i) => i !== index);
                                                        field.onChange(newItems);
                                                    }}
                                                >
                                                    X
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => field.onChange([...(field.value as string[] || []), ''])}
                                        >
                                            + Add Obstacle
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Plan - linked to obstacles */}
                        {type === 'year' && (
                            <FormField
                                name="plan"
                                key="plan"
                                control={form.control}
                                render={({ field }) => {
                                    const obstacles = form.watch('obstacles') as string[];
                                    const planItems = field.value as { obstacle: string; action: string }[];

                                    // Sync plan items with obstacles
                                    const syncedPlan = obstacles
                                        .filter(o => o.trim() !== '')
                                        .map(obstacle => {
                                            const existing = planItems.find(p => p.obstacle === obstacle);
                                            return existing || { obstacle, action: '' };
                                        });

                                    // Update if changed
                                    if (JSON.stringify(syncedPlan) !== JSON.stringify(planItems) && obstacles.some(o => o.trim() !== '')) {
                                        field.onChange(syncedPlan);
                                    }

                                    return (
                                        <FormItem>
                                            <FormLabel className="font-semibold">Implementation Intentions</FormLabel>
                                            <p className="text-xs text-muted-foreground mb-3">
                                                For each obstacle, define your response using "If... then..." planning.
                                            </p>

                                            {syncedPlan.length === 0 ? (
                                                <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                                                    Add obstacles above to create your implementation plan
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {syncedPlan.map((item, index) => (
                                                        <div key={index} className="p-4 rounded-lg border bg-muted/30 space-y-2">
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-sm font-medium text-orange-600 shrink-0 pt-0.5">If</span>
                                                                <p className="text-sm italic text-muted-foreground flex-1">
                                                                    "{item.obstacle}"
                                                                </p>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-sm font-medium text-green-600 shrink-0 pt-2">Then I will</span>
                                                                <Input
                                                                    value={item.action}
                                                                    onChange={(e) => {
                                                                        const newPlan = [...syncedPlan];
                                                                        newPlan[index] = { ...item, action: e.target.value };
                                                                        field.onChange(newPlan);
                                                                    }}
                                                                    placeholder="What specific action will you take?"
                                                                    className="flex-1"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        )}
                    </div>

                    {/* Planned Effort */}
                    {type === 'week' &&
                        <FormField
                            name="planned"
                            key="planned"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="space-y-4 p-5 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl border-2 border-primary/25 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">⏱️</span>
                                        <FormLabel className="text-xl font-bold text-primary m-0">Planned Effort</FormLabel>
                                    </div>
                                    <div className="bg-background/60 rounded-lg p-3 border border-primary/10">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            <span className="font-medium text-foreground">Effort matters more than outcomes.</span>{' '}
                                            How many time slots (hours/sessions) will you dedicate to this goal?
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center gap-3">
                                        <FormControl>
                                            <Input
                                                type='number'
                                                min={1}
                                                className="text-4xl font-extrabold h-20 w-32 text-center border-2 border-primary/30 focus:border-primary bg-background rounded-xl shadow-inner"
                                                {...field}
                                            />
                                        </FormControl>
                                        <span className="text-lg text-muted-foreground font-medium">sessions</span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }

                    <div className="flex gap-3 pt-4">
                        <Button type='submit' className="flex-1 h-12 text-lg font-semibold">
                            Create Goal
                        </Button>
                        <Button type="button" variant="outline" className="h-12 px-6" onClick={() => navigate("..")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </>

    )
}
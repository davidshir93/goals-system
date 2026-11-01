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
import { useAddQuarterlyGoal, useAddWeeklyGoal, useAddYearlyGoal, useEditYearlyGoal, useEditQuarterlyGoal, UseEditWeeklyGoal, useCategories, useQuarterlyGoals, useYearlyGoals } from '@/data/queries'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '@/context/GoalsContext'
import type { Category, ID, Goal } from '@/types/GoalTypes'
import { Modal } from './Modal'
import ItemsListForm from './ItemsListForm'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { categoryColorVar } from '@/tokens/categories'

type GoalFormProps = {
    type: 'year' | 'quarter' | 'week'
    goalId?: ID
    existingGoal?: Goal
}

export default function GoalForm({ type, goalId, existingGoal }: GoalFormProps) {
    const { t } = useTranslation()

    const PlanItemSchema = z.object({
        obstacle: z.string().trim(),
        action: z.string().trim(),
    });

    const AllGoalsFormSchema = z.object({
        type: z.union([z.literal('year'), z.literal('quarter'), z.literal('week')]),
        wish: z.string().min(10, t('validation.wishRequired')).max(120, t('validation.maxChars', { count: 120 })),
        outcome: z.array(z.string().trim()).optional().default([]),
        obstacles: z.array(z.string().trim()).optional().default([]),
        plan: z.array(PlanItemSchema).optional().default([]),
        notes: z.string().trim().max(2000).optional().default(""),
    })

    const YearlyGoalFormSchema = z.object({
        type: z.literal('year'),
        categoryId: Id.min(1, t('validation.categoryRequired')),
        description: z.string().trim().max(500).optional().default(""),
        outcome: z.array(z.string().trim()).min(1, t('validation.outcomeRequired')),
        obstacles: z.array(z.string().trim()).min(1, t('validation.obstacleRequired')),
        plan: z.array(PlanItemSchema).min(1, t('validation.planRequired')),
    });

    const QuarterlyGoalFormSchema = z.object({
        type: z.literal('quarter'),
        parentYearGoalId: z.string().trim().min(1, t('validation.parentYearRequired'))
    })

    const WeeklyGoalFormSchema = z.object({
        type: z.literal('week'),
        parentQuarterGoalId: z.string().trim().min(1, t('validation.parentQuarterRequired')),
        planned: IntFromInput.refine((n) => n >= 1, t('validation.plannedMin')).default(1),
    })

    const perTypeSchema = z.discriminatedUnion("type", [
        YearlyGoalFormSchema,
        QuarterlyGoalFormSchema,
        WeeklyGoalFormSchema
    ])

    const GoalFormSchema = AllGoalsFormSchema.and(perTypeSchema)

    type GoalFormType = z.infer<typeof GoalFormSchema>;
    type GoalFormOutput = z.output<typeof GoalFormSchema>;

    const [editCategoriesModalOpen, setEditCategoriesModalOpen] = useState(false)

    const isEditMode = Boolean(goalId && existingGoal)

    const getDefaultValues = (): GoalFormType => {
        if (existingGoal) {
            if (existingGoal.type === 'year') {
                return {
                    type: 'year',
                    wish: existingGoal.wish,
                    outcome: existingGoal.outcome || [],
                    obstacles: existingGoal.obstacles || [],
                    plan: existingGoal.plan || [],
                    categoryId: existingGoal.categoryId,
                    description: existingGoal.description || '',
                    notes: existingGoal.notes || ''
                }
            }
            if (existingGoal.type === 'quarter') {
                return {
                    type: 'quarter',
                    wish: existingGoal.wish,
                    outcome: existingGoal.outcome || [],
                    obstacles: existingGoal.obstacles || [],
                    plan: existingGoal.plan || [],
                    parentYearGoalId: existingGoal.parentYearGoalId,
                    notes: existingGoal.notes || ''
                }
            }
            if (existingGoal.type === 'week') {
                return {
                    type: 'week',
                    wish: existingGoal.wish,
                    outcome: existingGoal.outcome || [],
                    obstacles: existingGoal.obstacles || [],
                    plan: existingGoal.plan || [],
                    parentQuarterGoalId: existingGoal.parentQuarterGoalId,
                    planned: existingGoal.planned,
                    notes: existingGoal.notes || ''
                }
            }
        }

        // Default values for new goals
        if (type === 'year') {
            return { type: 'year', wish: '', outcome: [], obstacles: [], plan: [], categoryId: '', description: '', notes: '' }
        }
        if (type === 'quarter') {
            return { type: 'quarter', wish: '', outcome: [], obstacles: [], plan: [], parentYearGoalId: '', notes: '' }
        }
        return { type: 'week', wish: '', outcome: [], obstacles: [], plan: [], parentQuarterGoalId: '', planned: 1, notes: '' }
    }

    const form = useForm<GoalFormType>({
        resolver: zodResolver(GoalFormSchema) as Resolver<GoalFormOutput>,
        defaultValues: getDefaultValues()
    })

    const { user } = useAuth()
    const { data: categories, isLoading: catLoading, error: catErr } = useCategories(user?.uid || '');
    const { selectedYear, selectedQuarter, selectedWeek } = useGoals();
    const { data: yearlyGoals, isLoading: yearlyGoalsLoading, error: yearlyGoalsErr } = useYearlyGoals(user?.uid || '', selectedYear);
    const { data: quarterlyGoals, isLoading: quarterlyGoalsLoading, error: quarterlyGoalsErr } = useQuarterlyGoals(user?.uid || '', selectedYear, selectedQuarter);

    const navigate = useNavigate()

    // The parent goal's title, offered as a one-tap starting point for this goal's title.
    const parentGoalId = form.watch(type === 'week' ? 'parentQuarterGoalId' : 'parentYearGoalId')
    const parentWish =
        type === 'week' ? quarterlyGoals?.find(g => g.id === parentGoalId)?.wish
        : type === 'quarter' ? yearlyGoals?.find(g => g.id === parentGoalId)?.wish
        : undefined

    const addYearlyGoal = useAddYearlyGoal();
    const addQuarterlyGoal = useAddQuarterlyGoal()
    const addWeeklyGoal = useAddWeeklyGoal()
    const editYearlyGoal = useEditYearlyGoal()
    const editQuarterlyGoal = useEditQuarterlyGoal()
    const editWeeklyGoal = UseEditWeeklyGoal()

    const handleSubmit = async (data: GoalFormType) => {
        if (!user) return

        if (isEditMode && goalId) {
            // Edit existing goal
            if (data.type === 'year') {
                await editYearlyGoal.mutateAsync({
                    uid: user.uid,
                    yearId: selectedYear,
                    goalId,
                    updatedFields: {
                        wish: data.wish,
                        outcome: data.outcome,
                        obstacles: data.obstacles,
                        plan: data.plan,
                        categoryId: data.categoryId,
                        description: data.description,
                        notes: data.notes
                    }
                })
            }

            if (data.type === 'quarter') {
                await editQuarterlyGoal.mutateAsync({
                    uid: user.uid,
                    yearId: selectedYear,
                    quarterId: selectedQuarter,
                    goalId,
                    updatedFields: {
                        wish: data.wish,
                        outcome: data.outcome,
                        obstacles: data.obstacles,
                        plan: data.plan,
                        parentYearGoalId: data.parentYearGoalId,
                        notes: data.notes
                    }
                })
            }

            if (data.type === 'week') {
                await editWeeklyGoal.mutateAsync({
                    uid: user.uid,
                    yearId: selectedYear,
                    quarterId: selectedQuarter,
                    weekId: selectedWeek,
                    goalId,
                    updatedFields: {
                        wish: data.wish,
                        outcome: data.outcome,
                        obstacles: data.obstacles,
                        plan: data.plan,
                        parentQuarterGoalId: data.parentQuarterGoalId,
                        planned: data.planned,
                        notes: data.notes
                    }
                })
            }
        } else {
            // Create new goal
            if (data.type === 'year') {
                await addYearlyGoal.mutateAsync({
                    uid: user.uid,
                    yearId: selectedYear,
                    yearlyGoalData: { ...data, type: "year", yearId: selectedYear, description: data.description }
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
        }

        navigate("..")
    }

    if (catLoading || yearlyGoalsLoading || quarterlyGoalsLoading) {
        return <div className="p-3 text-yellow-600">{t('common.loadingData')}</div>;
    }

    if (catErr || yearlyGoalsErr || quarterlyGoalsErr) {
        return <div className="p-3 text-red-600">{t('common.failedToLoad')}</div>;
    }

    function findYearlyGoalCategory(yearlyGoalId: ID) {
        const yearlyGoal = yearlyGoals?.find(goal => goal.id === yearlyGoalId)
        return categories?.find(cat => cat.id === yearlyGoal?.categoryId)
    }

    function findQuarterGoalCategory(quarterlyGoalId: ID) {
        const quarterlyGoal = quarterlyGoals?.find(goal => goal.id === quarterlyGoalId)
        return findYearlyGoalCategory(quarterlyGoal?.parentYearGoalId ?? '')
    }

    // Categories show as on the goal cards: a tinted pill with the name.
    const categoryPill = (category: Category) => (
        <span
            className="type-caption-strong inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[var(--text-primary)]"
            style={{ background: categoryColorVar(category.color, 'bg') }}
        >
            {category.name}
        </span>
    )

    // A parent goal option: its category first, then the goal.
    const parentGoalOption = (wish: string, category: Category | undefined) => (
        <span className="flex min-w-0 items-baseline gap-2">
            {category && categoryPill(category)}
            <span data-goal-wish className="type-body-title min-w-0">{wish}</span>
        </span>
    )

    const getFormTitle = () => {
        if (isEditMode) return t('goalForm.editGoal')
        switch (type) {
            case 'year': return t('goalForm.newYearGoal')
            case 'quarter': return t('goalForm.newQuarterGoal')
            case 'week': return t('goalForm.newWeekGoal')
        }
    }

    const getPeriodName = () => {
        switch (type) {
            case 'year': return t('periods.year').toLowerCase()
            case 'quarter': return t('periods.quarter').toLowerCase()
            case 'week': return t('periods.week').toLowerCase()
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="type-display tracking-tight">
                    {getFormTitle()}
                </h1>
                <p className="type-body-text text-muted-foreground mt-1">
                    {isEditMode ? t('goalForm.editSubtitle') : t('goalForm.newSubtitle')}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit, (err) => console.error('Validation errors:', err))} className='grid grid-cols-[minmax(0,1fr)] gap-6'>

                    {/* Category */}
                    {type === 'year' && categories &&
                        (<>
                            <FormField
                                name="categoryId"
                                control={form.control}
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>{t('goalForm.category')}</FormLabel>
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
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder={t('goalForm.selectCategory')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {categories.map(category => (
                                                                <SelectItem key={category.id} value={category.id}>
                                                                    {categoryPill(category)}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem key='edit' value='edit'>{t('goalForm.editCategories')}</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <Modal isOpen={editCategoriesModalOpen} onClose={() => setEditCategoriesModalOpen(false)}>
                                <ItemsListForm currentItems={categories} closeModal={() => setEditCategoriesModalOpen(false)} />
                            </Modal>
                        </>)}

                    {/* Parent quarter goal */}
                    {type === 'week' && quarterlyGoals && (<FormField
                        name="parentQuarterGoalId"
                        control={form.control}
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>{t('goalForm.parentQuarterGoal')}</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full *:data-[slot=select-value]:min-w-0 [&_[data-goal-wish]]:truncate">
                                                <SelectValue placeholder={t('goalForm.selectParentQuarter')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {quarterlyGoals.map(quarterlyGoal => (
                                                        <SelectItem key={quarterlyGoal.id} value={quarterlyGoal.id}>
                                                            {parentGoalOption(quarterlyGoal.wish, findQuarterGoalCategory(quarterlyGoal.id))}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />)}

                    {/* Parent year goal */}
                    {type === 'quarter' && yearlyGoals && (<FormField
                        name="parentYearGoalId"
                        control={form.control}
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>{t('goalForm.parentYearGoal')}</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-full *:data-[slot=select-value]:min-w-0 [&_[data-goal-wish]]:truncate">
                                                <SelectValue placeholder={t('goalForm.selectParentYear')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {yearlyGoals.map(yearlyGoal => (
                                                        <SelectItem key={yearlyGoal.id} value={yearlyGoal.id}>
                                                            {parentGoalOption(yearlyGoal.wish, findYearlyGoalCategory(yearlyGoal.id))}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />)}

                    {/* Wish */}
                    <FormField
                        name="wish"
                        key="wish"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between gap-2">
                                    <FormLabel>{t('goalForm.goalTitle')}</FormLabel>
                                    {parentWish && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                form.setValue('wish', parentWish, { shouldDirty: true, shouldValidate: true })
                                                form.setFocus('wish')
                                            }}
                                            className="type-caption-strong -my-3 inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 px-1 text-[var(--category-azure-fill)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
                                        >
                                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="9" y="9" width="12" height="12" rx="2" />
                                                <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
                                            </svg>
                                            {t('goalForm.copyParentGoal')}
                                        </button>
                                    )}
                                </div>
                                <FormControl>
                                    <Input
                                        placeholder={t('goalForm.goalPlaceholder', { period: getPeriodName() })}
                                        className='type-main-title h-14 px-4 border-2 border-primary/20 focus:border-primary transition-colors'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Description - Only for yearly goals */}
                    {type === 'year' && (
                        <FormField
                            name="description"
                            key="description"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('goalForm.description')}</FormLabel>
                                    <p className="type-caption text-muted-foreground mb-2">{t('goalForm.descriptionHelp')}</p>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('goalForm.descriptionPlaceholder')}
                                            className="min-h-[80px] resize-y"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* WOOP Section - Only for yearly goals */}
                    {type === 'year' && (
                        <div className="space-y-6 p-5 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <h2 className="type-main-title text-primary">{t('goalForm.mentalContrasting')}</h2>
                            </div>

                            {/* Outcome */}
                            <FormField
                                name="outcome"
                                key="outcome"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="type-body-title">{t('goalForm.outcomes')}</FormLabel>
                                        <p className="type-caption text-muted-foreground mb-2">{t('goalForm.outcomesHelp')}</p>
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
                                                        placeholder={t('goalForm.outcomePlaceholder', { number: index + 1 })}
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
                                                {t('goalForm.addOutcome')}
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
                                        <FormLabel className="type-body-title">{t('goalForm.obstacles')}</FormLabel>
                                        <p className="type-caption text-muted-foreground mb-2">{t('goalForm.obstaclesHelp')}</p>
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
                                                        placeholder={t('goalForm.obstaclePlaceholder', { number: index + 1 })}
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
                                                {t('goalForm.addObstacle')}
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Plan - linked to obstacles */}
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
                                            <FormLabel className="type-body-title">{t('goalForm.implementationIntentions')}</FormLabel>
                                            <p className="type-caption text-muted-foreground mb-3">
                                                {t('goalForm.implementationHelp')}
                                            </p>

                                            {syncedPlan.length === 0 ? (
                                                <div className="type-body-text p-4 rounded-lg border border-dashed text-center text-muted-foreground">
                                                    {t('goalForm.addObstaclesFirst')}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {syncedPlan.map((item, index) => (
                                                        <div key={index} className="p-4 rounded-lg border bg-muted/30 space-y-2">
                                                            <div className="flex items-start gap-2">
                                                                <span className="type-body-title text-orange-600 shrink-0 pt-0.5">{t('goalForm.if')}</span>
                                                                <p className="type-body-text italic text-muted-foreground flex-1">
                                                                    "{item.obstacle}"
                                                                </p>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <span className="type-body-title text-green-600 shrink-0 pt-2">{t('goalForm.thenIWill')}</span>
                                                                <Input
                                                                    value={item.action}
                                                                    onChange={(e) => {
                                                                        const newPlan = [...syncedPlan];
                                                                        newPlan[index] = { ...item, action: e.target.value };
                                                                        field.onChange(newPlan);
                                                                    }}
                                                                    placeholder={t('goalForm.actionPlaceholder')}
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
                        </div>
                    )}

                    {/* Notes - for year and quarter goals */}
                    {type !== 'week' && (
                        <FormField
                            name="notes"
                            key="notes"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('goalForm.notes')}</FormLabel>
                                    <p className="type-caption text-muted-foreground mb-2">{t('goalForm.notesHelp')}</p>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('common.notesPlaceholder')}
                                            className="min-h-[100px] resize-y"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Planned Effort */}
                    {type === 'week' &&
                        <FormField
                            name="planned"
                            key="planned"
                            control={form.control}
                            render={({ field }) => {
                                const handleIncrement = () => {
                                    const currentValue = parseInt(String(field.value)) || 1;
                                    field.onChange(currentValue + 1);
                                };
                                const handleDecrement = () => {
                                    const currentValue = parseInt(String(field.value)) || 1;
                                    if (currentValue > 1) {
                                        field.onChange(currentValue - 1);
                                    }
                                };
                                return (
                                    <FormItem>
                                        <FormLabel><span aria-hidden="true">⏱️</span>{t('goalForm.plannedEffort')}</FormLabel>
                                        <div className="space-y-4 p-4 sm:p-5 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl border-2 border-primary/25 shadow-sm">
                                            <div className="bg-background/60 rounded-lg p-3 border border-primary/10">
                                                <p className="type-body-text text-muted-foreground">
                                                    <span className="type-body-title text-foreground">{t('goalForm.effortHelp')}</span>{' '}
                                                    {t('goalForm.effortQuestion')}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex items-center gap-2" dir="ltr">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="type-display size-12 shrink-0 sm:size-14 rounded-xl border-2 border-primary/30 hover:bg-primary/10 hover:border-primary cursor-pointer"
                                                        onClick={handleDecrement}
                                                        disabled={parseInt(String(field.value)) <= 1}
                                                        aria-label={t('goalForm.fewerSessions')}
                                                    >
                                                        −
                                                    </Button>
                                                    <FormControl>
                                                        <Input
                                                            type='number'
                                                            min={1}
                                                            aria-label={t('goalForm.plannedEffort')}
                                                            className="type-page-title h-20 w-28 sm:h-24 sm:w-36 text-center pt-1 border-2 border-primary/30 focus:border-primary bg-card rounded-xl shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="type-display size-12 shrink-0 sm:size-14 rounded-xl border-2 border-primary/30 hover:bg-primary/10 hover:border-primary cursor-pointer"
                                                        onClick={handleIncrement}
                                                        aria-label={t('goalForm.moreSessions')}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                                <span className="type-main-title text-muted-foreground">{t('goalForm.sessions')}</span>
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    }

                    {/* Notes - for weekly goals (at the bottom) */}
                    {type === 'week' && (
                        <FormField
                            name="notes"
                            key="notes-week"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('goalForm.notes')}</FormLabel>
                                    <p className="type-caption text-muted-foreground mb-2">{t('goalForm.notesHelp')}</p>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('common.notesPlaceholder')}
                                            className="min-h-[100px] resize-y"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" className="h-11 px-6" onClick={() => navigate("..")}>
                            {t('common.cancel')}
                        </Button>
                        <Button type='submit' className="flex-1 h-11">
                            {isEditMode ? t('goalForm.saveChanges') : t('goalForm.createGoal')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>

    )
}

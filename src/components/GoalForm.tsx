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
import { useAddQuarterlyGoal, useAddWeeklyGoal, useAddYearlyGoal, useEditYearlyGoal, useEditQuarterlyGoal, UseEditWeeklyGoal, useCategories, useIdentities, useQuarterlyGoals, useYearlyGoals } from '@/data/queries'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '@/context/GoalsContext'
import type { ID, Goal } from '@/types/GoalTypes'
import { Modal } from './Modal'
import ItemsListForm from './ItemsListForm'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
        identityId: Id.min(1, t('validation.identityRequired')),
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
    const [editIdentitiesModalOpen, setEditIdentitiesModalOpen] = useState(false)

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
                    identityId: existingGoal.identityId,
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
            return { type: 'year', wish: '', outcome: [], obstacles: [], plan: [], categoryId: '', identityId: '', notes: '' }
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
    const { data: identities, isLoading: idLoading, error: idErr } = useIdentities(user?.uid || '');
    const { selectedYear, selectedQuarter, selectedWeek } = useGoals();
    const { data: yearlyGoals, isLoading: yearlyGoalsLoading, error: yearlyGoalsErr } = useYearlyGoals(user?.uid || '', selectedYear);
    const { data: quarterlyGoals, isLoading: quarterlyGoalsLoading, error: quarterlyGoalsErr } = useQuarterlyGoals(user?.uid || '', selectedYear, selectedQuarter);

    const navigate = useNavigate()

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
                        identityId: data.identityId,
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
        }

        navigate("..")
    }

    if (catLoading || idLoading || yearlyGoalsLoading || quarterlyGoalsLoading) {
        return <div className="p-3 text-yellow-600">{t('common.loadingData')}</div>;
    }

    if (catErr || idErr || yearlyGoalsErr || quarterlyGoalsErr) {
        return <div className="p-3 text-red-600">{t('common.failedToLoad')}</div>;
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
                <h1 className="text-2xl font-bold tracking-tight">
                    {getFormTitle()}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {isEditMode ? t('goalForm.editSubtitle') : t('goalForm.newSubtitle')}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit, (err) => console.error('Validation errors:', err))} className='grid grid-cols-1 gap-6'>

                    {/* Category */}
                    {type === 'year' && categories &&
                        (<>
                            <FormField
                                name="categoryId"
                                control={form.control}
                                render={({ field }) => (
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
                                                <SelectTrigger className="w-full" style={{ backgroundColor: `${categories.find(cat => cat.id === field.value)?.color}` }}>
                                                    <SelectValue placeholder={t('goalForm.selectCategory')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {categories.map(category => (
                                                            <SelectItem key={category.id} value={category.id} style={{ backgroundColor: `${category.color}` }} className='my-2'>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem key='edit' value='edit'>{t('goalForm.editCategories')}</SelectItem>
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
                                    <FormLabel>{t('goalForm.identity')}</FormLabel>
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
                                                <SelectValue placeholder={t('goalForm.selectIdentity')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {identities.map(identity => (
                                                        <SelectItem key={identity.id} value={identity.id} style={{ backgroundColor: `${identity.color}` }} className='my-2'>
                                                            {identity.name}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem key='edit' value='edit'>{t('goalForm.editIdentities')}</SelectItem>
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
                                <FormLabel>{t('goalForm.parentQuarterGoal')}</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full" style={{ backgroundColor: `${findQuarterGoalCategoryColor(field.value)}` }}>
                                            <SelectValue placeholder={t('goalForm.selectParentQuarter')} />
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
                                <FormLabel>{t('goalForm.parentYearGoal')}</FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full" style={{ backgroundColor: `${findYearlyGoalCategoryColor(field.value)}` }}>
                                            <SelectValue placeholder={t('goalForm.selectParentYear')} />
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
                                <FormLabel className="text-lg font-semibold">{t('goalForm.goalTitle')}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('goalForm.goalPlaceholder', { period: getPeriodName() })}
                                        className='text-xl font-bold h-14 px-4 border-2 border-primary/20 focus:border-primary transition-colors'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* WOOP Section - Only for yearly goals */}
                    {type === 'year' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pt-2">
                                <div className="h-px flex-1 bg-border"></div>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('goalForm.mentalContrasting')}</span>
                                <div className="h-px flex-1 bg-border"></div>
                            </div>

                            {/* Outcome */}
                            <FormField
                                name="outcome"
                                key="outcome"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">{t('goalForm.outcomes')}</FormLabel>
                                        <p className="text-xs text-muted-foreground mb-2">{t('goalForm.outcomesHelp')}</p>
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
                                        <FormLabel className="font-semibold">{t('goalForm.obstacles')}</FormLabel>
                                        <p className="text-xs text-muted-foreground mb-2">{t('goalForm.obstaclesHelp')}</p>
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
                                            <FormLabel className="font-semibold">{t('goalForm.implementationIntentions')}</FormLabel>
                                            <p className="text-xs text-muted-foreground mb-3">
                                                {t('goalForm.implementationHelp')}
                                            </p>

                                            {syncedPlan.length === 0 ? (
                                                <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                                                    {t('goalForm.addObstaclesFirst')}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {syncedPlan.map((item, index) => (
                                                        <div key={index} className="p-4 rounded-lg border bg-muted/30 space-y-2">
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-sm font-medium text-orange-600 shrink-0 pt-0.5">{t('goalForm.if')}</span>
                                                                <p className="text-sm italic text-muted-foreground flex-1">
                                                                    "{item.obstacle}"
                                                                </p>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-sm font-medium text-green-600 shrink-0 pt-2">{t('goalForm.thenIWill')}</span>
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

                    {/* Notes */}
                    <FormField
                        name="notes"
                        key="notes"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('goalForm.notes')}</FormLabel>
                                <p className="text-xs text-muted-foreground mb-2">{t('goalForm.notesHelp')}</p>
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
                                        <FormLabel className="text-xl font-bold text-primary m-0">{t('goalForm.plannedEffort')}</FormLabel>
                                    </div>
                                    <div className="bg-background/60 rounded-lg p-3 border border-primary/10">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            <span className="font-medium text-foreground">{t('goalForm.effortHelp')}</span>{' '}
                                            {t('goalForm.effortQuestion')}
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
                                        <span className="text-lg text-muted-foreground font-medium">{t('goalForm.sessions')}</span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    }

                    <div className="flex gap-3 pt-6 border-t">
                        <Button type='submit' className="flex-1 h-11 font-semibold">
                            {isEditMode ? t('goalForm.saveChanges') : t('goalForm.createGoal')}
                        </Button>
                        <Button type="button" variant="outline" className="h-11 px-6" onClick={() => navigate("..")}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>

    )
}

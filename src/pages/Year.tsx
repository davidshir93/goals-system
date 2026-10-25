import { EmptyPanel } from "@/components/EmptyPanel";
import { PageEnter } from "@/components/PageEnter";
import { NextStepHint } from "@/components/NextStepHint";
import { NewPeriodButton } from "@/components/NewPeriodButton";
import { useOnboarding } from "@/hooks/useOnboarding";
import { PeriodNotesButton } from "@/components/PeriodNotesButton";
import { PlusIcon } from "@/components/icons";
import { PeriodHeader } from "@/components/PeriodHeader";
import GoalCard from "@/components/GoalCard";
import { SortableGoalGrid } from "@/components/SortableGoalGrid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext"
import { useCategories, useYearlyGoals, useYears, useQuarters, useDeleteYearlyGoal, useUpdateYearNotes, useReorderYearlyGoals } from "@/data/queries";
import type { ID, QuarterGoal } from "@/types/GoalTypes";
import { enrichGoal } from "@/utils/goalsUtils";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { QuarterlyGoals } from "@/data/repos";

export default function Year() {
    const { t } = useTranslation()
    const { user } = useAuth()

    const { selectedYear } = useGoals();


    const navigate = useNavigate();
    const onboarding = useOnboarding();

    const newClick = () => {
        navigate("new")
    }
    const { data: categories, isLoading: catLoading, error: catErr } = useCategories(user?.uid || "");
    const { data: yearlyGoals, isLoading: yearlyGoalsLoading, error: yearlyGoalsErr } = useYearlyGoals(user?.uid || "", selectedYear);
    const { data: years } = useYears(user?.uid || "");
    const { data: quarters } = useQuarters(user?.uid || "", selectedYear);

    const deleteYearlyGoal = useDeleteYearlyGoal();

    // Fetch all quarterly goals across all quarters to check for children
    const quarterlyGoalsQueries = useQueries({
        queries: (quarters || []).map((quarter) => ({
            queryKey: ['quarterlyGoals', user?.uid, selectedYear, quarter.id],
            queryFn: () => QuarterlyGoals.listAll(user!.uid, selectedYear, quarter.id),
            enabled: !!user?.uid && !!selectedYear && !!quarter.id,
        })),
    });

    // Flatten all quarterly goals to check for parent links
    const allQuarterlyGoals: QuarterGoal[] = quarterlyGoalsQueries
        .filter(q => q.data)
        .flatMap(q => q.data as QuarterGoal[]);

    // Check if a yearly goal has quarterly children
    const hasQuarterlyChildren = (yearGoalId: ID): boolean => {
        return allQuarterlyGoals.some(qg => qg.parentYearGoalId === yearGoalId);
    };

    const handleDeleteYearlyGoal = (goalId: ID) => {
        deleteYearlyGoal.mutate({
            uid: user!.uid,
            yearId: selectedYear,
            goalId,
        });
    };

    const reorderYearlyGoals = useReorderYearlyGoals();

    const handleReorder = (orderedIds: ID[]) => {
        reorderYearlyGoals.mutate({
            uid: user!.uid,
            yearId: selectedYear,
            orderedGoalIds: orderedIds,
        });
    };

    // Sort goals by sortOrder
    const sortedYearlyGoals = useMemo(() => {
        if (!yearlyGoals) return [];
        return [...yearlyGoals].sort((a, b) => {
            const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
            const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
            return orderA - orderB;
        });
    }, [yearlyGoals]);

    const updateYearNotes = useUpdateYearNotes();

    const handleSaveYearNotes = (notes: string) => {
        updateYearNotes.mutate({
            uid: user!.uid,
            yearId: selectedYear,
            notes,
        });
    };

    const currentYear = years?.find(y => y.id === selectedYear);

    const yearName = currentYear?.name ?? "";
    const hasGoals = sortedYearlyGoals.length > 0;
    // Add goal lives in the header (and the phone FAB) only once there's a list to add to;
    // before that the empty panel holds the one action.
    const showAddGoal = onboarding.canAddGoal("year") && hasGoals;
    const emptyState = !onboarding.hasYear ? (
        <EmptyPanel
            title={t('onboarding.createYearTitle')}
            description={t('onboarding.createYearDesc')}
            actions={<NewPeriodButton type="year" label={t('onboarding.createYear')} />}
        />
    ) : (
        <EmptyPanel
            title={t('onboarding.firstYearGoalTitle', { year: yearName })}
            description={t('onboarding.firstYearGoalDesc')}
            actions={<Button onClick={newClick}><PlusIcon />{t('onboarding.addYearGoal')}</Button>}
        />
    );

    const isLoading = yearlyGoalsLoading || catLoading;
    const hasError = yearlyGoalsErr || catErr;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ltr:ml-3 rtl:mr-3 text-muted-foreground">{t('common.loadingGoals')}</span>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="type-body-title text-destructive">{t('goals.failedYearly')}</p>
                <p className="type-body-text text-destructive/80 mt-1">{t('common.tryRefreshing')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-sm:pb-[calc(5rem+env(safe-area-inset-bottom))]">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PeriodHeader level="year" />
                {showAddGoal && <div className="hidden items-center gap-3 sm:flex">
                    <Button onClick={newClick}>
                        <PlusIcon />
                        {t('goals.addGoal')}
                    </Button>
                </div>}
            </div>

            {/* Toolbar: page tools */}
            {onboarding.hasYear && <div className="flex items-center justify-end gap-2">
                <PeriodNotesButton notes={currentYear?.notes} onSave={handleSaveYearNotes} isPending={updateYearNotes.isPending} />
            </div>}

            {/* Goals — the only part that fades in when you switch period */}
            <PageEnter level="year" className="space-y-6">
            {/* Goals */}
            {hasGoals ? (
                <>
                                        <SortableGoalGrid
                        items={sortedYearlyGoals}
                        onReorder={handleReorder}
                    >
                        {(item) => {
                            const goal = yearlyGoals!.find(g => g.id === item.id)!;
                            const hasChildren = hasQuarterlyChildren(goal.id);
                            return (
                                <GoalCard
                                    goal={enrichGoal(goal, [], yearlyGoals!, categories!)}
                                    onDelete={handleDeleteYearlyGoal}
                                    canDelete={!hasChildren}
                                    deleteWarning={hasChildren ? t('goals.deleteYearlyWarning') : undefined}
                                />
                            );
                        }}
                    </SortableGoalGrid>
                </>
            ) : emptyState}

            {/* Onboarding: where to go next once this page is done */}
            <NextStepHint level="year" />

            </PageEnter>

            {/* Phone: Add goal floats at the bottom, as in the mobile design */}
            {showAddGoal && <Button
                onClick={newClick}
                className="fixed end-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 h-12 px-5 shadow-lg sm:hidden"
            >
                <PlusIcon />
                {t('goals.addGoal')}
            </Button>}
        </div>
    )
}

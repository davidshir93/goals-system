import GoalCard from "@/components/GoalCard";
import { SortableGoalGrid } from "@/components/SortableGoalGrid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext"
import { useCategories, useIdentities, useYearlyGoals, useYears, useQuarters, useDeleteYearlyGoal, useUpdateYearNotes, useReorderYearlyGoals } from "@/data/queries";
import { PeriodNotes } from "@/components/PeriodNotes";
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

    const newClick = () => {
        navigate("new")
    }
    const { data: categories, isLoading: catLoading, error: catErr } = useCategories(user?.uid || "");
    const { data: identities, isLoading: idLoading, error: idErr } = useIdentities(user?.uid || "");
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

    const isLoading = yearlyGoalsLoading || catLoading || idLoading;
    const hasError = yearlyGoalsErr || catErr || idErr;

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
                <p className="text-destructive font-medium">{t('goals.failedYearly')}</p>
                <p className="text-destructive/80 text-sm mt-1">{t('common.tryRefreshing')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('periods.year')} {currentYear?.name || ''}</h1>
                </div>
                <Button onClick={newClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ltr:mr-2 rtl:ml-2">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                    </svg>
                    {t('goals.addGoal')}
                </Button>
            </div>

            {/* Goals Grid */}
            {sortedYearlyGoals && sortedYearlyGoals.length > 0 ? (
                <SortableGoalGrid
                    items={sortedYearlyGoals}
                    onReorder={handleReorder}
                >
                    {(item) => {
                        const goal = yearlyGoals!.find(g => g.id === item.id)!;
                        const hasChildren = hasQuarterlyChildren(goal.id);
                        return (
                            <GoalCard
                                goal={enrichGoal(goal, [], yearlyGoals!, categories!, identities!)}
                                onDelete={handleDeleteYearlyGoal}
                                canDelete={!hasChildren}
                                deleteWarning={hasChildren ? t('goals.deleteYearlyWarning') : undefined}
                            />
                        );
                    }}
                </SortableGoalGrid>
            ) : (
                <div className="text-center py-12">
                    <div className="rounded-full bg-muted p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t('goals.noYearlyGoals')}</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                        {t('goals.noYearlyGoalsDesc')}
                    </p>
                    <Button onClick={newClick}>{t('goals.addFirstGoal')}</Button>
                </div>
            )}

            {/* Period Notes */}
            <PeriodNotes
                notes={currentYear?.notes}
                onSave={handleSaveYearNotes}
                isPending={updateYearNotes.isPending}
            />
        </div>
    )
}

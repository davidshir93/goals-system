import GoalCard from "@/components/GoalCard";
import { GoalGrid } from "@/components/GoalGrid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import {
  useCategories,
  useIdentities,
  useQuarterlyGoals,
  useQuarters,
  useYearlyGoals,
  useYears,
} from "@/data/queries";
import { enrichGoal } from "@/utils/goalsUtils";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Quarter() {
  const { user } = useAuth();

  const { selectedYear, selectedQuarter } = useGoals();

  const [showParentsGoals, setShowParentGoals] = useState(false);

  const navigate = useNavigate();

  const newClick = () => {
    navigate("new");
  };

  const { data: categories, error: catErr } = useCategories(user?.uid || "");
  const { data: identities, error: idErr } = useIdentities(user?.uid || "");
  const { data: yearlyGoals, error: yearlyGoalsErr } = useYearlyGoals(
    user?.uid || "",
    selectedYear
  );
  const { data: quarterlyGoals, error: quarterlyGoalsErr } = useQuarterlyGoals(
    user?.uid || "",
    selectedYear,
    selectedQuarter
  );

  // Get period names for context
  const { data: years } = useYears(user?.uid || "");
  const { data: quarters } = useQuarters(user?.uid || "", selectedYear);

  const currentYear = years?.find(y => y.id === selectedYear);
  const currentQuarter = quarters?.find(q => q.id === selectedQuarter);

  const enrichedQuarterlyGoals = useMemo(() => {
    return quarterlyGoals?.map((goal) =>
      enrichGoal(goal, quarterlyGoals!, yearlyGoals!, categories!, identities!)
    );
  }, [quarterlyGoals, yearlyGoals, categories, identities]);

  if (quarterlyGoalsErr || yearlyGoalsErr || catErr || idErr) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-destructive font-medium">Failed to load quarterly goals</p>
        <p className="text-destructive/80 text-sm mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{currentYear?.name}</p>
          <h1 className="text-2xl font-bold tracking-tight">Quarter {currentQuarter?.name || ''}</h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-input h-4 w-4"
              checked={showParentsGoals}
              onChange={() => setShowParentGoals((prev) => !prev)}
            />
            <span className="text-muted-foreground">Show parent goals</span>
          </label>
          <Button onClick={newClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Add Goal
          </Button>
        </div>
      </div>

      {/* Goals Grid */}
      {enrichedQuarterlyGoals && enrichedQuarterlyGoals.length > 0 ? (
        <GoalGrid>
          {enrichedQuarterlyGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              showParentGoals={showParentsGoals}
            />
          ))}
        </GoalGrid>
      ) : (
        <div className="text-center py-12">
          <div className="rounded-full bg-muted p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No quarterly goals yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Set your quarterly goals to break down your yearly objectives.
          </p>
          <Button onClick={newClick}>Add your first goal</Button>
        </div>
      )}
    </div>
  );
}

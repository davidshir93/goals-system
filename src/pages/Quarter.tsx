import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import {
  useCategories,
  useIdentities,
  useQuarterlyGoals,
  useYearlyGoals,
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

  const enrichedQuarterlyGoals = useMemo(() => {
    return quarterlyGoals?.map((goal) =>
      enrichGoal(goal, quarterlyGoals!, yearlyGoals!, categories!, identities!)
    );
  }, [quarterlyGoals, yearlyGoals, categories, identities]);

  if (quarterlyGoalsErr || yearlyGoalsErr || catErr || idErr) return "Waittttt";

  return (
    <>
      <div className="flex gap-4 p-4">
        <input
          type="checkbox"
          className="text-sm"
          checked={showParentsGoals}
          onChange={() => setShowParentGoals((prev) => !prev)}
        />
        <Label>Show Parents Goals</Label>
      </div>
      <ul>
        {enrichedQuarterlyGoals?.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            showParentGoals={showParentsGoals}
          />
        ))}
        <li>
          <Button onClick={newClick}>Add quarterly goal</Button>
        </li>
      </ul>
    </>
  );
}

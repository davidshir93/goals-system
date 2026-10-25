import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import { useQuarters, useWeeks, useYears } from "@/data/queries";
import type { Level } from "@/hooks/useOnboarding";
import PeriodForm from "./PeriodForm";
import { Modal } from "./Modal";
import { Button } from "./ui/button";
import { PlusIcon } from "./icons";

/* "Create year / quarter / week" for the empty panels — the same form as
 * "New …" in the period picker. The new period is selected automatically. */
export function NewPeriodButton({ type, label }: { type: Level; label: string }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { selectedYear, selectedQuarter } = useGoals();
  const uid = user?.uid || "";
  const { data: years } = useYears(uid);
  const { data: quarters } = useQuarters(uid, selectedYear);
  const { data: weeks } = useWeeks(uid, selectedYear, selectedQuarter);
  const existing = (type === "year" ? years : type === "quarter" ? quarters : weeks) ?? [];
  return (
    <>
      <Button onClick={() => setOpen(true)} aria-haspopup="dialog">
        <PlusIcon />
        {label}
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <PeriodForm type={type} existPeriods={existing} closeModal={() => setOpen(false)} />
      </Modal>
    </>
  );
}

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { GoalExpansionDialog } from "./GoalExpansionDialog";
import { PeriodNotes } from "./PeriodNotes";
import { NotesIcon } from "./icons";
import { RESPONSIVE } from "./ParentGoalsToggle";

/* "Period notes" in the page header. Opens the notes in a dialog that grows
 * out of the button (same expanding dialog as the goal card). */

type Props = {
  notes?: string;
  onSave: (notes: string) => void;
  isPending?: boolean;
  /** Icon only on every size. Default: icon only on phones, icon + label from sm. */
  iconOnly?: boolean;
  className?: string;
};

export function PeriodNotesButton({ notes, onSave, isPending, iconOnly, className }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const label = t("periods.periodNotes");
  const close = () => {
    setOpen(false);
    ref.current?.focus({ preventScroll: true });
  };
  return (
    <>
      <Button
        ref={ref}
        variant="outline"
        size={iconOnly ? "icon" : "default"}
        aria-haspopup="dialog"
        aria-label={iconOnly ? label : undefined}
        title={iconOnly ? label : undefined}
        onClick={() => setOpen(true)}
        className={[iconOnly ? "" : RESPONSIVE, className ?? ""].join(" ")}
      >
        <NotesIcon />
        {iconOnly ? null : <span className="max-sm:sr-only">{label}</span>}
      </Button>
      {open && (
        <GoalExpansionDialog originRef={ref} title={label} onClose={close}>
          {(dismiss) => <PeriodNotes bare notes={notes} onSave={onSave} isPending={isPending} onDismiss={dismiss} />}
        </GoalExpansionDialog>
      )}
    </>
  );
}

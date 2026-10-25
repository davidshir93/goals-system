import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { BranchIcon } from "./icons";

/* Show / hide the parent goals (Quarter, Year) on every card.
 *
 * Styled exactly like "Period notes" next to it — the same outline button,
 * colours, hover and focus ring; icon + label on desktop, icon only on phones.
 * It's a toggle button (aria-pressed); "on" is also visible: sunken
 * background and a primary border. */

type Props = {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  /** Icon only on every size. Default: icon only on phones, icon + label from sm. */
  iconOnly?: boolean;
  className?: string;
};

/** Icon-only square on phones, icon + label from sm. */
export const RESPONSIVE = "max-sm:w-9 max-sm:has-[>svg]:px-0";

export function ParentGoalsToggle({ pressed, onPressedChange, iconOnly, className }: Props) {
  const { t } = useTranslation();
  return (
    <Button
      variant="outline"
      size={iconOnly ? "icon" : "default"}
      aria-pressed={pressed}
      aria-label={iconOnly ? t("goals.showParentGoals") : undefined}
      title={iconOnly ? t("goals.showParentGoals") : undefined}
      onClick={() => onPressedChange(!pressed)}
      className={[
        "aria-pressed:border-[var(--text-primary)] aria-pressed:bg-[var(--surface-sunken)]",
        "dark:aria-pressed:border-[var(--text-primary)] dark:aria-pressed:bg-[var(--surface-sunken)]",
        iconOnly ? "" : RESPONSIVE,
        className ?? "",
      ].join(" ")}
    >
      <BranchIcon size={16} />
      {iconOnly ? null : <span className="max-sm:sr-only">{t("goals.parentGoals")}</span>}
    </Button>
  );
}

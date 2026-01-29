import { Button } from "@/components/ui/button";
import type { ViewPreference } from "@/hooks/useViewPreference";
import { useTranslation } from "react-i18next";

type ViewToggleProps = {
  view: ViewPreference;
  onViewChange: (view: ViewPreference) => void;
};

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex items-center border rounded-md p-0.5 bg-muted/30">
      <Button
        variant={view === "card" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("card")}
        className="h-7 px-2.5 gap-1.5"
        title={t("view.card")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className="h-7 px-2.5 gap-1.5"
        title={t("view.table")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" x2="21" y1="6" y2="6" />
          <line x1="3" x2="21" y1="12" y2="12" />
          <line x1="3" x2="21" y1="18" y2="18" />
        </svg>
      </Button>
    </div>
  );
}

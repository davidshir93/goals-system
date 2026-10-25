import { useTranslation } from "react-i18next";
import { CATEGORIES, type CategoryColorId } from "@/tokens/categories";

/* Pick one of the design system's category colours — never a free hex.
 *
 * Native radio buttons, visually swatches: arrow keys move between colours,
 * Tab enters and leaves the group, and screen readers hear each colour's name
 * and "1 of 12". */

type CategoryColorPickerProps = {
  /** Unique per picker on the page; groups the radios. */
  name: string;
  value: CategoryColorId | undefined;
  onChange: (id: CategoryColorId) => void;
};

export function CategoryColorPicker({ name, value, onChange }: CategoryColorPickerProps) {
  const { t } = useTranslation();
  return (
    <fieldset>
      <legend className="sr-only">{t("itemsList.color")}</legend>
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((c) => (
          <label key={c.id} className="grid size-7 cursor-pointer place-items-center rounded-full">
            <input
              type="radio"
              name={name}
              value={c.id}
              checked={value === c.id}
              onChange={() => onChange(c.id)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="size-5 rounded-full ring-offset-2 ring-offset-[var(--surface-raised)] peer-checked:ring-2 peer-checked:ring-[var(--text-primary)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--text-primary)]"
              style={{ background: `var(--category-${c.name}-fill)` }}
            />
            <span className="sr-only">{t(`colors.${c.name}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

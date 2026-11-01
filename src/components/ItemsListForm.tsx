import * as z from "zod";
import { useState } from "react";
import { useFieldArray, useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import type { Category } from "@/types/GoalTypes";
import { useAddCategories, useYearlyGoals } from "@/data/queries";
import { useTranslation } from "react-i18next";
import { CategoryColorPicker } from "./CategoryColorPicker";
import {
    CATEGORIES,
    categoryColorVar,
    toCategoryColor,
    type CategoryColorId,
} from "@/tokens/categories";

/* Edit the list of categories: a name and one of the design system's colours.
 *
 * Each category is a row with its pill, as it looks on the goal cards. One row
 * at a time opens in place to edit its name and colour, so the colours show
 * only for the category being edited. Nothing is saved until Save, so Cancel
 * undoes a delete.
 *
 * A category's colour is a palette id. A legacy hex is shown as its nearest
 * palette colour, so saving the list migrates it. */

const toPaletteId = (color: number | string | undefined): CategoryColorId =>
    (toCategoryColor(color) ?? CATEGORIES[0]).id;

type ItemsListFormProps = {
    currentItems: Category[];
    closeModal: () => void;
};

export default function ItemsListForm({ currentItems, closeModal }: ItemsListFormProps) {
    const { t } = useTranslation();

    const ItemSchema = z.object({
        // Kept from the saved category, so renaming it doesn't orphan its goals.
        id: z.string().optional(),
        name: z.string().trim().min(3, t("validation.minChars", { count: 3 })).max(30).default(""),
        color: z.number().int().refine((id) => CATEGORIES.some((c) => c.id === id)),
    });
    const ItemsListSchema = z.object({
        items: z
            .array(ItemSchema)
            .min(1, t("itemsList.addCategory"))
            .superRefine((items, ctx) => {
                const seen = new Set<string>();
                items.forEach((item, index) => {
                    const key = item.name.trim().toLowerCase();
                    if (seen.has(key))
                        ctx.addIssue({ code: "custom", path: [index, "name"], message: t("validation.duplicateName") });
                    seen.add(key);
                });
            }),
    });

    type ItemsListFormType = z.infer<typeof ItemsListSchema>;
    type ItemsListFormOutput = z.output<typeof ItemsListSchema>;

    const form = useForm<ItemsListFormType>({
        resolver: zodResolver(ItemsListSchema) as Resolver<ItemsListFormOutput>,
        defaultValues: {
            items: (currentItems || []).map((item) => ({ id: item.id, name: item.name, color: toPaletteId(item.color) })),
        },
    });

    const { control, handleSubmit, watch, setFocus, formState } = form;
    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const watchedItems = watch("items");

    // The row open for editing; one at a time.
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const { user } = useAuth();
    const { selectedYear } = useGoals();
    const addCategories = useAddCategories();

    // How many of this year's goals use each category (quarter and week goals follow their year goal).
    const { data: yearlyGoals } = useYearlyGoals(user?.uid || "", selectedYear);
    const goalCount = (id: string | undefined) => (id ? (yearlyGoals ?? []).filter((g) => g.categoryId === id).length : 0);

    const onSubmit = async (data: ItemsListFormOutput) => {
        if (!user?.uid) return;
        const items = data.items.map((item) => ({ ...item, id: item.id ?? crypto.randomUUID() }));
        await addCategories.mutateAsync({ uid: user.uid, items });
        closeModal();
    };

    // A closed row hides its error: open the first one that has one.
    const onInvalid = (errors: FieldErrors<ItemsListFormType>) => {
        const first = errors.items && Array.isArray(errors.items) ? errors.items.findIndex(Boolean) : -1;
        if (first >= 0) {
            setOpenIndex(first);
            setTimeout(() => setFocus(`items.${first}.name`));
        }
    };

    const addCategory = () => {
        append({
            name: "",
            // first palette colour no other category uses yet
            color: (CATEGORIES.find((c) => !watchedItems.some((i) => i.color === c.id)) ?? CATEGORIES[0]).id,
        });
        setOpenIndex(fields.length);
        setTimeout(() => setFocus(`items.${fields.length}.name`));
    };

    const deleteCategory = (index: number) => {
        remove(index);
        setOpenIndex(null);
    };

    return (
        <div className="space-y-4">
            <h2 className="type-main-title">{t("itemsList.editCategories")}</h2>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-3">
                    <ul className="space-y-1.5">
                        {fields.map((field, index) => {
                            const item = watchedItems[index];
                            const open = openIndex === index;
                            const count = goalCount(item?.id);
                            const hasError = Boolean(formState.errors.items?.[index]);
                            const panelId = `category-panel-${field.id}`;
                            return (
                                <li
                                    key={field.id}
                                    className={`rounded-xl ${open ? "bg-[var(--surface-sunken)]/50 ring-1 ring-[var(--border-default)]" : ""} ${hasError && !open ? "ring-1 ring-[var(--signal-danger-fill)]" : ""}`}
                                >
                                    <button
                                        type="button"
                                        aria-expanded={open}
                                        aria-controls={panelId}
                                        onClick={() => setOpenIndex(open ? null : index)}
                                        className="flex min-h-12 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
                                    >
                                        <span
                                            className="type-caption-strong inline-flex min-w-0 items-center truncate rounded-full px-2.5 py-0.5 text-[var(--text-primary)]"
                                            style={{ background: categoryColorVar(item?.color, "bg") }}
                                        >
                                            {item?.name.trim() || t("itemsList.newCategory")}
                                        </span>
                                        <span className="flex-1" />
                                        <span className="type-caption shrink-0 text-[var(--text-secondary)]">
                                            {count ? t("itemsList.goalCount", { count }) : t("itemsList.noGoals")}
                                        </span>
                                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-[var(--text-secondary)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </button>

                                    {open && (
                                        <div id={panelId} className="space-y-3 px-3 pb-3">
                                            <FormField
                                                control={control}
                                                name={`items.${index}.name`}
                                                render={({ field: nameField }) => (
                                                    <FormItem>
                                                        <FormLabel>{t("itemsList.name")}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={t("itemsList.categoryPlaceholder")} className="h-11" {...nameField} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name={`items.${index}.color`}
                                                render={({ field: colorField }) => (
                                                    <CategoryColorPicker
                                                        name={`category-color-${field.id}`}
                                                        value={colorField.value as CategoryColorId}
                                                        onChange={colorField.onChange}
                                                    />
                                                )}
                                            />
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteCategory(index)}
                                                    className="type-body-title inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-[var(--signal-danger-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
                                                >
                                                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    </svg>
                                                    {t("itemsList.deleteCategory")}
                                                </button>
                                                {count > 0 && (
                                                    <p className="type-caption text-[var(--text-secondary)]">{t("itemsList.deleteHint")}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    <button
                        type="button"
                        onClick={addCategory}
                        className="type-body-title flex min-h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
                    >
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                        {t("itemsList.addCategory")}
                    </button>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" className="min-h-11" onClick={closeModal}>
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" className="min-h-11 flex-1">
                            {t("common.save")}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

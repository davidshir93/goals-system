import * as z from "zod";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import type { Category } from "@/types/GoalTypes";
import { useAddCategories } from "@/data/queries";
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

    const { control, handleSubmit, watch } = form;
    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const watchedItems = watch("items");

    const { user } = useAuth();
    const addCategories = useAddCategories();

    const onSubmit = async (data: ItemsListFormOutput) => {
        if (!user?.uid) return;
        const items = data.items.map((item) => ({ ...item, id: item.id ?? crypto.randomUUID() }));
        await addCategories.mutateAsync({ uid: user.uid, items });
        closeModal();
    };

    return (
        <div className="space-y-4">
            <h2 className="type-main-title">{t("itemsList.editCategories")}</h2>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="space-y-2 rounded-lg px-3 py-2"
                            style={{ backgroundColor: categoryColorVar(watchedItems[index]?.color, "bg") }}
                        >
                            <div className="flex items-center gap-2">
                                <FormField
                                    control={control}
                                    name={`items.${index}.name`}
                                    render={({ field: nameField }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    placeholder={t("itemsList.categoryPlaceholder")}
                                                    className="h-8 border-0 bg-transparent px-2 focus-visible:ring-0"
                                                    {...nameField}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    aria-label={t("common.delete")}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => remove(index)}
                                >
                                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6L6 18" />
                                        <path d="M6 6l12 12" />
                                    </svg>
                                </Button>
                            </div>
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
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={() =>
                            append({
                                name: "",
                                // first palette colour no other category uses yet
                                color: (CATEGORIES.find((c) => !watchedItems.some((i) => i.color === c.id)) ?? CATEGORIES[0]).id,
                            })
                        }
                    >
                        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                        {t("itemsList.addCategory")}
                    </Button>

                    <div className="flex justify-end gap-2 pt-3">
                        <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" size="sm" className="flex-1">
                            {t("common.save")}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

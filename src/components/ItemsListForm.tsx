import * as z from "zod";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import type { Category, Identity } from "@/types/GoalTypes";
import { useAddCategories, useAddIdentities } from "@/data/queries";
import { Badge } from "./ui/badge";
import { useTranslation } from "react-i18next";

type ItemsListFormProps = {
    type: "category" | "identity";
    currentItems: Category[] | Identity[];
    closeModal: () => void;
};

export default function ItemsListForm({
    type,
    currentItems,
    closeModal,
}: ItemsListFormProps) {
    const { t } = useTranslation()

    const ItemSchema = z.object({
        name: z.string().trim().min(3, t('validation.minChars', { count: 3 })).max(30).default(""),
        color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, t('validation.invalidHexColor')),
    });

    const ItemsListSchema = z.object({
        items: z.array(ItemSchema).min(1, `Add at least one ${type}`),
    });

    type ItemsListFormType = z.infer<typeof ItemsListSchema>;
    type ItemsListFormOutput = z.output<typeof ItemsListSchema>;

    const form = useForm<ItemsListFormType>({
        resolver: zodResolver(ItemsListSchema) as Resolver<ItemsListFormOutput>,
        defaultValues: { items: currentItems || [] },
    });

    const { control, handleSubmit, watch } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const watchedItems = watch("items");

    const { user } = useAuth()

    const addCategories = useAddCategories();
    const addIdentities = useAddIdentities();

    const onSubmit = async (data: ItemsListFormOutput) => {
        const { items } = data

        if (user?.uid) {
            const itemsWithIds = items.map(item => {
                return { ...item, id: item.name.trim().toLowerCase() }
            })
            if (type === 'category') {
                await addCategories.mutateAsync({ uid: user.uid, items: itemsWithIds })
            } else if (type === 'identity') {
                await addIdentities.mutateAsync({ uid: user.uid, items: itemsWithIds })
            }
            closeModal()
        }
    };

    const placeholder = type === "category" ? t('itemsList.categoryPlaceholder') : t('itemsList.identityPlaceholder');
    const addButtonText = type === "category" ? t('itemsList.addCategory') : t('itemsList.addIdentity');
    const saveButtonText = type === "category" ? t('itemsList.saveCategories') : t('itemsList.saveIdentities');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold mb-1">{type === "category" ? t('itemsList.editCategories') : t('itemsList.editIdentities')}</h2>
                <p className="text-sm text-muted-foreground">
                    {type === "category"
                        ? t('itemsList.categoriesHelp')
                        : t('itemsList.identitiesHelp')}
                </p>
            </div>

            {/* Preview Section */}
            {watchedItems.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">{t('common.preview')}</p>
                    <div className="flex flex-wrap gap-2">
                        {watchedItems.map((item, index) => (
                            <Badge
                                key={index}
                                style={{ backgroundColor: item.color }}
                                className="text-white"
                            >
                                {item.name || (type === "category"
                                    ? t('itemsList.categoryNumber', { number: index + 1 })
                                    : t('itemsList.identityNumber', { number: index + 1 }))}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                            style={{ borderLeftColor: watchedItems[index]?.color, borderLeftWidth: 4 }}
                        >
                            <FormField
                                control={control}
                                name={`items.${index}.color`}
                                render={({ field: colorField }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="color"
                                                className="w-10 h-10 p-1 cursor-pointer rounded-md border-2"
                                                {...colorField}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name={`items.${index}.name`}
                                render={({ field: nameField }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input
                                                placeholder={placeholder}
                                                className="border-0 bg-transparent focus-visible:ring-0 text-base font-medium"
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
                                size="icon"
                                className="text-muted-foreground hover:text-destructive shrink-0"
                                onClick={() => remove(index)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"/>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                </svg>
                            </Button>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => append({ name: "", color: "#6366f1" })}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ltr:mr-2 rtl:ml-2">
                            <path d="M12 5v14"/>
                            <path d="M5 12h14"/>
                        </svg>
                        {addButtonText}
                    </Button>

                    <div className="flex gap-2 pt-4 border-t">
                        <Button type="submit" className="flex-1">
                            {saveButtonText}
                        </Button>
                        <Button type="button" variant="outline" onClick={closeModal}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

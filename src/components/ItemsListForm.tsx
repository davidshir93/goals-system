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

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">
                {type === "category" ? t('itemsList.editCategories') : t('itemsList.editIdentities')}
            </h2>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="flex items-center gap-2 py-2 px-3 rounded-lg"
                            style={{ backgroundColor: watchedItems[index]?.color + '20' }}
                        >
                            <FormField
                                control={control}
                                name={`items.${index}.color`}
                                render={({ field: colorField }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="color"
                                                className="w-8 h-8 p-0.5 cursor-pointer rounded border-0"
                                                {...colorField}
                                            />
                                        </FormControl>
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
                                                className="h-8 border-0 bg-transparent focus-visible:ring-0 px-2"
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
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => remove(index)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18"/>
                                    <path d="M6 6l12 12"/>
                                </svg>
                            </Button>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={() => append({ name: "", color: "#6366f1" })}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
                            <path d="M12 5v14"/>
                            <path d="M5 12h14"/>
                        </svg>
                        {addButtonText}
                    </Button>

                    <div className="flex gap-2 pt-3">
                        <Button type="submit" size="sm" className="flex-1">
                            {t('common.save')}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

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
    const ItemSchema = z.object({
        name: z.string().trim().min(3, "Min 3 chars").max(30).default(""),
        color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Invalid hex color"),
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

    const { control, handleSubmit } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

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

    return (
        <>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {fields.map((field, index) => {
                        return (
                            <div
                                className="flex items-center items-start gap-2"
                                key={field.id}
                            >
                                <FormField
                                    control={control}
                                    name={`items.${index}.color`}
                                    render={({ field: colorField }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="color" className="w-12" {...colorField} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name={`items.${index}.name`}
                                    render={({ field: nameField }) => (
                                        <FormItem className="width-100">
                                            <FormControl>
                                                <Input {...nameField} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => remove(index)}
                                >
                                    🗑️
                                </Button>
                            </div>
                        );
                    })}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ name: "", color: "#000000" })}
                    >
                        Add {type[0].toLocaleUpperCase() + type.slice(1)}
                    </Button>
                    <br />
                    <Button type="submit">
                        Save {type === "category" ? "Categories" : "Identities"}
                    </Button>
                    <br />
                    <Button type="button" variant="outline" onClick={() => closeModal()}>
                        Cancel
                    </Button>
                </form>
            </Form>
        </>
    );
}

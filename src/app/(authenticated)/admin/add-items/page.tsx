"use client"
import {
    toast
} from "sonner"
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    cn
} from "@/lib/utils"
import {
    Button
} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Input
} from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/trpc/react"

const formSchema = z.object({
    name: z.string(),
    category: z.number(),
    amount: z.string(),
    image: z.string()
});

export default function AddItem() {
    const [categories] = api.category.getCategories.useSuspenseQuery();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: 0,
            amount: "",
            image: ""
        }
    })
    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            console.log(values);
            toast(
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(values, null, 2)}</code>
                </pre>
            );
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    }

    return (
        <Card className="max-w-3xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Product</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name:</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder=""
                                            type=""
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category:</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price:</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder=""
                                            type="number"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Upload Image:</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder=""
                                            type="file"
                                            accept="image/*"
                                            {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
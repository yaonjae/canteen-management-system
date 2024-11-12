"use client"
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Button
} from "@/components/ui/button"
import {
    Form,
    FormControl,
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
import { useToast } from "@/hooks/use-toast"
import { getFormattedDate } from "@/lib/utils";
import { useRouter } from 'next/navigation'

const formSchema = z.object({
    name: z.string().min(1, { message: "Product name is required." }),
    category: z.number().min(1, { message: "Category is required." }),
    amount: z.string().min(1, { message: "Price is required." }),
    image: z
        .instanceof(File, { message: "Image is required." })
        .refine(file => file.size > 0, { message: "Please upload an image file." }),
});

export default function AddItem() {
    const router = useRouter()
    const [categories] = api.category.getCategories.useSuspenseQuery();
    const { toast } = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: 0,
            amount: "",
            image: undefined,
        },
    });

    const createProduct = api.product.create.useMutation({
        onSuccess: () => {
            toast({
                title: "Product created successfully!",
                description: getFormattedDate(),
            });
            window.location.reload();
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to create product. Please try again.",
                description: getFormattedDate(),
            })
        },
    });

    const handleFileUpload = async (file: File) => {
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (values.image && values.image instanceof File) {
            const imageBase64 = await handleFileUpload(values.image);
            createProduct.mutate({
                name: values.name,
                category: values.category,
                amount: parseFloat(values.amount),
                image: imageBase64,
            });
        }
    };

    return (
        <Card className="max-w-3xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Add Product</CardTitle>
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
                                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()} value={field.value.toString()}>
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
                                            onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button variant='outline' type="button" onClick={() => router.push('/admin/products')}>Cancel</Button>&nbsp;
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
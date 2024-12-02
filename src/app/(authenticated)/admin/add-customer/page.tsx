"use client"
import {
    useEffect,
    useState
} from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { getFormattedDate } from "@/lib/utils"

const formSchema = z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    contact_number: z.string()
});

export default function AddCustomer() {
    const router = useRouter()
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const customerId = searchParams.get('id');
    const { data: customer } = api.customer.getCustomerById.useQuery(
        { id: String(customerId) },
        { enabled: Boolean(customerId) }
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: '',
            last_name: '',
            first_name: '',
            contact_number: '',
        }
    })

    const createCustomer = api.customer.create.useMutation({
        onSuccess: () => {
            toast({
                title: "Customer created successfully!",
                description: getFormattedDate(),
            });
            router.push('/admin/customer');
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to create customer. Please try again.",
                description: getFormattedDate(),
            })
        },
    });

    const updateCustomer = api.customer.update.useMutation({
        onSuccess: () => {
            toast({
                title: "Customer updated successfully!",
                description: getFormattedDate(),
            });
            router.push('/admin/customer');
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to update customer. Please try again.",
                description: getFormattedDate(),
            });
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (customerId) {
            await updateCustomer.mutateAsync(values);
        } else {
            await createCustomer.mutateAsync(values);
        }
    };

    useEffect(() => {
        if (customer) {
            form.reset({
                id: customer.id,
                last_name: customer.last_name,
                first_name: customer.first_name,
                contact_number: customer.contact_number ?? '',
            });
        }
    }, [customer, form]);

    return (
        <Card className="max-w-3xl mx-auto py-5">
            <CardHeader>
                <CardTitle>{customerId ? "Edit " : "Add "}Staff and Faculty</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID:</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder=""
                                            disabled={!!customerId}
                                            type=""
                                            {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name:</FormLabel>
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
                            </div>
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name:</FormLabel>
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
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="contact_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Number:</FormLabel>
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
                        <Button variant='outline' type="button" onClick={() => router.push('/admin/customer')}>Cancel</Button>&nbsp;
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
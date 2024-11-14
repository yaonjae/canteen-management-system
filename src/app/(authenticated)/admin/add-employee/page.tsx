"use client"
import {
    useEffect,
    useState
} from "react"
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
import { getFormattedDate } from "@/lib/utils";

const formSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(5, "Password must be at least 5 characters"),
});

export default function AddEmployee() {
    const router = useRouter()
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const employeeId = searchParams.get('id');
    const { data: employee } = api.employee.getEmployeeById.useQuery(
        { id: Number(employeeId) },
        { enabled: Boolean(employeeId) }
    );
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            last_name: "",
            first_name: "",
            username: "",
            password: "",
        },
    })

    const createEmployee = api.employee.create.useMutation({
        onSuccess: () => {
            toast({
                title: "Employee created successfully!",
                description: getFormattedDate(),
            });
            router.push('/admin/employees');
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to create employee. Please try again.",
                description: getFormattedDate(),
            })
        },
    });

    const updateEmployee = api.employee.update.useMutation({
        onSuccess: () => {
            toast({
                title: "Employee updated successfully!",
                description: getFormattedDate(),
            });
            router.push('/admin/employees');
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to update employee. Please try again.",
                description: getFormattedDate(),
            });
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (employeeId) {
            await updateEmployee.mutateAsync({
                id: Number(employeeId),
                ...values,
            });
        } else {
            await createEmployee.mutateAsync(values);
        }
    };

    useEffect(() => {
        if (employee) {
            form.reset({
                last_name: employee.last_name,
                first_name: employee.first_name,
                username: employee.username,
                password: employee.password,
            });
        }
    }, [employee, form]);

    return (
        <Card className="max-w-3xl mx-auto py-5">
            <CardHeader>
                <CardTitle>{employeeId ? "Edit " : "Add "}Employee</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username:</FormLabel>
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
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password:</FormLabel>
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
                        <Button variant='outline' type="button" onClick={() => router.push('/admin/employees')}>Cancel</Button>&nbsp;
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from "@/trpc/react"
import React, { useEffect } from 'react'
import formatDate from '@/lib/utils'
import { DatePickerWithRange } from '@/components/ui/datePickerWithRange'
import { DateRange } from 'react-day-picker'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { z } from 'zod'
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"

const formSchema = z.object({
    transaction_type: z.string(),
    is_fully_paid: z.string(),
    date_range: z.object({
        from: z.date().nullable(),
        to: z.date().nullable(),
    })
});

const Employees = () => {
    // const [transactions] = api.transaction.getTransactions.useSuspenseQuery();
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date_range: { from: null, to: null },
        },
    });

    const { data: transactions } = api.transaction.getTransactions.useQuery(form.watch(), {
        enabled: true,
    });

    const formData = form.watch()

    React.useEffect(() => {
        form.setValue("date_range", dateRange ? { from: dateRange.from ?? null, to: dateRange.to ?? null } : { from: null, to: null });
    }, [dateRange, form]);

    return (
        <div className="mx-auto py-5 flex space-x-4 items-start">
            <Card className='flex-1'>
                <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Order No.</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Mode</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No transactions available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions?.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{transaction.cashier_id}</TableCell>
                                        <TableCell>{transaction.Cashier.last_name}, {transaction.Cashier.first_name}</TableCell>
                                        <TableCell>{transaction.id}</TableCell>
                                        <TableCell>{transaction.total_cost}</TableCell>
                                        <TableCell>{transaction.transaction_type}</TableCell>
                                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                                        <TableCell>{transaction.is_fully_paid ? 'PAID' : 'UNPAID'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="flex-none">
                <CardContent className='pt-5'>
                    <Form {...form}>
                        <form className='space-y-5'>
                            <FormField
                                control={form.control}
                                name="transaction_type"
                                render={({ field }) => (
                                    <FormItem className='w-[300px]'>
                                        <FormLabel>Payment Mode:</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CASH">Cash</SelectItem>
                                                <SelectItem value="CREDIT">Credit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="is_fully_paid"
                                render={({ field }) => (
                                    <FormItem className='w-[300px]'>
                                        <FormLabel>Status:</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Paid</SelectItem>
                                                <SelectItem value="false">Unpaid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date_range"
                                render={({ field }) => (
                                    <FormItem className='w-[300px]'>
                                        <FormLabel>Date Range:</FormLabel>
                                        <FormControl>
                                            <DatePickerWithRange
                                                dateRange={dateRange}
                                                onDateChange={setDateRange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Employees
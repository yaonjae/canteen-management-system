'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from "@/trpc/react"
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange"
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { endOfDay } from 'date-fns'
import formatDate, { formatCurrency } from '@/lib/utils'
import { Input } from "@/components/ui/input"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
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
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import { z } from 'zod'

const formSchema = z.object({
    transaction_type: z.string(),
    date_range: z.object({
        from: z.date().nullable(),
        to: z.date().nullable(),
    })
});

const ViewCustomer = () => {
    const router = useRouter()
    const [dateRangeList, setDateRangeList] = React.useState<DateRange | undefined>()
    const [dateRangeHistory, setDateRangeHistory] = React.useState<DateRange | undefined>()
    const searchParams = useSearchParams();
    const customerId = searchParams.get('id');
    const { data: orders, isLoading } = customerId ? api.customer.getCustomerCredit.useQuery({ id: customerId }) : { data: null, isLoading: false };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date_range: { from: null, to: null },
        },
    });

    return (
        <Tabs defaultValue="list" className="max-w-6xl mx-auto py-5">
            <div className='w-80'>
                <TabsList className="flex">
                    <TabsTrigger value="list" className='flex-1'>Credits List</TabsTrigger>
                    <TabsTrigger value="history" className='flex-1'>Transaction History</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="list">
                <Card>
                    <CardContent className='space-y-4 pt-7'>
                        <div className='flex items-center justify-start'>
                            <Label className='w-28'>Date Range:</Label>
                            <DatePickerWithRange
                                className="w-[250px]"
                                dateRange={dateRangeList}
                                onDateChange={(e) => setDateRangeList({
                                    from: e?.from,
                                    to: e?.to ? endOfDay(e.to) : undefined,
                                })}
                            />
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total Cost</TableHead>
                                    <TableHead>Total Paid</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders?.order.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            No order available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders?.order.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                                            <TableCell>{formatCurrency(order.total_cost)}</TableCell>
                                            <TableCell>{formatCurrency(order.total_paid)}</TableCell>
                                        </TableRow>
                                    )))}
                            </TableBody>
                        </Table>
                        <div className='flex items-center justify-end gap-4'>
                            <p className='font-bold'>Current Credit: {formatCurrency(orders?.total_cost || 0)}</p>
                            <Button>Pay</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="history" className='flex space-x-4 items-start'>
                <Card className='flex-1'>
                    <CardContent className='space-y-4 pt-7'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Total Cost</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders?.history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            No order available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders?.history.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.transaction_type}</TableCell>
                                            <TableCell>{formatCurrency(order.total_cost)}</TableCell>
                                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                                        </TableRow>
                                    )))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="flex-none">
                    <CardContent className="pt-5">
                        <Form {...form}>
                            <form className="space-y-5">
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
                                    name="date_range"
                                    render={({ field }) => (
                                        <FormItem className='w-[300px]'>
                                            <FormLabel>Date Range:</FormLabel>
                                            <FormControl>
                                                <DatePickerWithRange
                                                    dateRange={dateRangeHistory}
                                                    onDateChange={setDateRangeHistory}
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
            </TabsContent>
        </Tabs>
    )
}

export default ViewCustomer

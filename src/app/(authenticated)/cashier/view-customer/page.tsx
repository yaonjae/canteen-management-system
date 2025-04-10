'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from "@/trpc/react"
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange"
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { endOfDay } from 'date-fns'
import formatDate, { formatCurrency, getFormattedDate, getFormattedDateDay, getFormattedTime } from '@/lib/utils'
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
import PaginationComponent from '@/app/_components/pagination'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import PaymentDialog from '@/app/_components/pay-dialog'
import { useToast } from '@/hooks/use-toast'
import { useStore } from '@/lib/store/app'

const formSchema = z.object({
    transaction_type: z.string(),
    date_range: z.object({
        from: z.date().nullable(),
        to: z.date().nullable(),
    })
});

const ViewCustomer = () => {
    const { user } = useStore();
    const router = useRouter()
    const { toast } = useToast();
    const [dateRangeList, setDateRangeList] = React.useState<DateRange | undefined>()
    const [dateRangeHistory, setDateRangeHistory] = React.useState<DateRange | undefined>()
    const searchParams = useSearchParams();
    const customerId = searchParams.get('id');
    const [currentOrdersPage, setCurrentOrdersPage] = React.useState(1);
    const [currentHistoryPage, setCurrentHistoryPage] = React.useState(1);
    const itemsPerPage = 10;
    const [isDialogOpen, setDialogOpen] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState<number | string>('')
    const [currentCredit, setCurrentCredit] = useState<number>(0)
    const [remainingCredit, setRemainingCredit] = useState<number>(0)
    const { data: customer } = api.customer.getCustomerById.useQuery(
        { id: String(customerId) },
        { enabled: Boolean(customerId) }
    );
    const { data: orders, isLoading, refetch: refetchOrder } = customerId
        ? api.customer.getCustomerCredit.useQuery({
            id: customerId,
            page: currentOrdersPage,
            itemsPerPage,
            date_range: dateRangeList
                ? { from: dateRangeList.from ?? null, to: dateRangeList.to ?? null }
                : undefined,
        })
        : { data: null, isLoading: false };

    const { data: history, isLoading: isHistoryLoading, refetch: refetchHistory } = customerId
        ? api.customer.getCustomerHistory.useQuery({
            id: customerId,
            page: currentHistoryPage,
            itemsPerPage,
            date_range: dateRangeHistory
                ? { from: dateRangeHistory.from ?? null, to: dateRangeHistory.to ?? null }
                : undefined,
        })
        : { data: null, isLoading: false };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date_range: { from: null, to: null },
        },
    });

    const handlePayClick = () => {
        setCurrentCredit(orders?.total_cost || 0)
        setDialogOpen(true)
    }

    const handlePaymentChange = (value: string) => {
        const amount = parseFloat(value)
        setPaymentAmount(value)
        setRemainingCredit(currentCredit - (isNaN(amount) ? 0 : amount))
    }

    const creditsPayment = api.customer.payCredits.useMutation({
        onSuccess: (data) => {
            toast({
                title: "Payment successful!",
                description: getFormattedDate(),
            });
            if (refetchOrder) {
                refetchOrder();
            }
            if (refetchHistory) {
                refetchHistory();
            }
            setDialogOpen(false);
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to process payment. Please try again.",
                description: getFormattedDate(),
            })
        },
    })

    const handleConfirmPayment = async () => {
        if (customerId) {
            const payload = {
                id: customerId,
                payment: Number(paymentAmount)
            }

            const lineWidth = 34;

            const centerText = (text: string): string => {
                const padding = Math.floor((lineWidth - text.length) / 2);
                return " ".repeat(padding > 0 ? padding : 0) + text;
            };

            const fullName = customer?.first_name + " " + customer?.last_name;
            const ramainingCredit = payload.payment > currentCredit ? 0 : currentCredit - payload.payment;
            const change = payload.payment - currentCredit > 0 ? payload.payment - currentCredit : 0;

            let orderDetails = "";
            let totalCost = 0;
            if (orders?.orders) {
                orders.orders.forEach((order) => {
                    order.Orders.forEach((item) => {
                        orderDetails += `${item.Product.name.toUpperCase()} (${item.quantity}) : PHP ${item.ProductPrice.amount !== null ? item.ProductPrice.amount.toFixed(2) : 0} = PHP ${((item.ProductPrice.amount !== null ? item.ProductPrice.amount : 0) * item.quantity).toFixed(2)}\n`;
                        totalCost += item.ProductPrice.amount || 0 * item.quantity;
                    });
                });
            }

            const textData = [
                "\n",
                `${centerText("Canteen Payment")}\n`,
                `${centerText("Management System")}\n\n`,
                `Date: ${getFormattedDateDay()}\n`,
                `Customer: ${fullName}\n`,
                `Time: ${getFormattedTime()}\n\n`,
                `Total Credits: PHP ${currentCredit.toFixed(2)}\n`,
                `Payment: PHP ${payload.payment.toFixed(2)}\n`,
                `Remaining Credit: PHP ${remainingCredit.toFixed(2)}\n`,
                change > 0 ? `Change: PHP ${change.toFixed(2)}\n` : "",
                "\n\n\n",
            ];

            try {
                const device = await navigator.bluetooth.requestDevice({
                    // acceptAllDevices: true,
                    filters: [{ name: "POS58DB55A" }],
                    optionalServices: ["e7810a71-73ae-499d-8c15-faa9aef0c3f2"],
                    // optionalServices: ["49535343-fe7d-4ae5-8fa9-9fafd205e455"],
                });

                if (!device.gatt) {
                    throw new Error("Selected device does not support GATT.");
                }

                console.log("Attempting to connect to GATT server...");
                const server = await device.gatt.connect();
                console.log("Connected to GATT server");
                // server.disconnect(); return;
                const service = await server.getPrimaryService(
                    "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
                    // "49535343-fe7d-4ae5-8fa9-9fafd205e455",
                );
                console.log("Service found");
                const characteristic = await service.getCharacteristic(
                    "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
                    // "49535343-aca3-481c-91ec-d85e28a60318",
                );
                console.log("Characteristic found");

                const encoder = new TextEncoder();
                for (const text of textData) {
                    const encodedText = encoder.encode(text);
                    await characteristic.writeValue(encodedText);
                }

                console.log("Receipt printed successfully");
                server.disconnect();
                console.log("Disconnected from GATT server");
            } catch (error) {
                console.error("Bluetooth error:", error);
            }


            await creditsPayment.mutateAsync({
                ...payload,
            })
        }

    }

    const printOrders = async () => {
        if (customerId) {
            const payload = {
                id: customerId,
                payment: Number(paymentAmount)
            }

            const lineWidth = 34;

            const centerText = (text: string): string => {
                const padding = Math.floor((lineWidth - text.length) / 2);
                return " ".repeat(padding > 0 ? padding : 0) + text;
            };

            const fullName = customer?.first_name + " " + customer?.last_name;
            const ramainingCredit = payload.payment > currentCredit ? 0 : currentCredit - payload.payment;
            const change = payload.payment - currentCredit > 0 ? payload.payment - currentCredit : 0;

            let orderDetails = "";
            let totalCost = 0;
            if (orders?.orders) {
                orders.orders.forEach((order) => {
                    order.Orders.forEach((item) => {
                        orderDetails += `${item.Product.name.toUpperCase()} (${item.quantity}) : PHP ${item.ProductPrice.amount !== null ? item.ProductPrice.amount.toFixed(2) : 0} = PHP ${((item.ProductPrice.amount !== null ? item.ProductPrice.amount : 0) * item.quantity).toFixed(2)}\n`;
                        totalCost += (item.ProductPrice.amount !== null ? item.ProductPrice.amount : 0) * item.quantity;
                    });
                });
            }

            const textData = [
                "\n",
                `${centerText("Canteen Payment")}\n`,
                `${centerText("Management System")}\n\n`,
                `Date: ${getFormattedDateDay()}\n`,
                `Customer: ${fullName}\n`,
                `Time: ${getFormattedTime()}\n\n`,
                "Orders:\n",
                orderDetails,
                `\nTotal Cost: PHP ${totalCost.toFixed(2)}\n`,
                "\n\n\n",
            ];

            try {
                const device = await navigator.bluetooth.requestDevice({
                    // acceptAllDevices: true,
                    filters: [{ name: "POS58DB55A" }],
                    optionalServices: ["e7810a71-73ae-499d-8c15-faa9aef0c3f2"],
                    // optionalServices: ["49535343-fe7d-4ae5-8fa9-9fafd205e455"],
                });

                if (!device.gatt) {
                    throw new Error("Selected device does not support GATT.");
                }

                console.log("Attempting to connect to GATT server...");
                const server = await device.gatt.connect();
                console.log("Connected to GATT server");
                // server.disconnect(); return;
                const service = await server.getPrimaryService(
                    "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
                    // "49535343-fe7d-4ae5-8fa9-9fafd205e455",
                );
                console.log("Service found");
                const characteristic = await service.getCharacteristic(
                    "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f",
                    // "49535343-aca3-481c-91ec-d85e28a60318",
                );
                console.log("Characteristic found");

                const encoder = new TextEncoder();
                for (const text of textData) {
                    const encodedText = encoder.encode(text);
                    await characteristic.writeValue(encodedText);
                }

                console.log("Receipt printed successfully");
                server.disconnect();
                console.log("Disconnected from GATT server");
            } catch (error) {
                console.error("Bluetooth error:", error);
            }
        }
    }

    return (
        <div className="mx-auto max-w-7xl items-start space-y-5 py-5">
            <div className="flex items-center justify-between">
                <p className="font-bold uppercase">{user?.username}</p>
                <Button onClick={() => router.push("/cashier")}>Back</Button>
            </div>
            <Tabs defaultValue="list">
                <div className='flex justify-between items-center'>
                    <TabsList className="flex w-80">
                        <TabsTrigger value="list" className='flex-1'>Credits List</TabsTrigger>
                        <TabsTrigger value="history" className='flex-1'>Transaction History</TabsTrigger>
                    </TabsList>
                    <div className='grid grid-cols-2 px-2 gap-2'>
                        <p className='text-right'>Name: </p>
                        <p className='font-bold'>{customer?.last_name}, {customer?.first_name}</p>
                    </div>
                </div>
                <TabsContent value="list">
                    <Card>
                        <CardContent className='space-y-4 pt-7'>
                            <div className='flex justify-between items-center'>
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
                                <div className='flex items-center justify-end gap-4'>
                                    <p className='font-bold'>Current Credit: {formatCurrency(orders?.total_cost || 0)}</p>
                                    <Button onClick={handlePayClick}>Pay</Button>
                                    <Button onClick={printOrders} variant={'outline'}>Print</Button>
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Total Cost</TableHead>
                                        <TableHead>Total Paid</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders?.orders.flatMap((order) => {
                                        let remainingPaid = order.total_paid;
                                        const reversedOrders = [...order.Orders].reverse();
                                        const processedRows = reversedOrders.map((orderItem) => {
                                            const amount = orderItem.ProductPrice?.amount || 0;
                                            const rowTotal = amount * orderItem.quantity;
                                            let rowPaid = 0;
                                            if (remainingPaid >= rowTotal) {
                                                rowPaid = rowTotal;
                                                remainingPaid -= rowTotal;
                                            } else if (remainingPaid > 0) {
                                                rowPaid = remainingPaid;
                                                remainingPaid = 0;
                                            }
                                            return {
                                                id: order.id,
                                                createdAt: order.createdAt,
                                                productName: orderItem.Product.name,
                                                quantity: orderItem.quantity,
                                                amount,
                                                rowTotal,
                                                rowPaid,
                                                key: `${order.id}-${orderItem.id}`,
                                            };
                                        });

                                        return processedRows.reverse().map((row) => (
                                            <TableRow key={row.key}>
                                                <TableCell>{row.id}</TableCell>
                                                <TableCell>{formatDate(row.createdAt)}</TableCell>
                                                <TableCell>{row.productName}</TableCell>
                                                <TableCell>{row.quantity}</TableCell>
                                                <TableCell>{formatCurrency(row.amount)}</TableCell>
                                                <TableCell>{formatCurrency(row.rowTotal)}</TableCell>
                                                <TableCell>{formatCurrency(row.rowPaid)}</TableCell>
                                            </TableRow>
                                        ));
                                    })}
                                </TableBody>
                            </Table>
                            {Math.ceil((orders?.totalOrders || 0) / itemsPerPage) > 1 && (
                                <PaginationComponent
                                    currentPage={currentOrdersPage}
                                    totalPages={Math.ceil((orders?.totalOrders || 0) / itemsPerPage)}
                                    onPageChange={setCurrentOrdersPage}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history" className='flex space-x-4 items-start'>
                    <Card className='flex-1'>
                        <CardContent className='space-y-4 pt-7'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Total Cost</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history?.history.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">
                                                No order available
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        history?.history.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>{order.transaction_type}</TableCell>
                                                <TableCell>{formatCurrency(order.total_cost)}</TableCell>
                                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                            </TableRow>
                                        )))}
                                </TableBody>
                            </Table>
                            {Math.ceil((history?.totalHistory || 0) / itemsPerPage) > 1 && (
                                <PaginationComponent
                                    currentPage={currentHistoryPage}
                                    totalPages={Math.ceil((history?.totalHistory || 0) / itemsPerPage)}
                                    onPageChange={setCurrentHistoryPage}
                                />
                            )}
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
            <PaymentDialog
                isOpen={isDialogOpen}
                onOpenChange={setDialogOpen}
                currentCredit={currentCredit}
                paymentAmount={paymentAmount}
                onPaymentChange={handlePaymentChange}
                remainingCredit={remainingCredit}
                onConfirmPayment={handleConfirmPayment}
            />
        </div>
    )
}

export default ViewCustomer

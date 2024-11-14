'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from "@/trpc/react"
import { useRouter } from 'next/navigation'
import React from 'react'
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange"
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { endOfDay } from 'date-fns'

const ViewCustomer = () => {
    const router = useRouter()
    const [customers] = api.customer.getCustomers.useSuspenseQuery();
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

    return (
        <Card className="max-w-4xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex justify-start items-center'>
                    <Label className='w-32'>Date Range:</Label>
                    <DatePickerWithRange
                        className="w-[300px]"
                        dateRange={dateRange}
                        onDateChange={(e) => setDateRange({
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
                            <TableHead>Total</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                                No order available
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Button variant='outline' onClick={() => router.push('/admin/customer')}>Back</Button>
            </CardContent>
        </Card>
    )
}

export default ViewCustomer

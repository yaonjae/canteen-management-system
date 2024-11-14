'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from "@/trpc/react"
import { useRouter } from 'next/navigation'
import React from 'react'
import { DatePickerWithRange } from "@/components/ui/datePickerWithRange"
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import formatDate, { formatCurrency } from '@/lib/utils'
import { endOfDay, format } from 'date-fns'
import { Separator } from '@/components/ui/separator'

const Sales = () => {
    const router = useRouter()
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

    const { data: { transaction: sales = [], totalcost = 0, totalcash = 0, totalcredit = 0 } = {} } = api.transaction.getSales.useQuery({
        date_range: dateRange
            ? { from: dateRange.from ?? null, to: dateRange.to ?? null }
            : undefined,
    });

    const formattedDateRange = dateRange
        ? `${dateRange.from ? format(dateRange.from, 'MMM dd, yyyy') : ''} - ${dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : ''}`
        : 'No date selected'

    return (
        <div className="max-w-7xl mx-auto py-5 flex space-x-4 items-start">
            <Card className='flex-1'>
                <CardHeader>
                    <CardTitle>Sales</CardTitle>
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
                                <TableHead>Payment Mode</TableHead>
                                <TableHead>Total Cost</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No sales available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>{sale.transaction_type}</TableCell>
                                        <TableCell>{formatCurrency(sale.total_cost)}</TableCell>
                                        <TableCell>{formatDate(sale.createdAt)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className='flex-none'>
                <CardHeader className='bg-slate-100 rounded-t'>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>{dateRange ? formattedDateRange : ''}</CardDescription>
                </CardHeader>
                <CardContent className='w-96 space-y-2 pt-5'>
                    <div className='flex justify-between items-center text-sm'>
                        <p className='font-medium'>Transaction Count</p>
                        <p>{dateRange?.from && dateRange?.to ? sales.length : '0'}</p>
                    </div>
                    <div className='flex justify-between items-center text-sm'>
                        <p className='font-medium'>Total Cash</p>
                        <p>{dateRange?.from && dateRange?.to ? totalcash : '0'}</p>
                    </div>
                    <div className='flex justify-between items-center text-sm'>
                        <p className='font-medium'>Total Credit</p>
                        <p>{dateRange?.from && dateRange?.to ? totalcredit : '0'}</p>
                    </div>
                    <Separator className="my-4" />
                    <div className='flex justify-between items-center text-sm'>
                        <p className='font-bold'>Total Cost</p>
                        <p>{dateRange?.from && dateRange?.to ? formatCurrency(totalcost) : formatCurrency(0)}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Sales

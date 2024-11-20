'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import formatDate, { formatCurrency } from '@/lib/utils'
import { api } from '@/trpc/react'
import { ArrowLeftRight, ChartColumnIncreasing, Package, PhilippinePeso, ShoppingCart, Users } from 'lucide-react'
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const Dashboard = () => {
    const router = useRouter()
    const { data: dashboardData } = api.dashboard.getDashboardData.useQuery();
    if (!dashboardData) {
        return null;
    }
    const { transactions, customerCount, productCount, overallSales, monthlySales } = dashboardData;

    const getCurrentMonth = () => {
        const date = new Date();
        return date.toLocaleString('default', { month: 'long' });
    }

    return (
        <div className='py-5 mx-auto max-w-6xl space-y-3'>
            <div className='grid grid-cols-4 gap-3'>
                <Card>
                    <CardContent className='relative pt-7'>
                        <CardTitle className='text-base'>Customers</CardTitle>
                        <h2 className='text-2xl font-bold text-blue-500'>{customerCount}</h2>
                        <CardDescription className='text-xs'>Total number of registered users</CardDescription>
                        <Users color='white' className='absolute p-3 bg-blue-500 rounded-lg top-3 right-3 size-12' />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='relative pt-7'>
                        <CardTitle className='text-base'>Products</CardTitle>
                        <h2 className='text-2xl font-bold text-blue-500'>{productCount}</h2>
                        <CardDescription className='text-xs'>Total count of available products</CardDescription>
                        <Package color='white' className='absolute p-3 bg-blue-500 rounded-lg top-3 right-3 size-12' />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='relative pt-7'>
                        <CardTitle className='text-base'>Sales This Month</CardTitle>
                        <h2 className='text-2xl font-bold text-blue-500'>{formatCurrency(monthlySales)}</h2>
                        <CardDescription className='text-xs'>Total sales revenue generated this {getCurrentMonth()}</CardDescription>
                        <PhilippinePeso color='white' className='absolute p-3 bg-blue-500 rounded-lg top-3 right-3 size-12' />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='relative pt-7'>
                        <CardTitle className='text-base'>Overall Sales</CardTitle>
                        <h2 className='text-2xl font-bold text-blue-500'>{formatCurrency(overallSales)}</h2>
                        <CardDescription className='text-xs'>Cumulative sales revenue generated to date</CardDescription>
                        <ChartColumnIncreasing color='white' className='absolute p-3 bg-blue-500 rounded-lg top-3 right-3 size-12' />
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className='rounded-t bg-slate-100'>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='text-base'>Customer Credit List</CardTitle>
                        <Button size={'sm'} onClick={() => router.push('/admin/transactions')}><ArrowLeftRight /></Button>
                    </div>
                    <CardDescription>Overview of the latest credit transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cashier Name</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Mode</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No transactions available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions?.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{transaction.Cashier.last_name}, {transaction.Cashier.first_name}</TableCell>
                                        <TableCell>{formatCurrency(transaction.total_cost - transaction.total_paid)}</TableCell>
                                        <TableCell>{transaction.transaction_type}</TableCell>
                                        <TableCell>{transaction.is_fully_paid ? 'PAID' : 'UNPAID'}</TableCell>
                                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default Dashboard

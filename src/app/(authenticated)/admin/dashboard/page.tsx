'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/trpc/react'
import { ArrowLeftRight, ChartColumnIncreasing, Package, PhilippinePeso, ShoppingCart, Users } from 'lucide-react'
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const Dashboard = () => {
    const [dashboardData] = api.dashboard.getDashboardData.useSuspenseQuery();
    const { transactions, orders, customerCount, productCount, overallSales, monthlySales } = dashboardData;
    const router = useRouter()

    const getCurrentMonth = () => {
        const date = new Date();
        return date.toLocaleString('default', { month: 'long' });
    }

    return (
        <div className='grid grid-cols-6 gap-5 py-5 mx-auto max-w-7xl'>
            <div className='grid grid-cols-2 col-span-3 gap-5'>
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
                <Card className='col-span-2 h-[450px]'>
                    <CardHeader className='rounded-t bg-slate-100'>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-base'>Orders</CardTitle>
                            <Button size={'sm'} onClick={() => router.push('/admin/customer')}><ShoppingCart /></Button>
                        </div>
                        <CardDescription>List of the most recent customer orders</CardDescription>
                    </CardHeader>
                    <CardContent className='pt-2'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cashier Name</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment Mode</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            No orders available.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.Transaction.Cashier.last_name}, {order.Transaction.Cashier.first_name}</TableCell>
                                            <TableCell>{formatCurrency(order.quantity * order.Product.amount)}</TableCell>
                                            <TableCell>{order.Transaction.transaction_type}</TableCell>
                                            <TableCell>{order.Transaction.is_fully_paid ? 'PAID' : 'UNPAID'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <Card className='col-span-3'>
                <CardHeader className='rounded-t bg-slate-100'>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='text-base'>Transactions</CardTitle>
                        <Button size={'sm'} onClick={() => router.push('/admin/transactions')}><ArrowLeftRight /></Button>
                    </div>
                    <CardDescription>Overview of the latest financial transactions processed</CardDescription>
                </CardHeader>
                <CardContent className='pt-5'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cashier Name</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Mode</TableHead>
                                <TableHead>Status</TableHead>
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
                                        <TableCell>{formatCurrency(transaction.total_cost)}</TableCell>
                                        <TableCell>{transaction.transaction_type}</TableCell>
                                        <TableCell>{transaction.is_fully_paid ? 'PAID' : 'UNPAID'}</TableCell>
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

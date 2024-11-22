'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import formatDate, { formatCurrency } from '@/lib/utils'
import { api } from '@/trpc/react'
import { ArrowLeftRight, ChartColumnIncreasing, Package, PhilippinePeso, ShoppingCart, Users } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import PaginationComponent from '@/app/_components/pagination'

const ITEMS_PER_PAGE = 5;

const Dashboard = () => {
    const router = useRouter()
    const { data: dashboardData } = api.dashboard.getDashboardData.useQuery();
    const [currentPage, setCurrentPage] = useState(1);

    if (!dashboardData) {
        return null;
    }

    const { transactions, customerCount, productCount, overallSales, monthlySales } = dashboardData;

    const getCurrentMonth = () => {
        const date = new Date();
        return date.toLocaleString('default', { month: 'long' });
    };

    const totalPages = Math.ceil((transactions?.length || 0) / ITEMS_PER_PAGE);
    const paginatedTransactions = transactions?.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

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
                <CardHeader className='rounded-t bg-slate-100 relative'>
                    <CardTitle className='text-base'>Customer Credit List</CardTitle>
                    <CardDescription>Overview of the latest credit transactions</CardDescription>
                    <ArrowLeftRight color='white' className='absolute p-3 bg-blue-500 rounded-lg top-3 right-5 size-12' />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Total Cost</TableHead>
                                <TableHead>Total Paid</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTransactions?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No transactions available.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedTransactions?.map((transaction) => (
                                    <TableRow key={transaction.customer_id}>
                                        <TableCell>{transaction.customer?.last_name}, {transaction.customer?.first_name}</TableCell>
                                        <TableCell>{formatCurrency(transaction._sum.total_cost ?? 0)}</TableCell>
                                        <TableCell>{formatCurrency(transaction._sum.total_paid ?? 0)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant='outline'
                                                className='tracking-widest'
                                                onClick={() => router.push(`/admin/view-customer?id=${transaction.customer_id}`)}
                                            >
                                                ...
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {totalPages > 1 && (
                        <PaginationComponent
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
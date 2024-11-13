'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from "@/trpc/react"
import React from 'react'

const Employees = () => {
    const [transactions] = api.transaction.getTransactions.useSuspenseQuery();

    return (
        <Card className="max-w-5xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <Input placeholder='Search name' className='w-64' />
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
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No transactions available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.cashier_id}</TableCell>
                                    <TableCell>{transaction.Cashier.last_name}, {transaction.Cashier.first_name}</TableCell>
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>{transaction.total_cost}</TableCell>
                                    <TableCell>{transaction.transaction_type}</TableCell>
                                    <TableCell>{}</TableCell>
                                    <TableCell>{transaction.is_fully_paid ? 'PAID' : 'UNPAID'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default Employees
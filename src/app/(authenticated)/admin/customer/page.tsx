'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from "@/trpc/react"
import { Logs, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const Customer = () => {
    const router = useRouter()
    const [customers] = api.customer.getCustomers.useSuspenseQuery();

    return (
        <Card className="max-w-4xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex justify-between items-center'>
                    <Input placeholder='Search name' className='w-64' />
                    <Button onClick={() => router.push('/admin/add-customer')}>ADD</Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact Number</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No customer available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>{customer.id}</TableCell>
                                    <TableCell>{customer.last_name}, {customer.first_name}</TableCell>
                                    <TableCell>{customer.contact_number}</TableCell>
                                    <TableCell className='flex gap-4'>
                                        <Logs size={15} onClick={() => router.push('/admin/view-customer')} />
                                        <Pencil size={15} />
                                        <Trash2 size={15} color='red' />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default Customer
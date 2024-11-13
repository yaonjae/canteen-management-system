'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from "@/trpc/react"
import { Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const Employees = () => {
    const router = useRouter()
    const [employees] = api.employee.getEmployees.useSuspenseQuery();

    return (
        <Card className="max-w-4xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex justify-between items-center'>
                    <Input placeholder='Search name' className='w-64' />
                    <Button onClick={() => router.push('/admin/add-employee')}>ADD</Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No employees available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell>{employee.id}</TableCell>
                                    <TableCell>{employee.last_name}, {employee.first_name}</TableCell>
                                    <TableCell>{employee.username}</TableCell>
                                    <TableCell className='flex gap-2'>
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

export default Employees
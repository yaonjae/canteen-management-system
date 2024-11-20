'use client'
import DeleteDialog from '@/app/_components/delete-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from "@/trpc/react"
import { Pencil, ShoppingCart, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useToast } from "@/hooks/use-toast";
import { getFormattedDate } from "@/lib/utils";
import PaginationComponent from '@/app/_components/pagination'

const Customer = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const page = parseInt(searchParams.get('page') || '1');
    const itemsPerPage = 10;

    // Fetch customers with pagination
    const { data: customers, refetch } = api.customer.getCustomers.useQuery({
        page,
        itemsPerPage,
    });

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredCustomer = customers?.items.filter((customer) =>
        customer.last_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleEdit = (id: string) => {
        router.push(`/admin/add-customer?id=${id}`);
    };

    const handleDelete = (id: string) => {
        setSelectedId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedId !== null) {
            deleteCustomer.mutate({ id: selectedId });
            setIsDeleteDialogOpen(false);
            setSelectedId(null);
        }
    };

    const deleteCustomer = api.customer.delete.useMutation({
        onSuccess: () => {
            toast({
                title: "Customer deleted successfully!",
                description: getFormattedDate(),
            });
            refetch();
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to delete customer. Please try again.",
                description: getFormattedDate(),
            });
        },
    });

    useEffect(() => {
        refetch();
    }, [page]);

    const totalCount = customers?.totalCount ?? 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <Card className="max-w-4xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex justify-between items-center'>
                    <Input placeholder='Search Last Name' className='w-64' value={searchQuery} onChange={handleSearchChange} />
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
                        {filteredCustomer?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No customer available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomer?.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>{customer.id}</TableCell>
                                    <TableCell>{customer.last_name}, {customer.first_name}</TableCell>
                                    <TableCell>{customer.contact_number}</TableCell>
                                    <TableCell className='flex gap-4'>
                                        <ShoppingCart size={15} onClick={() => router.push(`/admin/view-customer?id=${customer.id}`)} />
                                        <Pencil size={15} onClick={() => handleEdit(customer.id)} />
                                        <Trash2 size={15} color='red' onClick={() => handleDelete(customer.id)} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {totalPages > 1 && (
                    <PaginationComponent
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(pageNumber: number) => {
                            router.push(`/admin/customers?page=${pageNumber}`);
                        }}
                    />
                )}
            </CardContent>
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                selection="Customer"
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />
        </Card>
    )
}

export default Customer;

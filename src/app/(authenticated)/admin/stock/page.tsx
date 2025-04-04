"use client"
import React from 'react'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Plus, SquarePen, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFormattedDate } from "@/lib/utils";
import DeleteDialog from '@/app/_components/delete-dialog';
import PaginationComponent from "@/app/_components/pagination";
import StockDialog from '@/app/_components/stock-dialog';

export type SelectionProps = {
    id: number,
    name: string,
    quantity: number
}

const Stock = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selection, setSelection] = useState<SelectionProps | null>(null);
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(10);

    const { data, isLoading, refetch } = api.product.getProducts.useQuery({ page: currentPage, pageSize })

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const { mutateAsync, isPending } = api.stock.create.useMutation({
        onSuccess: () => {
            toast({
                title: "Stock updated successfully!",
                description: getFormattedDate(),
            });
            refetch();
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to update stock. Please try again.",
                description: getFormattedDate(),
            })
        },
    });

    const filteredProducts = data?.products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleUpdate = (data: SelectionProps) => {
        setSelection(data);
        setIsDialogOpen(true);
    }

    const confirmUpdate = async (quantity: number) => {
        selection?.id && await mutateAsync({ product_id: selection?.id, quantity: quantity })
        setSelection(null);
    }

    return (
        <Card className="max-w-3xl py-5 mx-auto">
            <CardHeader>
                <CardTitle>Stocks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input
                        className="w-60"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="w-28">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No product available.
                                </TableCell>
                            </TableRow>
                        ) : (filteredProducts?.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell><Button variant={'outline'} onClick={() => handleUpdate(product)}><SquarePen /></Button></TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
                {data?.totalProducts && Math.ceil(data.totalProducts / pageSize) > 1 && (
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={Math.ceil(data.totalProducts / pageSize)}
                        onPageChange={setCurrentPage}
                    />
                )}
            </CardContent>
            <StockDialog
                selected={selection}
                onConfirm={confirmUpdate}
                onCancel={() => setSelection(null)}
                isPending={isPending}
            />
        </Card>
    )
}

export default Stock

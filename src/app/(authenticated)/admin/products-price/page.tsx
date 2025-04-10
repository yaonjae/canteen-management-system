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
import { Pencil, Plus, TableOfContents, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getFormattedDate } from "@/lib/utils";
import DeleteDialog from '@/app/_components/delete-dialog';
import PaginationComponent from "@/app/_components/pagination";
import ViewDialog from '@/app/_components/view-dialog';

const ProductPrice = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedProduct, setSelectedProduct] = useState(0)

    const { data, isLoading, refetch } = api.product.getProducts.useQuery({ page: currentPage, pageSize })
    const { data: productHistory, refetch: refetchHistory } = api.product.getProductsHistory.useQuery({ product_id: selectedProduct })

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const filteredProducts = data?.products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleViewHistory = (productId: number) => {
        setSelectedProduct(productId)
    }

    useEffect(() => {
        refetch();
    }, [currentPage, pageSize]);

    useEffect(() => {
        refetchHistory()
    }, [selectedProduct])

    return (
        <Card className="max-w-3xl py-5 mx-auto">
            <CardHeader>
                <CardTitle>Price Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-start gap-2">
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
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="w-28">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    No categories available.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts?.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.Category.name}</TableCell>
                                    <TableCell>{formatCurrency(product.ProductPriceHistory[0]?.amount || 0)}</TableCell>
                                    <TableCell><Button variant={'outline'} onClick={() => handleViewHistory(product.id)}><TableOfContents /></Button></TableCell>
                                </TableRow>
                            ))
                        )}
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

            <ViewDialog
                isOpen={selectedProduct > 0}
                productName={filteredProducts?.find(p => p.id === selectedProduct)?.name ?? ''}
                history={productHistory}
                onCancel={() => setSelectedProduct(0)}
            />
        </Card>
    );
}

export default ProductPrice

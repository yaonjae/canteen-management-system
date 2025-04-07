'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pencil, TableOfContents, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { Switch } from "@/components/ui/switch"
import { Label } from '@/components/ui/label'
import { useToast } from "@/hooks/use-toast"
import { getFormattedDate } from '@/lib/utils'
import CardLoader from '@/app/_components/card-loader'
import DeleteDialog from '@/app/_components/delete-dialog'
import PaginationComponent from '@/app/_components/pagination'
import ViewDialog from '@/app/_components/view-dialog'

const Products = () => {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [selectedProduct, setSelectedProduct] = useState(0)
    const { data, isLoading, refetch } = api.product.getProducts.useQuery({ page: currentPage, pageSize })
    const { data: productHistory, refetch: refetchHistory } = api.product.getProductsHistory.useQuery({ product_id: selectedProduct })
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const filteredProducts = data?.products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const deleteProduct = api.product.delete.useMutation({
        onSuccess: () => {
            toast({
                title: "Product deleted successfully!",
                description: getFormattedDate(),
            })
            refetch()
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to delete product. Please try again.",
                description: getFormattedDate(),
            })
        },
    });

    const updateProductStatus = api.product.updateStatus.useMutation({
        onSuccess: () => {
            toast({
                title: "Product status updated successfully!",
                description: getFormattedDate(),
            });
            refetch();
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to update product status. Please try again.",
                description: getFormattedDate(),
            });
        },
    });

    const handleEdit = (productId: number) => {
        router.push(`/admin/add-products?id=${productId}`);
    };

    const handleViewHistory = (productId: number) => {
        setSelectedProduct(productId)
    }

    const handleDelete = (id: number) => {
        setSelectedProductId(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (selectedProductId !== null) {
            deleteProduct.mutate({ id: selectedProductId })
            setIsDeleteDialogOpen(false)
            setSelectedProductId(null)
        }
    }

    const handleStatusChange = (productId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'AVAILABLE' ? 'NOT_AVAILABLE' : 'AVAILABLE';
        updateProductStatus.mutate({ id: productId, status: newStatus });
    };

    useEffect(() => {
        refetch();
    }, [currentPage, pageSize]);

    useEffect(() => {
        refetchHistory()
    }, [selectedProduct])

    return (
        <Card className="max-w-5xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="flex justify-between items-center">
                    <Input
                        className="w-60"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Button onClick={() => router.push('/admin/add-products')}>ADD</Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-wrap gap-4 justify-evenly">
                        {[...Array(4)].map((_, index) => (
                            <CardLoader key={index} />
                        ))}
                    </div>
                ) : filteredProducts?.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No products available</div>
                ) : (
                    <div className="flex flex-wrap gap-2 justify-evenly">
                        {filteredProducts?.map((product) => (
                            <Card className="w-56" key={product.id}>
                                <CardContent className="pt-5 space-y-3">
                                    <img src={product.image_url} alt="" className="w-full h-32 object-cover" />
                                    <div className="space-y-1">
                                        <h2 className="font-bold uppercase">{product.name}</h2>
                                        <p>{product.Category.name}</p>
                                        <p>₱{product.amount !== null ? product.amount.toFixed(2) : 0}</p>
                                        <p>{product.quantity}</p>
                                        <hr />
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="status">{product.status !== 'AVAILABLE' ? 'NOT AVAILABLE' : 'AVAILABLE'}</Label>
                                            <Switch id="status" checked={product.status === 'AVAILABLE'} onCheckedChange={() => handleStatusChange(product.id, product.status)} />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(product.id)}><Pencil /></Button>
                                    <Button size="sm" variant="outline" onClick={() => handleViewHistory(product.id)}><TableOfContents /></Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}><Trash /></Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
                {data?.totalProducts && Math.ceil(data.totalProducts / pageSize) > 1 && (
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={Math.ceil(data.totalProducts / pageSize)}
                        onPageChange={setCurrentPage}
                    />
                )}
            </CardContent>

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                selection="Product"
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />
            <ViewDialog
                isOpen={selectedProduct > 0}
                productName={filteredProducts?.find(p => p.id === selectedProduct)?.name ?? ''}
                history={productHistory}
                onCancel={() => setSelectedProduct(0)}
            />
        </Card>
    )
}

export default Products

'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pencil, Search, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { Switch } from "@/components/ui/switch"
import { Label } from '@/components/ui/label'
import { useToast } from "@/hooks/use-toast"
import { getFormattedDate } from '@/lib/utils'

const Products = () => {
    const router = useRouter()
    const { data: products, refetch } = api.product.getProducts.useQuery();
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const filteredProducts = products?.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const deleteProduct = api.product.delete.useMutation({
        onSuccess: () => {
            toast({
                title: "Product deleted successfully!",
                description: getFormattedDate(),
            });
            refetch();
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Failed to delete product. Please try again.",
                description: getFormattedDate(),
            });
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

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteProduct.mutate({ id })
        }
    }

    const handleStatusChange = (productId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'AVAILABLE' ? 'NOT_AVAILABLE' : 'AVAILABLE';
        setIsUpdating(true);
        updateProductStatus.mutate({ id: productId, status: newStatus });
    };

    useEffect(() => {
        refetch();
    }, [])

    return (
        <Card className="max-w-5xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className='space-y-5'>
                <div className='flex justify-between items-center'>
                    <Input
                        className='w-60'
                        placeholder='Search'
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Button onClick={() => router.push('/admin/add-products')}>ADD</Button>
                </div>
                {filteredProducts?.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No products available</div>
                ) : (
                    <div className='flex flex-wrap gap-4 justify-evenly'>
                        {filteredProducts?.map((product) => (
                            <Card className='w-56' key={product.id}>
                                <CardContent className='pt-5 space-y-3'>
                                    <img src={product.image_url} alt="" className='w-full h-32 object-cover' />
                                    <div className='space-y-2'>
                                        <h2 className='font-bold uppercase'>{product.name}</h2>
                                        <p>{product.Category.name}</p>
                                        <hr />
                                        <div className='flex justify-between items-center'>
                                            <Label htmlFor="status">{product.status != 'AVAILABLE' ? 'NOT AVAILABLE' : 'AVAILABLE'}</Label>
                                            <Switch id="status" checked={product.status == 'AVAILABLE'} onCheckedChange={() => handleStatusChange(product.id, product.status)} />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className='space-x-2'>
                                    <Button size={'sm'} variant='outline' onClick={() => handleEdit(product.id)}><Pencil /></Button>
                                    <Button size={'sm'} variant='destructive' onClick={() => handleDelete(product.id)}><Trash /></Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default Products

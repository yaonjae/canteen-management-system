'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Pencil, Search, Trash } from 'lucide-react'
import React from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'
import { Switch } from "@/components/ui/switch"
import { Label } from '@/components/ui/label'

const Products = () => {
    const router = useRouter()
    const [products] = api.product.getProducts.useSuspenseQuery();
    return (
        <Card className="max-w-5xl mx-auto py-5">
            <CardHeader>
                <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className='space-y-5'>
                <div className='flex justify-between items-center'>
                    <div className='flex gap-2'>
                        <Input className='w-60' />
                        <Button><Search /></Button>
                    </div>
                    <Button onClick={() => router.push('/admin/add-products')}>ADD</Button>
                </div>
                <div className='flex flex-wrap gap-4 justify-evenly'>
                    {products.map((product) => (
                        <Card className='w-56' key={product.id}>
                            <CardContent className='pt-5 space-y-3'>
                                <img src={product.image_url} alt="" className='w-full h-32 object-cover' />
                                <div className='space-y-2'>
                                    <h2 className='font-bold uppercase'>{product.name}</h2>
                                    <p>{product.Category.name}</p>
                                    <hr />
                                    <div className='flex justify-between items-center'>
                                        <Label htmlFor="status">{product.status}</Label>
                                        <Switch id="status" />
                                    </div>
                                </div>

                            </CardContent>
                            <CardFooter className='space-x-2'>
                                <Button size={'sm'} variant='outline'><Pencil /></Button>
                                <Button size={'sm'} variant='destructive'><Trash /></Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default Products

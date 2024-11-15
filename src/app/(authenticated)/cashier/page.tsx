'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { LogOut, Minus, Plus } from 'lucide-react'
import { api } from '@/trpc/react'
import CardLoaderCashier from '@/app/_components/card-loader-cashier'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { Table, TableBody, TableRow } from '@/components/ui/table'

const Cashier = () => {
  const [categories] = api.category.getCategories.useSuspenseQuery();
  const { data: products, isLoading, refetch } = api.product.getProducts.useQuery()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [orderSummary, setOrderSummary] = useState<Map<string, { count: number, price: number }>>(new Map())
  const router = useRouter()

  const logout = async () => {
    await axios.post("/api/auth/logout");
    window.location.href = "/";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
  }

  const filteredProducts = products?.filter((product) =>
    (product.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!selectedCategory || product.category_id.toString() === selectedCategory)
  )

  const handleProductClick = (productId: string) => {
    const product = products?.find((prod) => prod.id.toString() === productId)
    if (product) {
      setOrderSummary(prev => {
        const newSummary = new Map(prev)
        const currentItem = newSummary.get(product.name) || { count: 0, price: Number(product.amount) }
        const validPrice = isNaN(currentItem.price) ? 0 : currentItem.price
        newSummary.set(product.name, { count: currentItem.count + 1, price: validPrice })
        return newSummary
      })
    }
  }

  useEffect(() => {
    refetch();
  }, [])

  return (
    <div className='max-w-7xl mx-auto pt-5'>
      <div className='flex justify-end'>
        <Button onClick={logout}><LogOut />Logout</Button>
      </div>
      <div className='py-5 flex gap-2'>
        <div className='flex-1 w-8/12 space-y-4'>
          <div className='flex gap-2 justify-start items-center'>
            <Input className='w-72'
              placeholder='Search Name'
              value={searchQuery}
              onChange={handleSearchChange} />
            <Select value={selectedCategory ?? ''} onValueChange={handleCategoryChange}>
              <SelectTrigger className='w-72'>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant='outline' onClick={clearFilters}>Clear</Button>
          </div>
          <div className='flex flex-wrap justify-start gap-4'>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <CardLoaderCashier key={index} />
              ))
            ) : (
              filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className='size-48 relative shadow rounded-lg hover:scale-105 transition-transform duration-200 ease-in-out'
                    onClick={() => handleProductClick(product.id.toString())}
                  >
                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    <p className='absolute bottom-0 left-0 p-3 pt-14 w-full bg-gradient-to-b from-transparent to-blue-950 text-white rounded-b-lg'>{product.name}</p>
                  </div>
                ))
              ) : (
                <p className='text-center w-full text-gray-500 py-10'>No products available</p>
              )
            )}
          </div>
        </div>
        <Card className='self-start flex-none w-4/12'>
          <CardHeader className='bg-slate-100'>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review items and total before checkout</CardDescription>
          </CardHeader>
          <CardContent>
            {orderSummary.size > 0 ? (
              <div className='pt-5'>
                {Array.from(orderSummary.entries()).map(([productName, { count, price }]) => {
                  const validPrice = isNaN(price) ? 0 : price // Ensure price is valid
                  return (
                    <div key={productName} className='py-2 grid grid-cols-3'>
                      <p className='text-left text-sm'>{productName}</p>
                      <p className='text-center text-sm'>{count} x {formatCurrency(validPrice)}</p>
                      <p className='text-right text-sm'>{formatCurrency(count * validPrice)}</p>
                    </div>
                  )
                })}
                <Separator />
                <div className="flex justify-between items-center font-bold pt-4">
                  <p className='text-sm'>Total</p>
                  <p className='text-sm'>
                    {formatCurrency(Array.from(orderSummary.values()).reduce((total, { count, price }) => total + (count * (isNaN(price) ? 0 : price)), 0))}
                  </p>
                </div>
                <div className='flex justify-end pt-4 gap-2'>
                  <Button>Checkout</Button>
                </div>
              </div>
            ) : (
              <p className='py-5 text-center'>No items in the order summary.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Cashier
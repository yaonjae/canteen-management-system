'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { SelectionProps } from '../(authenticated)/admin/stock/page'

interface StockDialogProps {
    selected: SelectionProps | null
    onConfirm: (quantity: number) => void
    onCancel: () => void
    isPending: boolean
}

const StockDialog = ({ selected, onConfirm, onCancel, isPending }: StockDialogProps) => {
    const [quantity, setQuantity] = useState<number>(1)

    const handleIncrement = () => setQuantity(prev => prev + 1)
    const handleDecrement = () => setQuantity(prev => prev - 1)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10)
        if (!isNaN(value) && value >= 1) {
            setQuantity(value)
        } else {
            setQuantity(1)
        }
    }
    return (
        <Dialog open={!!selected} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Stock</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col items-center justify-center gap-3'>
                    <p className='font-bold'>{selected?.name}</p>
                    <div className='flex justify-center items-center gap-1'>
                        <Button variant={'outline'} className='h-20' onClick={handleDecrement}>-</Button>
                        <Input
                            type='number'
                            value={quantity}
                            onChange={handleChange}
                            className='text-center size-20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]'
                        />
                        <Button variant={'outline'} className='h-20' onClick={handleIncrement}>+</Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={() => onConfirm(quantity)} disabled={isPending}>Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default StockDialog

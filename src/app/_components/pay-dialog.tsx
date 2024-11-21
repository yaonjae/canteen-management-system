'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'

interface PaymentDialogProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    currentCredit: number
    paymentAmount: string | number
    onPaymentChange: (value: string) => void
    remainingCredit: number
    onConfirmPayment: () => void
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
    isOpen,
    onOpenChange,
    currentCredit,
    paymentAmount,
    onPaymentChange,
    remainingCredit,
    onConfirmPayment,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pay Credit</DialogTitle>
                    <DialogDescription>
                        Enter the amount to pay towards your current credit.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <p>Current Credit: {formatCurrency(currentCredit)}</p>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="payment">
                            Payment
                        </Label>
                        <Input
                            id="payment"
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => onPaymentChange(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <p>Remaining Credit: {remainingCredit > 0 ? formatCurrency(remainingCredit) : formatCurrency(0)}</p>
                </div>
                <DialogFooter>
                    <Button onClick={onConfirmPayment} type="submit">
                        Confirm Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default PaymentDialog
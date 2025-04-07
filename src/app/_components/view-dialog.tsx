'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ProductPriceHistory } from '@prisma/client'
import { format } from 'date-fns'

interface ViewDialogProps {
    isOpen: boolean
    productName: string
    history: ProductPriceHistory[] | undefined
    onCancel: () => void
}

const ViewDialog = ({ isOpen, productName, history, onCancel }: ViewDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{productName} Price History</DialogTitle>
                </DialogHeader>
                <div className="max-h-56 overflow-y-auto overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Price</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history?.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell>₱{entry.amount.toFixed(2)}</TableCell>
                                    <TableCell>{format(new Date(entry.createdAt), 'MMM dd, yyyy hh:mm a')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ViewDialog

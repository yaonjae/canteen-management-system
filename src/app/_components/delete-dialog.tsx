'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import React from 'react'

interface DeleteDialogProps {
    isOpen: boolean
    selection: string
    onConfirm: () => void
    onCancel: () => void
    isPermanent?: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ isOpen, selection, onConfirm, onCancel, isPermanent }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to delete this {selection}?{isPermanent && ' This action cannot be undone.'}</p>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog

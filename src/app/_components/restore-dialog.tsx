'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import React from 'react'

interface RestoreDialogProps {
    isOpen: boolean
    selection: string
    onConfirm: () => void
    onCancel: () => void
}

const RestoreDialog: React.FC<RestoreDialogProps> = ({ isOpen, selection, onConfirm, onCancel }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Restore</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to restore {selection}?</p>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Restore</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RestoreDialog

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReactNode } from 'react';

type ConfirmationDialogProps = {
    title: string;
    description: string | ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
};

export default function ConfirmationDialog({
    title,
    description,
    open,
    onOpenChange,
    onConfirm,
    confirmButtonText = 'Confirm',
    cancelButtonText = 'Cancel',
    confirmButtonVariant = 'destructive',
}: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {cancelButtonText}
                    </Button>
                    <Button variant={confirmButtonVariant} onClick={onConfirm}>
                        {confirmButtonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 
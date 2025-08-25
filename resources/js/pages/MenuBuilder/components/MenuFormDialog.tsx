import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Permission } from '@/types';
import MenuForm from './MenuForm';
import { Menu } from './MenuTree';

interface MenuFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isEdit: boolean;
    title: string;
    description: string;
    initialData: {
        name: string;
        slug: string;
        url: string;
        parent_id: number | null;
        is_active: boolean;
        permissions: number[];
    };
    permissions: Permission[];
    allMenus: Menu[];
    selectedMenu: Menu | null;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (formData: any, isEdit: boolean) => void;
}

export default function MenuFormDialog({
    isOpen,
    onOpenChange,
    isEdit,
    title,
    description,
    initialData,
    permissions,
    allMenus,
    selectedMenu,
    isSubmitting,
    onCancel,
    onSubmit,
}: MenuFormDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <MenuForm
                    isEdit={isEdit}
                    initialData={initialData}
                    permissions={permissions}
                    allMenus={allMenus}
                    selectedMenu={selectedMenu}
                    isSubmitting={isSubmitting}
                    onCancel={onCancel}
                    onSubmit={onSubmit}
                />
            </DialogContent>
        </Dialog>
    );
}

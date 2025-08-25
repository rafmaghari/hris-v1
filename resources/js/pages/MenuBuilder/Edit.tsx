import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { toast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Permission, Platform } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FolderTree, Plus } from 'lucide-react';
import { useState } from 'react';
import MenuFormDialog from './components/MenuFormDialog';
import MenuTree, { Menu } from './components/MenuTree';

type Props = {
    platform: Platform;
    menuTree: Menu[];
    permissions: Permission[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Menu Builder',
        href: route('menu-builder.index'),
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ platform, menuTree, permissions }: Props) {
    const [menus, setMenus] = useState<Menu[]>(menuTree);
    const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState<number | null>(null);

    // Debug permissions data
    console.log('Permissions received:', permissions);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        url: '',
        parent_id: null as number | null,
        is_active: true,
        permissions: [] as number[],
    });

    const handleAddMenu = () => {
        setIsEditMode(false);
        setSelectedMenu(null);
        setFormData({
            name: '',
            slug: '',
            url: '',
            parent_id: null,
            is_active: true,
            permissions: [],
        });
        setIsMenuDialogOpen(true);
    };

    const handleAddSubMenu = (parentMenu: Menu) => {
        setIsEditMode(false);
        setSelectedMenu(null);
        setFormData({
            name: '',
            slug: '',
            url: '',
            parent_id: parentMenu.id,
            is_active: true,
            permissions: [],
        });
        setIsMenuDialogOpen(true);
    };

    const handleEditMenu = (menu: Menu) => {
        setIsEditMode(true);
        setSelectedMenu(menu);
        console.log('Selected menu for edit:', menu);
        console.log('Menu permissions:', menu.permissions);

        // Find the parent of this menu in the flattened tree
        const findParentId = (menuId: number, menuList: Menu[], parentId: number | null = null): number | null => {
            for (const item of menuList) {
                if (item.id === menuId) {
                    return parentId;
                }
                if (item.children && item.children.length > 0) {
                    const foundInChildren = findParentId(menuId, item.children, item.id);
                    if (foundInChildren !== null) {
                        return foundInChildren;
                    }
                }
            }
            return null;
        };

        const parentId = findParentId(menu.id, menus);

        setFormData({
            name: menu.name,
            slug: menu.slug || '',
            url: menu.url || '',
            parent_id: parentId, // Set to the found parent_id instead of null
            is_active: menu.is_active,
            permissions: menu.permissions ? menu.permissions.map((p) => p.id) : [],
        });
        console.log('Form data permissions after mapping:', menu.permissions ? menu.permissions.map((p) => p.id) : []);

        setIsMenuDialogOpen(true);
    };

    const handleDeleteMenu = (menuId: number) => {
        // Find the menu in the flattened list to check if it has children
        const menuToDelete = allMenus.find((menu) => menu.id === menuId);

        if (menuToDelete && menuToDelete.children && menuToDelete.children.length > 0) {
            // If the menu has children, show an error toast and don't open the delete dialog
            toast({
                title: 'Cannot Delete Menu',
                description: 'This menu has sub-menus. Please delete all sub-menus first.',
                variant: 'destructive',
            });
            return;
        }

        // If no children, proceed with normal deletion flow
        setMenuToDelete(menuId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteMenu = () => {
        if (menuToDelete) {
            setIsSubmitting(true);

            router.delete(route('platforms.menus.destroy', { platform: platform.id, menu: menuToDelete }), {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast({
                        title: 'Menu deleted',
                        description: 'The menu has been deleted successfully.',
                    });
                    // Update local state with new data instead of page reload
                    if (page.props.menuTree && Array.isArray(page.props.menuTree)) {
                        setMenus(page.props.menuTree as Menu[]);
                    }
                },
                onError: (errors: any) => {
                    toast({
                        title: 'Error',
                        description: 'Failed to delete menu. Please try again.',
                        variant: 'destructive',
                    });
                    console.error('Error deleting menu:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                    setIsDeleteDialogOpen(false);
                },
            });
        }
    };

    const handleFormSubmit = (data: any, isEdit: boolean = false) => {
        setIsSubmitting(true);

        if (isEdit && selectedMenu) {
            router.put(route('platforms.menus.update', { platform: platform.id, menu: selectedMenu.id }), data, {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast({
                        title: 'Menu updated',
                        description: 'The menu has been updated successfully.',
                    });
                    setIsMenuDialogOpen(false);
                    // Update local state with new data instead of page reload
                    if (page.props.menuTree && Array.isArray(page.props.menuTree)) {
                        setMenus(page.props.menuTree as Menu[]);
                    }
                },
                onError: (errors: any) => {
                    toast({
                        title: 'Error',
                        description: 'Failed to update menu. Please try again.',
                        variant: 'destructive',
                    });
                    console.error('Error updating menu:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post(route('platforms.menus.store', { platform: platform.id }), data, {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast({
                        title: 'Menu created',
                        description: 'The menu has been created successfully.',
                    });
                    setIsMenuDialogOpen(false);
                    // Update local state with new data instead of page reload
                    if (page.props.menuTree && Array.isArray(page.props.menuTree)) {
                        setMenus(page.props.menuTree as Menu[]);
                    }
                },
                onError: (errors: any) => {
                    toast({
                        title: 'Error',
                        description: 'Failed to create menu. Please try again.',
                        variant: 'destructive',
                    });
                    console.error('Error creating menu:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        }
    };

    const flattenMenus = (items: Menu[]): Menu[] => {
        return items.reduce((acc: Menu[], menu) => {
            acc.push(menu);
            if (menu.children && menu.children.length > 0) {
                acc = [...acc, ...flattenMenus(menu.children)];
            }
            return acc;
        }, []);
    };

    const allMenus = flattenMenus(menus);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Menu Builder - ${platform.name}`} />

            <div className="my-4 flex items-center justify-between px-5">
                <Heading title={`Menu Builder: ${platform.name}`} className="mb-0" />
                <Button onClick={handleAddMenu}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Menu
                </Button>
            </div>

            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FolderTree className="mr-2 h-5 w-5" />
                            Menu Structure
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MenuTree
                            menus={menus}
                            onAddSubMenu={handleAddSubMenu}
                            onEditMenu={handleEditMenu}
                            onDeleteMenu={handleDeleteMenu}
                            isSubmitting={isSubmitting}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Combined Menu Dialog */}
            <MenuFormDialog
                isOpen={isMenuDialogOpen}
                onOpenChange={setIsMenuDialogOpen}
                isEdit={isEditMode}
                title={isEditMode ? 'Edit Menu' : 'Add New Menu'}
                description={
                    isEditMode
                        ? 'Update this menu item.'
                        : formData.parent_id
                          ? 'Create a new sub menu item.'
                          : 'Create a new menu item for this platform.'
                }
                initialData={formData}
                permissions={permissions}
                allMenus={allMenus}
                selectedMenu={selectedMenu}
                isSubmitting={isSubmitting}
                onCancel={() => setIsMenuDialogOpen(false)}
                onSubmit={(data) => handleFormSubmit(data, isEditMode)}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                title="Confirm Deletion"
                description={
                    <>
                        <p>Are you sure you want to delete this menu? This action cannot be undone.</p>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Note: Menus with sub-menus cannot be deleted. You must delete all sub-menus first.
                        </p>
                    </>
                }
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDeleteMenu}
                confirmButtonText="Delete"
                confirmButtonVariant="destructive"
            />
        </AppLayout>
    );
}

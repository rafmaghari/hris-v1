import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Permission } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    permissions: Permission[];
    filters: {
        filter?: {
            search?: string;
        };
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Permissions',
        href: route('permissions.index'),
    },
];

export default function Index({ permissions, filters }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
    const [search, setSearch] = useState('');
    const { url } = usePage();

    useEffect(() => {
        // Update search state when URL parameters change
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('filter[search]');
        if (searchParam) {
            setSearch(searchParam);
        }
    }, [url]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const params = search.trim() ? { 'filter[search]': search } : {};
        router.get(route('permissions.index'), params, { preserveState: true, preserveScroll: true });
    }

    function confirmDelete(permission: Permission) {
        setPermissionToDelete(permission);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (permissionToDelete) {
            router.delete(route('permissions.destroy', { permission: permissionToDelete.id }));
            setDialogOpen(false);
        }
    }

    const columns: ColumnDef<Permission>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'guard_name',
            header: 'Guard',
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const permission = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Link href={route('permissions.edit', { permission: permission.id })}>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(permission)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Permissions" className="mb-0" />
                <Link href={route('permissions.create')}>
                    <Button>Create Permission</Button>
                </Link>
            </div>

            <div className="p-6">
                <div className="mb-6 flex w-full items-center justify-end">
                    <form onSubmit={handleSearch}>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="Search permissions..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={permissions} />

                <ConfirmationDialog
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete the "${permissionToDelete?.name}" permission? This may affect roles that use this permission.`}
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onConfirm={handleDelete}
                    confirmButtonText="Delete"
                    confirmButtonVariant="destructive"
                />
            </div>
        </AppLayout>
    );
}

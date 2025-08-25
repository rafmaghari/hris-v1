import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    roles: Role[];
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
        title: 'Roles',
        href: route('roles.index'),
    },
];

export default function Index({ roles, filters }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
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
        router.get(route('roles.index'), params, { preserveState: true, preserveScroll: true });
    }

    function confirmDelete(role: Role) {
        setRoleToDelete(role);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (roleToDelete) {
            router.delete(route('roles.destroy', { role: roleToDelete.id }));
            setDialogOpen(false);
        }
    }

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'permissions',
            header: 'Permissions',
            cell: ({ row }) => {
                const permissions = row.original.permissions || [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission.id} variant="outline">
                                {permission.name}
                            </Badge>
                        ))}
                        {permissions.length > 3 && <Badge variant="outline">+{permissions.length - 3} more</Badge>}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Link href={route('roles.edit', { role: role.id })}>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(role)} disabled={role.name === 'admin'}>
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
            <Head title="Roles" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Roles" className="mb-0" />
                <Link href={route('roles.create')}>
                    <Button>Create Role</Button>
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
                                placeholder="Search roles..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={roles} />

                <ConfirmationDialog
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete the ${roleToDelete?.name} role? This action cannot be undone.`}
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

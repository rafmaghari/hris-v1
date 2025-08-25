import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    users: {
        data: User[];
        links: { url: string | null; label: string; active: boolean }[];
    };
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
        title: 'Users',
        href: route('users.index'),
    },
];

export default function Index({ users, filters }: Props) {
    const [search, setSearch] = useState('');
    const { url } = usePage();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const auth = usePage().props.auth as { user: User };

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
        router.get(route('users.index'), params, { preserveState: true, preserveScroll: true });
    }

    function confirmDelete(user: User) {
        setUserToDelete(user);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (userToDelete) {
            router.delete(route('users.destroy', { user: userToDelete.id }));
            setDialogOpen(false);
        }
    }

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'first_name',
            header: 'First Name',
        },
        {
            accessorKey: 'last_name',
            header: 'Last Name',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'manager',
            header: 'Manager',
            cell: ({ row }) => {
                const manager = row.original.manager;
                return manager ? manager.name : '-';
            },
        },
        {
            accessorKey: 'roles',
            header: 'Roles',
            cell: ({ row }) => {
                const roles = row.original.roles;
                return roles.length > 0 ? roles.map((role) => role.name).join(', ') : '-';
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const user = row.original;
                const isCurrentUser = auth.user.id === user.id;

                return (
                    <div className="flex justify-end gap-2">
                        <Link href={route('users.edit', { user: user.id })}>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => confirmDelete(user)}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? 'You cannot delete your own account' : 'Delete user'}
                        >
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
            <Head title="Users" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Users" className="mb-0" />
                <Link href={route('users.create')}>
                    <Button>Create User</Button>
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
                                placeholder="Search users..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={users.data} links={users.links} />

                <ConfirmationDialog
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete ${userToDelete?.first_name} ${userToDelete?.last_name}?`}
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

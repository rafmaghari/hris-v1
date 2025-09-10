import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type LeaveType = {
    id: number;
    name: string;
    description: string;
    status: number;
};

type Props = {
    leaveTypes: {
        data: LeaveType[];
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
        title: 'Leave Types',
        href: route('leave-types.index'),
    },
];

export default function Index({ leaveTypes, filters }: Props) {
    const [search, setSearch] = useState('');
    const { url } = usePage();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [leaveTypeToDelete, setLeaveTypeToDelete] = useState<LeaveType | null>(null);

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
        router.get(route('leave-types.index'), params, { preserveState: true, preserveScroll: true });
    }

    function confirmDelete(leaveType: LeaveType) {
        setLeaveTypeToDelete(leaveType);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (leaveTypeToDelete) {
            router.delete(route('leave-types.destroy', { leave_type: leaveTypeToDelete.id }));
            setDialogOpen(false);
        }
    }

    const columns: ColumnDef<LeaveType>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'description',
            header: 'Description',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const leaveType = row.original;
                return <Badge variant={leaveType.status === 2 ? 'secondary' : 'default'}>{leaveType.status === 2 ? 'Inactive' : 'Active'}</Badge>;
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const leaveType = row.original;

                return (
                    <div className="flex justify-end gap-2">
                        <Link href={route('leave-types.edit', { leave_type: leaveType.id })}>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(leaveType)} title="Delete leave type">
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
            <Head title="Leave Types" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Leave Types" className="mb-0" />
                <Link href={route('leave-types.create')}>
                    <Button>Add Leave Type</Button>
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
                                placeholder="Search leave types..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={leaveTypes.data} links={leaveTypes.links} />

                <ConfirmationDialog
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete ${leaveTypeToDelete?.name}?`}
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

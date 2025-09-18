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
import { format } from 'date-fns';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface LeaveRequest {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    user_leave_setting: {
        id: number;
        leave_settings_template: {
            id: number;
            name: string;
            leave_type: {
                id: number;
                name: string;
            };
        };
    };
    start_date: string;
    end_date: string;
    days_requested: number;
    reason: string;
    status: number;
    approver?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    approved_at?: string;
    remarks?: string;
    created_at: string;
}

interface Props {
    leaveRequests: {
        data: LeaveRequest[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        filter?: {
            search?: string;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Leave Requests',
        href: route('leave-requests.index'),
    },
];

export const getStatusColor = (status: number) => {
    switch (status) {
        case 1:
            return 'secondary'; // Pending
        case 2:
            return 'default'; // Approved
        case 3:
            return 'destructive'; // Rejected
        case 4:
            return 'outline'; // Cancelled
        default:
            return 'secondary';
    }
};

export const getStatusLabel = (status: number) => {
    switch (status) {
        case 1:
            return 'Pending';
        case 2:
            return 'Approved';
        case 3:
            return 'Rejected';
        case 4:
            return 'Cancelled';
        default:
            return 'Pending';
    }
};

export default function Index({ leaveRequests, filters }: Props) {
    const [search, setSearch] = useState('');
    const { url } = usePage();
    const auth = usePage().props.auth as { user: { id: number } };
    const [dialogOpen, setDialogOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<LeaveRequest | null>(null);

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
        router.get(route('leave-requests.index'), params, { preserveState: true, preserveScroll: true });
    }

    function confirmDelete(request: LeaveRequest) {
        setRequestToDelete(request);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (requestToDelete) {
            router.delete(route('leave-requests.destroy', requestToDelete.id), {
                onSuccess: () => {
                    toast.success('Leave request deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete leave request');
                },
            });
            setDialogOpen(false);
        }
    }

    const columns: ColumnDef<LeaveRequest>[] = [
        {
            accessorKey: 'user',
            header: 'Employee',
            cell: ({ row }) => {
                const user = row.original.user;
                return (
                    <div>
                        <div className="font-medium">
                            {user.first_name} {user.last_name}
                        </div>
                        <div className="text-muted-foreground text-sm">{user.email}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'user_leave_setting.leave_settings_template.leave_type.name',
            header: 'Leave Type',
            cell: ({ row }) => {
                return <Badge variant="secondary">{row.original.user_leave_setting.leave_settings_template.leave_type.name}</Badge>;
            },
        },
        {
            accessorKey: 'start_date',
            header: 'Start Date',
            cell: ({ row }) => {
                return format(new Date(row.original.start_date), 'MMM dd, yyyy');
            },
        },
        {
            accessorKey: 'end_date',
            header: 'End Date',
            cell: ({ row }) => {
                return format(new Date(row.original.end_date), 'MMM dd, yyyy');
            },
        },
        {
            accessorKey: 'days_requested',
            header: 'Days',
            cell: ({ row }) => {
                return <span className="font-medium">{row.original.days_requested} days</span>;
            },
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
            cell: ({ row }) => {
                const reason = row.original.reason;
                return (
                    <div className="max-w-[200px] truncate" title={reason}>
                        {reason}
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                return <Badge variant={getStatusColor(row.original.status)}>{getStatusLabel(row.original.status)}</Badge>;
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Requested',
            cell: ({ row }) => {
                return format(new Date(row.original.created_at), 'MMM dd, yyyy');
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const request = row.original;
                const canEdit = request.status === 1 && request.user.id === auth.user.id; // Pending and own request
                const canDelete = request.status === 1 && request.user.id === auth.user.id; // Pending and own request

                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('leave-requests.show', request.id)}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        {canEdit && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={route('leave-requests.edit', request.id)}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        {canDelete && (
                            <Button variant="ghost" size="sm" onClick={() => confirmDelete(request)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Requests" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Leave Requests" description="Manage employee leave requests and approvals" className="mb-0" />
                <Link href={route('leave-requests.create')}>
                    <Button>Request Leave</Button>
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
                                placeholder="Search employees, leave types, or reasons..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={leaveRequests.data} links={leaveRequests.links} />

                <ConfirmationDialog
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete this leave request?`}
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

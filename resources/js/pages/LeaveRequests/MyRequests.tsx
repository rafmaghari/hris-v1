import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Pencil } from 'lucide-react';
import { getStatusColor, getStatusLabel, LeaveRequest } from './Index';

interface Props {
    leaveRequests: {
        data: LeaveRequest[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'My Leave Requests',
        href: route('leave-requests.my-requests'),
    },
];

export default function MyRequests({ leaveRequests }: Props) {
    const auth = usePage().props.auth as { user: { id: number } };

    const columns: ColumnDef<LeaveRequest>[] = [
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
            accessorKey: 'approver',
            header: 'Approver',
            cell: ({ row }) => {
                const approver = row.original.approver;
                return approver ? `${approver.first_name} ${approver.last_name}` : '-';
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const request = row.original;
                const canEdit = request.status === 1; // Pending

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
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Leave Requests" />

            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="My Leave Requests" description="View and manage your leave requests" className="mb-0" />
                <Link href={route('leave-requests.create')}>
                    <Button>Request Leave</Button>
                </Link>
            </div>

            <div className="p-6">
                <DataTable columns={columns} data={leaveRequests.data} links={leaveRequests.links} />
            </div>
        </AppLayout>
    );
}

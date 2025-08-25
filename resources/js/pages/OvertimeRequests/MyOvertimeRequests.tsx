import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Pencil } from 'lucide-react';

interface OvertimeRequest {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    reason: string;
    total_hours: number;
    status: {
        value: number;
        label: string;
    };
    approver?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    approved_at?: string;
    approver_note?: string;
}

interface Props {
    overtimeRequests: {
        data: OvertimeRequest[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'My Overtime Requests',
        href: route('overtime-requests.my-requests'),
    },
];

export default function MyOvertimeRequests({ overtimeRequests }: Props) {
    const getStatusColor = (status: number) => {
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

    const columns: ColumnDef<OvertimeRequest>[] = [
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.date), 'MMM d, yyyy'),
        },
        {
            accessorKey: 'time',
            header: 'Time',
            cell: ({ row }) => (
                <span>
                    {row.original.start_time} - {row.original.end_time}
                </span>
            ),
        },
        {
            accessorKey: 'total_hours',
            header: 'Hours',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <Badge variant={getStatusColor(row.original.status.value)}>{row.original.status.label}</Badge>,
        },
        {
            accessorKey: 'approver',
            header: 'Approver',
            cell: ({ row }) => {
                if (!row.original.approver) return '-';
                return (
                    <div>
                        <div>
                            {row.original.approver.first_name} {row.original.approver.last_name}
                        </div>
                        {row.original.approved_at && (
                            <div className="text-sm text-gray-500">{format(new Date(row.original.approved_at), 'MMM d, yyyy')}</div>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const request = row.original;
                return (
                    <div className="flex space-x-2">
                        <Link href={route('overtime-requests.show', request.id)}>
                            <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </Link>
                        {request.status.value === 1 && (
                            <Link href={route('overtime-requests.edit', request.id)}>
                                <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Overtime Requests" />

            <div className="my-4 flex items-center justify-between px-5">
                <h1 className="text-2xl font-semibold">My Overtime Requests</h1>
                <Link href={route('overtime-requests.create')}>
                    <Button>Create Request</Button>
                </Link>
            </div>

            <div className="p-6">
                <DataTable columns={columns} data={overtimeRequests.data} links={overtimeRequests.links} />
            </div>
        </AppLayout>
    );
}

import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface OvertimeRequest {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
    };
    date: string;
    start_time: string;
    end_time: string;
    reason: string;
    total_hours: number;
    status: number;
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
        title: 'Overtime Requests',
        href: route('overtime-requests.index'),
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

export default function Index({ overtimeRequests, filters }: Props) {
    const [search, setSearch] = useState('');
    const { url } = usePage();
    const auth = usePage().props.auth as { user: { id: number } };

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
        router.get(route('overtime-requests.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    const columns: ColumnDef<OvertimeRequest>[] = [
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.date), 'MMM d, yyyy'),
        },
        {
            header: 'Employee',
            cell: ({ row }) => row.original.user.first_name + ' ' + row.original.user.last_name,
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
            cell: ({ row }) => <Badge variant={getStatusColor(row.original.status)}>{getStatusLabel(row.original.status)}</Badge>,
        },
        {
            accessorKey: 'approver',
            header: 'Approver',
            cell: ({ row }) => row.original.approver?.first_name + ' ' + row.original.approver?.last_name,
        },
        {
            header: 'Actions',
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
                        {request.status === 1 && request.user.id === auth.user.id && (
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
            <Head title="Overtime Requests" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Overtime Requests" className="mb-0" />
                <Link href={route('overtime-requests.create')}>
                    <Button>Create Request</Button>
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
                                placeholder="Search overtime requests..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={overtimeRequests.data} links={overtimeRequests.links} />
            </div>
        </AppLayout>
    );
}

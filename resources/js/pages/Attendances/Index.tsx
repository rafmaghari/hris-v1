import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { route } from 'ziggy-js';

interface Attendance {
    id: number;
    group: {
        name: string;
    };
    event: {
        name: string;
        event_date: string;
    };
    created_at: string;
}

interface Props {
    attendances: {
        data: Attendance[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Attendances',
        href: route('attendances.index'),
    },
];

export default function Index({ attendances }: Props) {
    const columns: ColumnDef<Attendance>[] = [
        {
            header: 'Group',
            accessorKey: 'group.name',
        },
        {
            header: 'Event',
            accessorKey: 'event.name',
        },
        {
            header: 'Event Date',
            accessorKey: 'event.event_date',
            cell: ({ row }) => format(new Date(row.original.event.event_date), 'MMM d, yyyy'),
        },
        {
            header: 'Recorded At',
            accessorKey: 'created_at',
            cell: ({ row }) => format(new Date(row.original.created_at), 'MMM d, yyyy h:mm a'),
        },
        {
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link href={route('attendances.show', { attendance: row.original.id })} className="text-sm text-blue-600 hover:text-blue-800">
                        View Details
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendances" />
            <div className="my-4 flex items-center justify-between px-5">
                <div>
                    <Heading title="Attendances" className="mb-0" />
                </div>
                <Link href={route('attendances.create')}>
                    <Button>Record Attendance</Button>
                </Link>
            </div>

            <div className="p-6">
                <Card>
                    <DataTable columns={columns} data={attendances.data} links={attendances.links} />
                </Card>
            </div>
        </AppLayout>
    );
}

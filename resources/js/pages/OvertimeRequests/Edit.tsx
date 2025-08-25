import { OvertimeRequestForm } from '@/components/overtime-requests/OvertimeRequestForm';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Props {
    overtimeRequest: {
        id: number;
        date: string;
        start_time: string;
        end_time: string;
        reason: string;
        total_hours: number;
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
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ overtimeRequest }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Overtime Request" />

            <div className="my-4 flex items-center justify-between px-6">
                <h1 className="text-2xl font-semibold">Edit Overtime Request</h1>
                <Link href={route('overtime-requests.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <OvertimeRequestForm mode="edit" overtimeRequest={overtimeRequest} />
            </div>
        </AppLayout>
    );
}

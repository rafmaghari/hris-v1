import { OvertimeRequestForm } from '@/components/overtime-requests/OvertimeRequestForm';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

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
        title: 'Create',
        href: '#',
    },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Overtime Request" />

            <div className="my-4 flex items-center justify-between px-6">
                <h1 className="text-2xl font-semibold">Create Overtime Request</h1>
                <Link href={route('overtime-requests.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <OvertimeRequestForm mode="create" />
            </div>
        </AppLayout>
    );
}

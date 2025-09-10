import Heading from '@/components/heading';
import LeaveTypeForm from '@/components/leave-types/LeaveTypeForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Leave Types',
        href: route('leave-types.index'),
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ leaveType }: any) {
    const { data, setData, put, processing, errors } = useForm({
        name: leaveType.name,
        description: leaveType.description,
        status: leaveType.status,
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('leave-types.update', leaveType.id), {
            onSuccess: () => {
                toast.itemUpdated(data.name, 'Leave Type');
            },
            onError: () => {
                toast.error('Failed to update leave type. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Leave Type" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Edit Leave Type" className="mb-0" />
                <Link href={route('leave-types.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <LeaveTypeForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Update Leave Type"
                    onSubmit={handleSubmit}
                    isEditMode={true}
                />
            </div>
        </AppLayout>
    );
}

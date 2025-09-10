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
        title: 'Create',
        href: route('leave-types.create'),
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        status: 1,
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('leave-types.store'), {
            onSuccess: () => {
                toast.itemCreated(data.name, 'Leave Type');
            },
            onError: () => {
                toast.error('Failed to create leave type. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Leave Type" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Create Leave Type" className="mb-0" />
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
                    submitButtonText="Create Leave Type"
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}

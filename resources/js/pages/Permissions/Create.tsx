import Heading from '@/components/heading';
import PermissionForm from '@/components/permissions/PermissionForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Permissions',
        href: route('permissions.index'),
    },
    {
        title: 'Create',
        href: route('permissions.create'),
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('permissions.store'), {
            onSuccess: () => {
                toast.itemCreated(data.name, 'Permission');
            },
            onError: () => {
                toast.error('Failed to create permission. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Permission" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Create Permission" className="mb-0" />
                <Link href={route('permissions.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <PermissionForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Create Permission"
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}

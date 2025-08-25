import Heading from '@/components/heading';
import PermissionForm from '@/components/permissions/PermissionForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Permission } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

type Props = {
    permission: Permission;
};

export default function Edit({ permission }: Props) {
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
            title: 'Edit',
            href: route('permissions.edit', { permission: permission.id }),
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: permission.name,
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('permissions.update', { permission: permission.id }), {
            onSuccess: () => {
                toast.success(`Permission "${data.name}" updated successfully`);
            },
            onError: () => {
                toast.error('Failed to update permission. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Permission: ${permission.name}`} />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title={`Edit Permission: ${permission.name}`} className="mb-0" />
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
                    submitButtonText="Update Permission"
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}

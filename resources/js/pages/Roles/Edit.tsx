import Heading from '@/components/heading';
import RoleForm from '@/components/roles/RoleForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Permission, Role } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

type Props = {
    role: Role;
    permissions: Permission[];
};

type RoleFormData = {
    name: string;
    permissions: number[];
};

export default function Edit({ role, permissions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Roles',
            href: route('roles.index'),
        },
        {
            title: 'Edit',
            href: route('roles.edit', { role: role.id }),
        },
    ];

    const { data, setData, put, processing, errors } = useForm<RoleFormData>({
        name: role.name,
        permissions: role.permissions ? role.permissions.map((p) => p.id) : [],
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('roles.update', { role: role.id }), {
            onSuccess: () => {
                toast.success(`Role "${data.name}" updated successfully`);
            },
            onError: () => {
                toast.error('Failed to update role. Please try again.');
            },
        });
    }

    const setFormData = (field: string, value: any) => {
        setData(field as keyof RoleFormData, value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role: ${role.name}`} />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title={`Edit Role: ${role.name}`} className="mb-0" />
                <Link href={route('roles.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <RoleForm
                    data={data}
                    setData={setFormData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Update Role"
                    onSubmit={handleSubmit}
                    permissions={permissions}
                />
            </div>
        </AppLayout>
    );
}

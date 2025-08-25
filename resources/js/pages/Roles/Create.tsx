import Heading from '@/components/heading';
import RoleForm from '@/components/roles/RoleForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Permission } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

type Props = {
    permissions: Permission[];
};

type RoleFormData = {
    name: string;
    permissions: number[];
};

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
        title: 'Create',
        href: route('roles.create'),
    },
];

export default function Create({ permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm<RoleFormData>({
        name: '',
        permissions: [],
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('roles.store'), {
            onSuccess: () => {
                toast.itemCreated(data.name, 'Role');
            },
            onError: () => {
                toast.error('Failed to create role. Please try again.');
            },
        });
    }

    const setFormData = (field: string, value: any) => {
        setData(field as keyof RoleFormData, value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Create Role" className="mb-0" />
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
                    submitButtonText="Create Role"
                    onSubmit={handleSubmit}
                    permissions={permissions}
                />
            </div>
        </AppLayout>
    );
}

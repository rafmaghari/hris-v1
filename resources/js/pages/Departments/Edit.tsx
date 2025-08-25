import DepartmentForm from '@/components/departments/DepartmentForm';
import Heading from '@/components/heading';
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
        title: 'Departments',
        href: route('departments.index'),
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ department }: any) {
    const { data, setData, put, processing, errors } = useForm({
        name: department.name,
        description: department.description,
        status: department.status,
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('departments.update', department.id), {
            onSuccess: () => {
                toast.itemUpdated(data.name, 'Department');
            },
            onError: () => {
                toast.error('Failed to update department. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Department" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Edit Department" className="mb-0" />
                <Link href={route('departments.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <DepartmentForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Update Department"
                    onSubmit={handleSubmit}
                    isEditMode={true}
                />
            </div>
        </AppLayout>
    );
}

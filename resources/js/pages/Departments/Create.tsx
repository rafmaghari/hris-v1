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
        title: 'Create',
        href: route('departments.create'),
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
        post(route('departments.store'), {
            onSuccess: () => {
                toast.itemCreated(data.name, 'Department');
            },
            onError: () => {
                toast.error('Failed to create department. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Department" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Create Department" className="mb-0" />
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
                    submitButtonText="Create Department"
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}

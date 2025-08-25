import Heading from '@/components/heading';
import PositionForm from '@/components/positions/PositionForm';
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
        title: 'Positions',
        href: route('positions.index'),
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ position }: any) {
    const { data, setData, put, processing, errors } = useForm({
        name: position.name,
        description: position.description,
        status: position.status,
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('positions.update', position.id), {
            onSuccess: () => {
                toast.itemUpdated(data.name, 'Position');
            },
            onError: () => {
                toast.error('Failed to update position. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Position" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Edit Position" className="mb-0" />
                <Link href={route('positions.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <PositionForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Update Position"
                    onSubmit={handleSubmit}
                    isEditMode={true}
                />
            </div>
        </AppLayout>
    );
}

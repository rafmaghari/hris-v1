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
        title: 'Create',
        href: route('positions.create'),
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
        post(route('positions.store'), {
            onSuccess: () => {
                toast.itemCreated(data.name, 'Position');
            },
            onError: () => {
                toast.error('Failed to create position. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Position" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Create Position" className="mb-0" />
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
                    submitButtonText="Create Position"
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}

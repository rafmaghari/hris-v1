import GroupForm from '@/components/groups/GroupForm';
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
        title: 'Groups',
        href: route('groups.index'),
    },
    {
        title: 'Create',
        href: route('groups.create'),
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
        post(route('groups.store'), {
            onSuccess: () => {
                toast.itemCreated(data.name, 'Group');
            },
            onError: () => {
                toast.error('Failed to create group. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Group" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Create Group" className="mb-0" />
                <Link href={route('groups.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <GroupForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Create Group"
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}

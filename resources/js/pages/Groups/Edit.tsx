import GroupForm from '@/components/groups/GroupForm';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Props = {
    group: {
        id: number;
        name: string;
        description: string;
        status: number;
    };
};

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
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ group }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: group.name,
        description: group.description,
        status: group.status,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('groups.update', { group: group.id }));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Group" />

            <div className="my-4 px-5">
                <Heading title="Edit Group" />
            </div>

            <div className="p-6">
                <GroupForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Update Group"
                    onSubmit={handleSubmit}
                    isEditMode
                />
            </div>
        </AppLayout>
    );
}

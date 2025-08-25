import { Button } from '@/components/ui/button';
import UserForm from '@/components/users/UserForm';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Users',
        href: route('users.index'),
    },
    {
        title: 'Create',
        href: route('users.create'),
    },
];

interface Props {
    positions: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    managers: Array<{ id: number; name: string }>;
    employmentTypes: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
    roles: Array<{ id: number; name: string }>;
}

export default function Create({ positions, departments, managers, employmentTypes, statuses, roles }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />

            <div className="my-4 flex items-center justify-between px-6">
                <h1 className="text-2xl font-semibold">Create User</h1>
                <Link href={route('users.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <UserForm
                    positions={positions}
                    departments={departments}
                    managers={managers}
                    employmentTypes={employmentTypes}
                    statuses={statuses}
                    roles={roles}
                />
            </div>
        </AppLayout>
    );
}

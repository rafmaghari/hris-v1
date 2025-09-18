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
        title: 'Edit',
        href: '#',
    },
];

interface Props {
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        position_id: number | null;
        department_id: number | null;
        manager_id: number | null;
        date_hired: string | null;
        employment_type: string | null;
        status: number;
        end_at: string | null;
        roles: number[];
    };
    positions: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    managers: Array<{ id: number; name: string }>;
    employmentTypes: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
    roles: Array<{ id: number; name: string }>;
}

export default function Edit({ user, positions, departments, managers, employmentTypes, statuses, roles }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.first_name} ${user.last_name}`} />

            <div className="my-4 flex items-center justify-between px-6">
                <h1 className="text-2xl font-semibold">
                    Edit {user.first_name} {user.last_name}
                </h1>
                <Link href={route('users.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <UserForm
                    user={user}
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

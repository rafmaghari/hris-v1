import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import { Head, Link } from '@inertiajs/react';

type Props = {
    role: Role;
};

export default function Show({ role }: Props) {
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
            title: role.name,
            href: route('roles.show', { role: role.id }),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Role: ${role.name}`} />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title={`Role: ${role.name}`} className="mb-0" />
                <div className="flex space-x-2">
                    <Link href={route('roles.edit', { role: role.id })}>
                        <Button>Edit Role</Button>
                    </Link>
                    <Link href={route('roles.index')}>
                        <Button variant="outline">Back to Roles</Button>
                    </Link>
                </div>
            </div>

            <div className="p-6">
                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Role Details</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Information about the role and its permissions.</p>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{role.name}</dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Guard Name</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{role.guard_name}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Permissions</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                    <div className="flex flex-wrap gap-2">
                                        {role.permissions && role.permissions.length > 0 ? (
                                            role.permissions.map((permission) => (
                                                <Badge key={permission.id} variant="secondary">
                                                    {permission.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-gray-500">No permissions assigned</span>
                                        )}
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

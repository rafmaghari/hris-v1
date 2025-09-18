import { LeaveRequestForm } from '@/components/leave-requests/LeaveRequestForm';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface UserLeaveSetting {
    id: number;
    leave_settings_template: {
        id: number;
        name: string;
        leave_type: {
            id: number;
            name: string;
        };
    };
    current_balance: number;
    max_cap: number;
}

interface Props {
    userLeaveSettings: UserLeaveSetting[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Leave Requests',
        href: route('leave-requests.index'),
    },
    {
        title: 'Create',
        href: '#',
    },
];

export default function Create({ userLeaveSettings }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Request Leave" />

            <div className="my-4 flex items-center justify-between px-6">
                <h1 className="text-2xl font-semibold">Request Leave</h1>
                <Link href={route('leave-requests.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                {userLeaveSettings.length === 0 ? (
                    <div className="mx-auto max-w-2xl">
                        <div className="rounded-md bg-yellow-50 p-6 text-center">
                            <h3 className="mb-2 text-lg font-medium text-yellow-900">No Leave Settings Available</h3>
                            <p className="mb-4 text-yellow-700">
                                You don't have any leave settings configured. Please contact your administrator to set up your leave entitlements
                                before requesting leave.
                            </p>
                            <Link href={route('leave-requests.index')}>
                                <Button variant="outline">Back to Leave Requests</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <LeaveRequestForm mode="create" userLeaveSettings={userLeaveSettings} />
                )}
            </div>
        </AppLayout>
    );
}

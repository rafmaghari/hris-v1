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
    leaveRequest: {
        id: number;
        user_leave_setting_id: number;
        start_date: string;
        end_date: string;
        days_requested: number;
        reason: string;
    };
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
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ leaveRequest, userLeaveSettings }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Leave Request" />

            <div className="my-4 flex items-center justify-between px-6">
                <h1 className="text-2xl font-semibold">Edit Leave Request</h1>
                <Link href={route('leave-requests.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <LeaveRequestForm mode="edit" leaveRequest={leaveRequest} userLeaveSettings={userLeaveSettings} />
            </div>
        </AppLayout>
    );
}

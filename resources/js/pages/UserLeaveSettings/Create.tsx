import { Button } from '@/components/ui/button';
import UserLeaveSettingForm from '@/components/user-leave-settings/UserLeaveSettingForm';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface LeaveType {
    id: number;
    name: string;
}

interface LeaveSettingsTemplate {
    id: number;
    name: string;
    leave_type_id: number;
    leave_type: LeaveType;
    accrual_type: number;
    fixed_days: number | null;
    accrual_frequency: number | null;
    accrual_amount: number | null;
    max_cap: number | null;
    allow_carry_over: boolean;
    max_carry_over: number | null;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface AccrualOption {
    value: number;
    label: string;
}

interface Props {
    users: User[];
    leaveSettingsTemplates: LeaveSettingsTemplate[];
    accrualTypes: AccrualOption[];
    accrualFrequencies: AccrualOption[];
}

export default function Create({ users, leaveSettingsTemplates, accrualTypes, accrualFrequencies }: Props) {
    return (
        <AdminLayout>
            <Head title="Create User Leave Setting" />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('user-leave-settings.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Create User Leave Setting</h1>
                        <p className="text-muted-foreground">Assign a leave settings template to a user</p>
                    </div>
                </div>

                <UserLeaveSettingForm
                    users={users}
                    leaveSettingsTemplates={leaveSettingsTemplates}
                    accrualTypes={accrualTypes}
                    accrualFrequencies={accrualFrequencies}
                />
            </div>
        </AdminLayout>
    );
}

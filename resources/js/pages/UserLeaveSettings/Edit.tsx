import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserLeaveSettingForm from '@/components/user-leave-settings/UserLeaveSettingForm';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Settings, TrendingDown, TrendingUp } from 'lucide-react';

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

interface UserLeaveSetting {
    id: number;
    user_id: number;
    leave_settings_template_id: number;
    start_date: string;
    end_date: string | null;
    accrual_type: number;
    accrual_frequency: number | null;
    accrual_amount: number | null;
    max_cap: number;
    allow_carry_over: boolean;
    max_carry_over: number;
    current_balance: number;
    carried_over: number;
    allow_custom_settings: boolean;
    user: User;
    leave_settings_template: LeaveSettingsTemplate;
}

interface AccrualLog {
    id: number;
    user_leave_setting_id: number;
    user_id: number;
    type: string;
    amount: number;
    balance_before: number;
    balance_after: number;
    description: string;
    metadata: any;
    accrual_date: string;
    processed_at: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedAccrualLogs {
    data: AccrualLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface AccrualOption {
    value: number;
    label: string;
}

interface Props {
    userLeaveSetting: UserLeaveSetting;
    users: User[];
    leaveSettingsTemplates: LeaveSettingsTemplate[];
    accrualTypes: AccrualOption[];
    accrualFrequencies: AccrualOption[];
    accrualLogs: PaginatedAccrualLogs;
}

function getLogTypeIcon(type: string) {
    switch (type) {
        case 'accrual':
            return <TrendingUp className="h-4 w-4 text-green-600" />;
        case 'deduction':
            return <TrendingDown className="h-4 w-4 text-red-600" />;
        case 'carry_over':
            return <RotateCcw className="h-4 w-4 text-blue-600" />;
        case 'adjustment':
            return <Settings className="h-4 w-4 text-orange-600" />;
        default:
            return <Settings className="h-4 w-4 text-gray-600" />;
    }
}

function getLogTypeBadge(type: string) {
    switch (type) {
        case 'accrual':
            return (
                <Badge variant="default" className="bg-green-100 text-green-800">
                    Accrual
                </Badge>
            );
        case 'deduction':
            return <Badge variant="destructive">Deduction</Badge>;
        case 'carry_over':
            return (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Carry Over
                </Badge>
            );
        case 'adjustment':
            return (
                <Badge variant="default" className="bg-orange-100 text-orange-800">
                    Adjustment
                </Badge>
            );
        default:
            return <Badge variant="secondary">{type}</Badge>;
    }
}

export default function Edit({ userLeaveSetting, users, leaveSettingsTemplates, accrualTypes, accrualFrequencies, accrualLogs }: Props) {
    return (
        <AdminLayout>
            <Head title={`Edit User Leave Setting - ${userLeaveSetting.user.first_name} ${userLeaveSetting.user.last_name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('user-leave-settings.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Edit User Leave Setting</h1>
                        <p className="text-muted-foreground">
                            Update leave setting for {userLeaveSetting.user.first_name} {userLeaveSetting.user.last_name}
                        </p>
                    </div>
                </div>

                <UserLeaveSettingForm
                    userLeaveSetting={userLeaveSetting}
                    users={users}
                    leaveSettingsTemplates={leaveSettingsTemplates}
                    accrualTypes={accrualTypes}
                    accrualFrequencies={accrualFrequencies}
                    isEditing={true}
                />

                {/* Accrual Logs Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Leave Balance Movement History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {accrualLogs.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Balance Before</TableHead>
                                            <TableHead>Balance After</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Processed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accrualLogs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    <div className="font-medium">{new Date(log.accrual_date).toLocaleDateString()}</div>
                                                    <div className="text-muted-foreground text-sm">
                                                        {new Date(log.accrual_date).toLocaleTimeString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getLogTypeIcon(log.type)}
                                                        {getLogTypeBadge(log.type)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`font-medium ${
                                                            log.type === 'accrual' || log.type === 'carry_over'
                                                                ? 'text-green-600'
                                                                : log.type === 'deduction'
                                                                  ? 'text-red-600'
                                                                  : 'text-orange-600'
                                                        }`}
                                                    >
                                                        {log.type === 'accrual' || log.type === 'carry_over'
                                                            ? '+'
                                                            : log.type === 'deduction'
                                                              ? '-'
                                                              : ''}
                                                        {Math.abs(log.amount)} days
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{log.balance_before} days</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium text-green-600">{log.balance_after} days</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{log.description}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-muted-foreground text-sm">
                                                        {new Date(log.processed_at).toLocaleDateString()}
                                                        <br />
                                                        {new Date(log.processed_at).toLocaleTimeString()}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination info */}
                                {accrualLogs.last_page > 1 && (
                                    <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
                                        <div>
                                            Showing {accrualLogs.from} to {accrualLogs.to} of {accrualLogs.total} entries
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {accrualLogs.current_page > 1 && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link
                                                        href={route('user-leave-settings.edit', {
                                                            id: userLeaveSetting.id,
                                                            page: accrualLogs.current_page - 1,
                                                        })}
                                                    >
                                                        Previous
                                                    </Link>
                                                </Button>
                                            )}
                                            <span>
                                                Page {accrualLogs.current_page} of {accrualLogs.last_page}
                                            </span>
                                            {accrualLogs.current_page < accrualLogs.last_page && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link
                                                        href={route('user-leave-settings.edit', {
                                                            id: userLeaveSetting.id,
                                                            page: accrualLogs.current_page + 1,
                                                        })}
                                                    >
                                                        Next
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-8 text-center">
                                <TrendingUp className="text-muted-foreground mx-auto h-12 w-12" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No movement history</h3>
                                <p className="text-muted-foreground mt-1 text-sm">No accrual logs found for this leave setting yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

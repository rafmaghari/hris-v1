import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, RotateCcw, Settings, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface LeaveType {
    id: number;
    name: string;
}

interface LeaveSettingsTemplate {
    id: number;
    name: string;
    leave_type: LeaveType;
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
    created_at: string;
    updated_at: string;
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

interface Props {
    userLeaveSetting: UserLeaveSetting;
    accrualLogs: PaginatedAccrualLogs;
}

function getAccrualTypeLabel(type: number): string {
    switch (type) {
        case 1:
            return 'Fixed';
        case 2:
            return 'Accrual';
        default:
            return 'Unknown';
    }
}

function getAccrualFrequencyLabel(frequency: number | null): string {
    if (!frequency) return 'N/A';
    switch (frequency) {
        case 1:
            return 'Monthly';
        case 2:
            return 'Quarterly';
        case 3:
            return 'Yearly';
        case 4:
            return 'Bimonthly';
        case 5:
            return 'Per Minute (Testing)';
        default:
            return 'Unknown';
    }
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

function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this user leave setting?')) {
        router.delete(route('user-leave-settings.destroy', id), {
            onSuccess: () => {
                toast.success('User leave setting deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete user leave setting');
            },
        });
    }
}

export default function Show({ userLeaveSetting, accrualLogs }: Props) {
    return (
        <AdminLayout>
            <Head title={`User Leave Setting - ${userLeaveSetting.user.first_name} ${userLeaveSetting.user.last_name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('user-leave-settings.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">User Leave Setting Details</h1>
                            <p className="text-muted-foreground">
                                Leave setting for{' '}
                                <span className="font-bold">
                                    {userLeaveSetting.user.first_name} {userLeaveSetting.user.last_name}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('user-leave-settings.edit', userLeaveSetting.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(userLeaveSetting.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Name</p>
                                <p className="text-lg font-medium">
                                    {userLeaveSetting.user.first_name} {userLeaveSetting.user.last_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Email</p>
                                <p>{userLeaveSetting.user.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Template Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Template Name</p>
                                <p className="text-lg font-medium">{userLeaveSetting.leave_settings_template.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Leave Type</p>
                                <Badge variant="secondary">{userLeaveSetting.leave_settings_template.leave_type.name}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Period Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Start Date</p>
                                <p>{new Date(userLeaveSetting.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">End Date</p>
                                <p>{userLeaveSetting.end_date ? new Date(userLeaveSetting.end_date).toLocaleDateString() : 'Ongoing'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Accrual Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Accrual Type</p>
                                <Badge variant="outline">{getAccrualTypeLabel(userLeaveSetting.accrual_type)}</Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Accrual Frequency</p>
                                <Badge variant="outline">{getAccrualFrequencyLabel(userLeaveSetting.accrual_frequency)}</Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Accrual Amount</p>
                                <p>{userLeaveSetting.accrual_amount ? `${userLeaveSetting.accrual_amount} days` : 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Current Balance</p>
                                <p className="text-2xl font-bold text-green-600">{userLeaveSetting.current_balance} days</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Carried Over</p>
                                <p className="text-lg font-medium">{userLeaveSetting.carried_over} days</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Limits & Carry Over</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Maximum Cap</p>
                                <p className="text-lg font-medium">{userLeaveSetting.max_cap} days</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Allow Carry Over</p>
                                <Badge variant={userLeaveSetting.allow_carry_over ? 'default' : 'secondary'}>
                                    {userLeaveSetting.allow_carry_over ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Max Carry Over</p>
                                <p>{userLeaveSetting.max_carry_over} days</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

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
                                                        href={route('user-leave-settings.show', {
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
                                                        href={route('user-leave-settings.show', {
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

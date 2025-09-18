import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head } from '@inertiajs/react';
import { CalendarIcon, ClockIcon, FileTextIcon, TrendingUpIcon } from 'lucide-react';

interface GroupStat {
    group_id: number;
    group_name: string;
    total_members: number;
    present_count: number;
    absent_count: number;
}

interface EventStat {
    id: number;
    name: string;
    event_date: string;
    total_attendees: number;
    present_count: number;
    absent_count: number;
    groups: GroupStat[];
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface LeaveType {
    id: number;
    name: string;
}

interface LeaveSettingsTemplate {
    leave_type: LeaveType;
}

interface UserLeaveSetting {
    leave_settings_template: LeaveSettingsTemplate;
}

interface LeaveRequest {
    id: number;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: number;
    reason: string;
    user: User;
    user_leave_setting: UserLeaveSetting;
    approver?: User;
    created_at: string;
}

interface OvertimeRequest {
    id: number;
    date: string;
    start_time?: string;
    end_time?: string;
    total_hours: number;
    reason: string;
    status: number;
    user: User;
    approver?: User;
    created_at: string;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface OvertimeStats extends Stats {
    total_hours: number;
}

interface ViewScope {
    type: 'admin' | 'manager' | 'user';
    description: string;
    userCount: number | null;
}

interface DashboardProps extends SharedData {
    eventStats: EventStat[];
    leaveRequests: LeaveRequest[];
    overtimeRequests: OvertimeRequest[];
    leaveStats: Stats;
    overtimeStats: OvertimeStats;
    currentMonth: string;
    viewScope: ViewScope;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

function getStatusBadge(status: number) {
    const statusConfig = {
        1: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
        2: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Approved' },
        3: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Rejected' },
        4: { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[1];

    return <Badge className={config.color}>{config.label}</Badge>;
}

function getViewScopeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (type) {
        case 'admin':
            return 'default';
        case 'manager':
            return 'secondary';
        case 'user':
        default:
            return 'outline';
    }
}

function getViewScopeBadgeText(type: string): string {
    switch (type) {
        case 'admin':
            return '👑 Admin View';
        case 'manager':
            return '👥 Manager View';
        case 'user':
        default:
            return '👤 Personal View';
    }
}

function StatCard({
    title,
    total,
    pending,
    approved,
    rejected,
    extra,
    icon,
}: {
    title: string;
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    extra?: string;
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{total}</div>
                {extra && <p className="text-muted-foreground mt-1 text-xs">{extra}</p>}
                <div className="mt-3 flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span>{pending} Pending</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>{approved} Approved</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span>{rejected} Rejected</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ leaveRequests, overtimeRequests, leaveStats, overtimeStats, currentMonth, viewScope }: DashboardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeString?: string) => {
        if (!timeString) return 'N/A';
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard - {currentMonth}</h1>
                    <div className="mt-1 flex items-center gap-2">
                        <p className="text-gray-600">Overview of leave requests and overtime for this month</p>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-2">
                            <Badge variant={getViewScopeBadgeVariant(viewScope?.type)} className="text-xs">
                                {getViewScopeBadgeText(viewScope?.type)}
                            </Badge>
                            <span className="text-sm text-gray-500">{viewScope?.description}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <StatCard
                        title="Leave Requests"
                        total={leaveStats?.total}
                        pending={leaveStats?.pending}
                        approved={leaveStats?.approved}
                        rejected={leaveStats?.rejected}
                        icon={<CalendarIcon className="text-muted-foreground h-4 w-4" />}
                    />
                    <StatCard
                        title="Overtime Requests"
                        total={overtimeStats?.total}
                        pending={overtimeStats?.pending}
                        approved={overtimeStats?.approved}
                        rejected={overtimeStats?.rejected}
                        extra={`${overtimeStats?.total_hours} hours approved`}
                        icon={<ClockIcon className="text-muted-foreground h-4 w-4" />}
                    />
                </div>

                {/* Leave Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileTextIcon className="h-5 w-5" />
                            Recent Leave Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leaveRequests?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reason</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{`${request.user.first_name} ${request.user.last_name}`}</TableCell>
                                            <TableCell>{request.user_leave_setting.leave_settings_template.leave_type.name}</TableCell>
                                            <TableCell>{formatDate(request.start_date)}</TableCell>
                                            <TableCell>{formatDate(request.end_date)}</TableCell>
                                            <TableCell>{request.days_requested}</TableCell>
                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                <p>No leave requests found for this month</p>
                                {viewScope?.type !== 'admin' && (
                                    <p className="mt-1 text-sm text-gray-400">
                                        {viewScope?.type === 'manager' ? 'showing data for your team only' : 'showing your personal data only'}
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Overtime Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUpIcon className="h-5 w-5" />
                            Recent Overtime Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {overtimeRequests?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>End Time</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reason</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {overtimeRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{`${request.user.first_name} ${request.user.last_name}`}</TableCell>
                                            <TableCell>{formatDate(request.date)}</TableCell>
                                            <TableCell>{formatTime(request.start_time)}</TableCell>
                                            <TableCell>{formatTime(request.end_time)}</TableCell>
                                            <TableCell>{request.total_hours} hrs</TableCell>
                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                <p>No overtime requests found for this month</p>
                                {viewScope?.type !== 'admin' && (
                                    <p className="mt-1 text-sm text-gray-400">
                                        {viewScope?.type === 'manager' ? 'showing data for your team only' : 'showing your personal data only'}
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

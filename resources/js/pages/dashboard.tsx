import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

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

interface DashboardProps extends SharedData {
    eventStats: EventStat[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

function AttendanceStats({ label, count, total, colorClass }: { label: string; count: number; total: number; colorClass?: string }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="text-center">
            <p className={`text-2xl font-bold ${colorClass}`}>{count}</p>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xs text-gray-400">{percentage}%</p>
        </div>
    );
}

export default function Dashboard() {
    const { auth, eventStats } = usePage<DashboardProps>().props;
    const { user } = auth;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Event Attendance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="space-y-4"></Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

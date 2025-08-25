import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Member {
    id: number;
    first_name: string;
    last_name: string;
}

interface AttendanceRecord {
    id: number;
    member: Member;
    status: number;
    notes: string | null;
}

interface Attendance {
    id: number;
    group: {
        name: string;
    };
    event: {
        name: string;
        event_date: string;
    };
    records: AttendanceRecord[];
    notes: string | null;
    created_at: string;
}

interface Props {
    attendance: Attendance;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Attendances',
        href: route('attendances.index'),
    },
    {
        title: 'Details',
        href: '#',
    },
];

export default function Show({ attendance }: Props) {
    const [records, setRecords] = useState(attendance.records);
    const { toast } = useToast();

    const toggleStatus = async (recordId: number, currentStatus: number) => {
        try {
            const newStatus = currentStatus === 1 ? 2 : 1;
            await axios.patch(route('attendance-records.update', recordId), {
                status: newStatus,
            });

            setRecords(records.map((record) => (record.id === recordId ? { ...record, status: newStatus } : record)));

            toast({
                title: 'Success',
                description: 'Attendance status updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update attendance status',
                variant: 'destructive',
            });
        }
    };

    const renderAttendanceRecord = (record: AttendanceRecord) => (
        <div key={record.id} className="flex items-center justify-between rounded bg-gray-50 p-2">
            <span className="text-sm">
                {record.member.first_name} {record.member.last_name}
            </span>
            <div className="flex items-center gap-x-4 gap-y-2">
                <span className={`text-sm font-medium ${record.status === 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {record.status === 1 ? 'Present' : 'Absent'}
                </span>
                <Button variant="outline" size="sm" onClick={() => toggleStatus(record.id, record.status)} className="h-6 px-2">
                    Toggle Status
                </Button>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Details" />
            <div className="my-4 flex items-center justify-between px-5">
                <div>
                    <Heading title="Attendance Details" className="mb-0" />
                </div>
                <Link href={route('attendances.index')}>
                    <Button variant="outline">Back to List</Button>
                </Link>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    <Card className="p-4">
                        <h2 className="text-lg font-semibold">Event Information</h2>
                        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <dt className="text-sm font-semibold text-gray-500">Group</dt>
                                <dd className="text-sm text-gray-900">{attendance.group.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-gray-500">Event</dt>
                                <dd className="text-sm text-gray-900">{attendance.event.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-gray-500">Event Date</dt>
                                <dd className="text-sm text-gray-900">{format(new Date(attendance.event.event_date), 'MMMM d, yyyy')}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-gray-500">Recorded At</dt>
                                <dd className="text-sm text-gray-900">{format(new Date(attendance.created_at), 'MMMM d, yyyy h:mm a')}</dd>
                            </div>
                            {attendance.notes && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                    <dd className="text-sm text-gray-900">{attendance.notes}</dd>
                                </div>
                            )}
                        </dl>
                    </Card>

                    <Card className="p-6">
                        <h2 className="mb-4 text-lg font-semibold">Attendance Records</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between px-2 text-sm font-medium text-gray-500">
                                        <span>Member</span>
                                        <span>Status</span>
                                    </div>
                                    <div className="space-y-2">{records.slice(0, Math.ceil(records.length / 2)).map(renderAttendanceRecord)}</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between px-2 text-sm font-medium text-gray-500">
                                        <span>Member</span>
                                        <span>Status</span>
                                    </div>
                                    <div className="space-y-2">{records.slice(Math.ceil(records.length / 2)).map(renderAttendanceRecord)}</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

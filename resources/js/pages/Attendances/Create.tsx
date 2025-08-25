import AttendanceForm from '@/components/attendances/AttendanceForm';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface SelectOption {
    value: string;
    label: string;
}

interface Props {
    groups: SelectOption[];
    events: SelectOption[];
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
        title: 'Record',
        href: route('attendances.create'),
    },
];

export default function Create({ groups, events }: Props) {
    const form = useForm({
        group_id: '',
        event_id: '',
        members: [],
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('attendances.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Attendance" />
            <div className="my-4 flex items-center justify-between px-5">
                <div>
                    <Heading title="Record Attendance" className="mb-0" />
                </div>
                <Link href={route('attendances.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <AttendanceForm
                    data={form.data}
                    setData={form.setData}
                    errors={form.errors}
                    processing={form.processing}
                    onSubmit={handleSubmit}
                    groups={groups}
                    events={events}
                />
            </div>
        </AppLayout>
    );
}

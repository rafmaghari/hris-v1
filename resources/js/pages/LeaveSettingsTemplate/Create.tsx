import Heading from '@/components/heading';
import LeaveSettingsTemplateForm from '@/components/leave-settings-templates/LeaveSettingsTemplateForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

type LeaveType = {
    id: number;
    name: string;
    description: string;
    status: string;
};

type AccrualTypeOption = {
    value: number;
    label: string;
};

type AccrualFrequencyOption = {
    value: number;
    label: string;
};

type StatusOption = {
    value: number;
    label: string;
};

type Props = {
    leaveTypes: LeaveType[];
    accrualTypes: AccrualTypeOption[];
    accrualFrequencies: AccrualFrequencyOption[];
    statusOptions: StatusOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Leave Settings Templates',
        href: route('leave-settings-templates.index'),
    },
    {
        title: 'Create',
        href: route('leave-settings-templates.create'),
    },
];

export default function Create({ leaveTypes, accrualTypes, accrualFrequencies, statusOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        leave_type_id: '' as number | '',
        accrual_type: '' as number | '',
        fixed_days: '' as number | '',
        accrual_frequency: '' as number | '',
        accrual_amount: '' as number | '',
        max_cap: '' as number | '',
        allow_carry_over: false,
        max_carry_over: '' as number | '',
        status: 1 as number | '',
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('leave-settings-templates.store'), {
            onSuccess: () => {
                toast.itemCreated(data.name, 'Leave Settings Template');
            },
            onError: () => {
                toast.error('Failed to create leave settings template. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Leave Settings Template" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Create Leave Settings Template" className="mb-0" />
                <Link href={route('leave-settings-templates.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <LeaveSettingsTemplateForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Create Leave Settings Template"
                    onSubmit={handleSubmit}
                    leaveTypes={leaveTypes}
                    accrualTypes={accrualTypes}
                    accrualFrequencies={accrualFrequencies}
                    statusOptions={statusOptions}
                />
            </div>
        </AppLayout>
    );
}

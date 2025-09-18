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

type LeaveSettingsTemplate = {
    id: number;
    name: string;
    leave_type_id: number;
    accrual_type: number;
    fixed_days: number | null;
    accrual_frequency: number | null;
    accrual_amount: number | null;
    max_cap: number | null;
    allow_carry_over: boolean;
    max_carry_over: number | null;
    status: number;
    leave_type: LeaveType;
};

type Props = {
    template: LeaveSettingsTemplate;
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
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ template, leaveTypes, accrualTypes, accrualFrequencies, statusOptions }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: template.name,
        leave_type_id: template.leave_type_id,
        accrual_type: template.accrual_type,
        fixed_days: template.fixed_days || ('' as number | ''),
        accrual_frequency: template.accrual_frequency || ('' as number | ''),
        accrual_amount: template.accrual_amount || ('' as number | ''),
        max_cap: template.max_cap || ('' as number | ''),
        allow_carry_over: template.allow_carry_over,
        max_carry_over: template.max_carry_over || ('' as number | ''),
        status: template.status,
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('leave-settings-templates.update', template.id), {
            onSuccess: () => {
                toast.itemUpdated(data.name, 'Leave Settings Template');
            },
            onError: () => {
                toast.error('Failed to update leave settings template. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Leave Settings Template" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Edit Leave Settings Template" className="mb-0" />
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
                    submitButtonText="Update Leave Settings Template"
                    onSubmit={handleSubmit}
                    isEditMode={true}
                    leaveTypes={leaveTypes}
                    accrualTypes={accrualTypes}
                    accrualFrequencies={accrualFrequencies}
                    statusOptions={statusOptions}
                />
            </div>
        </AppLayout>
    );
}

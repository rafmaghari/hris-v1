import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

// Constants
const ACCRUAL_TYPES = {
    FIXED: 1,
    ACCRUAL: 2,
} as const;

const ACCRUAL_FREQUENCIES = {
    MONTHLY: 1,
    QUARTERLY: 2,
    YEARLY: 3,
    BIMONTHLY: 4,
} as const;

const FREQUENCY_PERIODS_PER_YEAR = {
    [ACCRUAL_FREQUENCIES.MONTHLY]: 12,
    [ACCRUAL_FREQUENCIES.BIMONTHLY]: 6,
    [ACCRUAL_FREQUENCIES.QUARTERLY]: 4,
    [ACCRUAL_FREQUENCIES.YEARLY]: 1,
} as const;

const DECIMAL_PRECISION = 100; // For rounding to 2 decimal places

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

type LeaveSettingsTemplateFormData = {
    name: string;
    leave_type_id: number | '';
    accrual_type: number | '';
    fixed_days: number | '';
    accrual_frequency: number | '';
    accrual_amount: number | '';
    max_cap: number | '';
    allow_carry_over: boolean;
    max_carry_over: number | '';
    status: number | '';
};

type LeaveSettingsTemplateFormProps = {
    data: LeaveSettingsTemplateFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    submitButtonText: string;
    onSubmit: (e: React.FormEvent) => void;
    isEditMode?: boolean;
    leaveTypes: LeaveType[];
    accrualTypes: AccrualTypeOption[];
    accrualFrequencies: AccrualFrequencyOption[];
    statusOptions: StatusOption[];
};

export default function LeaveSettingsTemplateForm({
    data,
    setData,
    errors,
    processing,
    submitButtonText,
    onSubmit,
    isEditMode = false,
    leaveTypes,
    accrualTypes,
    accrualFrequencies,
    statusOptions,
}: LeaveSettingsTemplateFormProps) {
    // Auto-calculate accrual amount when max_cap or accrual_frequency changes
    useEffect(() => {
        if (data.accrual_type === ACCRUAL_TYPES.ACCRUAL && data.max_cap && data.accrual_frequency) {
            const frequencyPeriodsPerYear = getFrequencyPeriodsPerYear(data.accrual_frequency);
            if (frequencyPeriodsPerYear > 0) {
                const calculatedAmount = Number(data.max_cap) / frequencyPeriodsPerYear;
                setData('accrual_amount', Math.round(calculatedAmount * DECIMAL_PRECISION) / DECIMAL_PRECISION);
            }
        }
    }, [data.max_cap, data.accrual_frequency, data.accrual_type]);

    const getFrequencyPeriodsPerYear = (frequency: number): number => {
        return FREQUENCY_PERIODS_PER_YEAR[frequency as keyof typeof FREQUENCY_PERIODS_PER_YEAR] || 0;
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="mb-4">
                    <label htmlFor="name" className="mb-1 block text-sm">
                        Template Name
                    </label>
                    <Input
                        id="name"
                        type="text"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
                </div>

                <div className="mb-4">
                    <label htmlFor="leave_type_id" className="mb-1 block text-sm">
                        Leave Type
                    </label>
                    <Select value={String(data.leave_type_id)} onValueChange={(value) => setData('leave_type_id', Number(value))}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                            {leaveTypes.map((leaveType) => (
                                <SelectItem key={leaveType.id} value={String(leaveType.id)}>
                                    {leaveType.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.leave_type_id && <div className="mt-1 text-sm text-red-600">{errors.leave_type_id}</div>}
                </div>

                <div className="mb-4">
                    <label htmlFor="accrual_type" className="mb-1 block text-sm">
                        Accrual Type
                    </label>
                    <Select value={String(data.accrual_type)} onValueChange={(value) => setData('accrual_type', Number(value))}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select accrual type" />
                        </SelectTrigger>
                        <SelectContent>
                            {accrualTypes.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.accrual_type && <div className="mt-1 text-sm text-red-600">{errors.accrual_type}</div>}
                </div>

                <div className="mb-4">
                    <label htmlFor="status" className="mb-1 block text-sm">
                        Status
                    </label>
                    <Select value={String(data.status)} onValueChange={(value) => setData('status', Number(value))}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.status && <div className="mt-1 text-sm text-red-600">{errors.status}</div>}
                </div>

                {data.accrual_type === ACCRUAL_TYPES.FIXED && (
                    <div className="mb-4">
                        <label htmlFor="fixed_days" className="mb-1 block text-sm">
                            Fixed Days
                        </label>
                        <Input
                            id="fixed_days"
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={data.fixed_days}
                            onChange={(e) => setData('fixed_days', e.target.value ? Number(e.target.value) : '')}
                        />
                        {errors.fixed_days && <div className="mt-1 text-sm text-red-600">{errors.fixed_days}</div>}
                    </div>
                )}

                {data.accrual_type === ACCRUAL_TYPES.ACCRUAL && (
                    <>
                        <div className="mb-4">
                            <label htmlFor="max_cap" className="mb-1 block text-sm">
                                Maximum Cap
                            </label>
                            <Input
                                id="max_cap"
                                type="number"
                                min="0"
                                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={data.max_cap}
                                onChange={(e) => setData('max_cap', e.target.value ? Number(e.target.value) : '')}
                            />
                            {errors.max_cap && <div className="mt-1 text-sm text-red-600">{errors.max_cap}</div>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="accrual_frequency" className="mb-1 block text-sm">
                                Accrual Frequency
                            </label>
                            <Select value={String(data.accrual_frequency)} onValueChange={(value) => setData('accrual_frequency', Number(value))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select accrual frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accrualFrequencies.map((option) => (
                                        <SelectItem key={option.value} value={String(option.value)}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.accrual_frequency && <div className="mt-1 text-sm text-red-600">{errors.accrual_frequency}</div>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="accrual_amount" className="mb-1 block text-sm">
                                Accrual Amount (Auto-calculated)
                            </label>
                            <Input
                                id="accrual_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={data.accrual_amount}
                                readOnly
                            />
                            <div className="mt-1 text-xs text-gray-500">Calculated as: Maximum Cap ÷ Frequency periods per year</div>
                            {errors.accrual_amount && <div className="mt-1 text-sm text-red-600">{errors.accrual_amount}</div>}
                        </div>
                    </>
                )}

                {data.accrual_type !== ACCRUAL_TYPES.ACCRUAL && (
                    <div className="mb-4">
                        <label htmlFor="max_cap" className="mb-1 block text-sm">
                            Maximum Cap (Optional)
                        </label>
                        <Input
                            id="max_cap"
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={data.max_cap}
                            onChange={(e) => setData('max_cap', e.target.value ? Number(e.target.value) : '')}
                        />
                        {errors.max_cap && <div className="mt-1 text-sm text-red-600">{errors.max_cap}</div>}
                    </div>
                )}

                <div className="mb-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="allow_carry_over"
                            checked={data.allow_carry_over}
                            onCheckedChange={(checked) => setData('allow_carry_over', checked)}
                        />
                        <label htmlFor="allow_carry_over" className="text-sm">
                            Allow Carry Over
                        </label>
                    </div>
                    {errors.allow_carry_over && <div className="mt-1 text-sm text-red-600">{errors.allow_carry_over}</div>}
                </div>

                {data.allow_carry_over && (
                    <div className="mb-4">
                        <label htmlFor="max_carry_over" className="mb-1 block text-sm">
                            Maximum Carry Over Days
                        </label>
                        <Input
                            id="max_carry_over"
                            type="number"
                            min="0"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={data.max_carry_over}
                            onChange={(e) => setData('max_carry_over', e.target.value ? Number(e.target.value) : '')}
                        />
                        {errors.max_carry_over && <div className="mt-1 text-sm text-red-600">{errors.max_carry_over}</div>}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <Link href={route('leave-settings-templates.index')}>
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                    {submitButtonText}
                </Button>
            </div>
        </form>
    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

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
}

interface AccrualOption {
    value: number;
    label: string;
}

interface Props {
    userLeaveSetting?: UserLeaveSetting;
    users: User[];
    leaveSettingsTemplates: LeaveSettingsTemplate[];
    accrualTypes: AccrualOption[];
    accrualFrequencies: AccrualOption[];
    isEditing?: boolean;
}

export default function UserLeaveSettingForm({
    userLeaveSetting,
    users,
    leaveSettingsTemplates,
    accrualTypes,
    accrualFrequencies,
    isEditing = false,
}: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        user_id: userLeaveSetting?.user_id?.toString() || '',
        leave_settings_template_id: userLeaveSetting?.leave_settings_template_id?.toString() || '',
        start_date: userLeaveSetting?.start_date || '',
        end_date: userLeaveSetting?.end_date || '',
        accrual_type: userLeaveSetting?.accrual_type?.toString() || '',
        accrual_frequency: userLeaveSetting?.accrual_frequency?.toString() || '',
        accrual_amount: userLeaveSetting?.accrual_amount?.toString() || '',
        max_cap: userLeaveSetting?.max_cap?.toString() || '',
        max_carry_over: userLeaveSetting?.max_carry_over?.toString() || '0',
        current_balance: userLeaveSetting?.current_balance?.toString() || '0',
        carried_over: userLeaveSetting?.carried_over?.toString() || '0',
        allow_custom_settings: userLeaveSetting?.allow_custom_settings || false,
    });

    // Auto-populate fields when template is selected
    useEffect(() => {
        if (data.leave_settings_template_id && !isEditing) {
            const selectedTemplate = leaveSettingsTemplates.find((template) => template.id.toString() === data.leave_settings_template_id);

            if (selectedTemplate) {
                setData((prevData) => ({
                    ...prevData,
                    accrual_type: selectedTemplate.accrual_type.toString(),
                    accrual_frequency: selectedTemplate.accrual_frequency?.toString() || '',
                    accrual_amount: selectedTemplate.accrual_amount?.toString() || '',
                    max_cap: selectedTemplate.max_cap?.toString() || '',
                    max_carry_over: selectedTemplate.max_carry_over?.toString() || '0',
                }));

                // Show notification that fields were auto-populated
                toast.info(`Fields auto-populated from template: ${selectedTemplate.name}`);
            }
        }
    }, [data.leave_settings_template_id, leaveSettingsTemplates, isEditing, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEditing && userLeaveSetting) {
            put(route('user-leave-settings.update', userLeaveSetting.id), {
                onSuccess: () => {
                    toast.success('User leave setting updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update user leave setting');
                },
            });
        } else {
            post(route('user-leave-settings.store'), {
                onSuccess: () => {
                    toast.success('User leave setting created successfully');
                    reset();
                },
                onError: () => {
                    toast.error('Failed to create user leave setting');
                },
            });
        }
    };

    // Check if template fields should be disabled
    const isTemplateFieldsDisabled = !data.allow_custom_settings && !!data.leave_settings_template_id;

    return (
        <form onSubmit={submit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Edit User Leave Setting' : 'Create User Leave Setting'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="user_id">User *</Label>
                            <Select value={data.user_id} onValueChange={(value) => setData('user_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.first_name} {user.last_name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.user_id && <p className="text-destructive text-sm">{errors.user_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="leave_settings_template_id">Leave Settings Template *</Label>
                            <Select value={data.leave_settings_template_id} onValueChange={(value) => setData('leave_settings_template_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveSettingsTemplates.map((template) => (
                                        <SelectItem key={template.id} value={template.id.toString()}>
                                            {template.name} ({template.leave_type.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.leave_settings_template_id && <p className="text-destructive text-sm">{errors.leave_settings_template_id}</p>}
                        </div>
                    </div>

                    {/* Custom Settings Checkbox */}
                    {data.leave_settings_template_id && (
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="allow_custom_settings"
                                    checked={data.allow_custom_settings}
                                    className="border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                                    onCheckedChange={(checked) => setData('allow_custom_settings', !!checked)}
                                />
                                <Label
                                    htmlFor="allow_custom_settings"
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Allow custom settings (enable editing of template fields)
                                </Label>
                            </div>
                            {!data.allow_custom_settings && (
                                <p className="mt-2 text-sm text-blue-600">
                                    Template fields are locked. Check the box above to customize these values.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date *</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                required
                            />
                            {errors.start_date && <p className="text-destructive text-sm">{errors.start_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input id="end_date" type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                            {errors.end_date && <p className="text-destructive text-sm">{errors.end_date}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="accrual_type">Accrual Type *</Label>
                            <Select
                                value={data.accrual_type}
                                onValueChange={(value) => setData('accrual_type', value)}
                                disabled={isTemplateFieldsDisabled}
                            >
                                <SelectTrigger className={isTemplateFieldsDisabled ? 'cursor-not-allowed opacity-50' : undefined}>
                                    <SelectValue placeholder="Select accrual type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accrualTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value.toString()}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.accrual_type && <p className="text-destructive text-sm">{errors.accrual_type}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="accrual_frequency">Accrual Frequency</Label>
                            <Select
                                value={data.accrual_frequency}
                                onValueChange={(value) => setData('accrual_frequency', value)}
                                disabled={isTemplateFieldsDisabled}
                            >
                                <SelectTrigger className={isTemplateFieldsDisabled ? 'cursor-not-allowed opacity-50' : ''}>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accrualFrequencies.map((frequency) => (
                                        <SelectItem key={frequency.value} value={frequency.value.toString()}>
                                            {frequency.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.accrual_frequency && <p className="text-destructive text-sm">{errors.accrual_frequency}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="accrual_amount">Accrual Amount</Label>
                            <Input
                                id="accrual_amount"
                                type="number"
                                step="0.01"
                                value={data.accrual_amount}
                                onChange={(e) => setData('accrual_amount', e.target.value)}
                                disabled={isTemplateFieldsDisabled}
                                className={isTemplateFieldsDisabled ? 'cursor-not-allowed opacity-50' : ''}
                            />
                            {errors.accrual_amount && <p className="text-destructive text-sm">{errors.accrual_amount}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_cap">Max Cap *</Label>
                            <Input
                                id="max_cap"
                                type="number"
                                step="0.01"
                                value={data.max_cap}
                                onChange={(e) => setData('max_cap', e.target.value)}
                                required
                                disabled={isTemplateFieldsDisabled}
                                className={isTemplateFieldsDisabled ? 'cursor-not-allowed opacity-50' : ''}
                            />
                            {errors.max_cap && <p className="text-destructive text-sm">{errors.max_cap}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="max_carry_over">Max Carry Over</Label>
                            <Input
                                id="max_carry_over"
                                type="number"
                                step="0.01"
                                value={data.max_carry_over}
                                onChange={(e) => setData('max_carry_over', e.target.value)}
                                disabled={isTemplateFieldsDisabled}
                                className={isTemplateFieldsDisabled ? 'cursor-not-allowed opacity-50' : ''}
                            />
                            {errors.max_carry_over && <p className="text-destructive text-sm">{errors.max_carry_over}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="current_balance">Current Balance</Label>
                            <Input
                                id="current_balance"
                                type="number"
                                step="0.01"
                                value={data.current_balance}
                                onChange={(e) => setData('current_balance', e.target.value)}
                            />
                            {errors.current_balance && <p className="text-destructive text-sm">{errors.current_balance}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="carried_over">Carried Over</Label>
                            <Input
                                id="carried_over"
                                type="number"
                                step="0.01"
                                value={data.carried_over}
                                onChange={(e) => setData('carried_over', e.target.value)}
                            />
                            {errors.carried_over && <p className="text-destructive text-sm">{errors.carried_over}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

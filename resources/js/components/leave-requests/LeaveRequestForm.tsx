import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface UserLeaveSetting {
    id: number;
    leave_settings_template: {
        id: number;
        name: string;
        leave_type: {
            id: number;
            name: string;
        };
    };
    current_balance: number;
    max_cap: number;
}

interface LeaveRequestFormProps {
    leaveRequest?: {
        id: number;
        user_leave_setting_id: number;
        start_date: string;
        end_date: string;
        days_requested: number;
        reason: string;
    };
    userLeaveSettings: UserLeaveSetting[];
    mode: 'create' | 'edit';
}

export function LeaveRequestForm({ leaveRequest, userLeaveSettings, mode }: LeaveRequestFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        user_leave_setting_id: leaveRequest?.user_leave_setting_id || '',
        start_date: leaveRequest?.start_date || '',
        end_date: leaveRequest?.end_date || '',
        days_requested: leaveRequest?.days_requested || 0,
        reason: leaveRequest?.reason || '',
    });

    useEffect(() => {
        if (data.start_date && data.end_date) {
            const start = new Date(data.start_date);
            const end = new Date(data.end_date);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
            setData('days_requested', Math.max(0, diffDays));
        }
    }, [data.start_date, data.end_date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(route('leave-requests.store'));
        } else {
            put(route('leave-requests.update', leaveRequest?.id));
        }
    };

    const selectedLeaveSetting = userLeaveSettings.find((setting) => setting.id.toString() === data.user_leave_setting_id.toString());

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{mode === 'create' ? 'Request Leave' : 'Edit Leave Request'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="user_leave_setting_id">Leave Type</Label>
                        {userLeaveSettings.length === 0 ? (
                            <div className="rounded-md bg-yellow-50 p-4">
                                <h4 className="font-medium text-yellow-900">No Leave Settings Available</h4>
                                <p className="text-sm text-yellow-700">
                                    You don't have any leave settings configured. Please contact your administrator to set up your leave entitlements.
                                </p>
                            </div>
                        ) : (
                            <Select
                                value={data.user_leave_setting_id.toString()}
                                onValueChange={(value) => setData('user_leave_setting_id', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userLeaveSettings.map((setting) => (
                                        <SelectItem key={setting.id} value={setting.id.toString()}>
                                            {setting.leave_settings_template?.leave_type?.name || 'Unknown Leave Type'} - Balance:{' '}
                                            {setting.current_balance} days
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {errors.user_leave_setting_id && <p className="text-sm text-red-600">{errors.user_leave_setting_id}</p>}
                    </div>

                    {selectedLeaveSetting && (
                        <div className="rounded-md bg-blue-50 p-4">
                            <h4 className="font-medium text-blue-900">Leave Balance Information</h4>
                            <p className="text-sm text-blue-700">
                                Current Balance: <span className="font-medium">{selectedLeaveSetting.current_balance} days</span>
                            </p>
                            <p className="text-sm text-blue-700">
                                Maximum Cap: <span className="font-medium">{selectedLeaveSetting.max_cap} days</span>
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                min={data.start_date || new Date().toISOString().split('T')[0]}
                            />
                            {errors.end_date && <p className="text-sm text-red-600">{errors.end_date}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="days_requested">Days Requested</Label>
                        <Input
                            id="days_requested"
                            type="number"
                            step="0.5"
                            value={data.days_requested}
                            onChange={(e) => setData('days_requested', parseFloat(e.target.value) || 0)}
                            min="0.5"
                        />
                        {errors.days_requested && <p className="text-sm text-red-600">{errors.days_requested}</p>}
                        <p className="text-sm text-gray-600">
                            Days are automatically calculated based on start and end dates. You can adjust manually if needed.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="Please provide a reason for your leave request..."
                            rows={4}
                        />
                        {errors.reason && <p className="text-sm text-red-600">{errors.reason}</p>}
                    </div>

                    {data.days_requested > 0 && selectedLeaveSetting && data.days_requested > selectedLeaveSetting.current_balance && (
                        <div className="rounded-md bg-red-50 p-4">
                            <h4 className="font-medium text-red-900">Insufficient Balance</h4>
                            <p className="text-sm text-red-700">
                                You are requesting {data.days_requested} days but only have {selectedLeaveSetting.current_balance} days available.
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Submitting...' : mode === 'create' ? 'Submit Request' : 'Update Request'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

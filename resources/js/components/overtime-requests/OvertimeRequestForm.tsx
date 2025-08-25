import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface OvertimeRequestFormProps {
    overtimeRequest?: {
        id: number;
        date: string;
        start_time: string;
        end_time: string;
        reason: string;
        total_hours: number;
    };
    mode: 'create' | 'edit';
}

export function OvertimeRequestForm({ overtimeRequest, mode }: OvertimeRequestFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        date: overtimeRequest?.date || '',
        start_time: overtimeRequest?.start_time || '',
        end_time: overtimeRequest?.end_time || '',
        reason: overtimeRequest?.reason || '',
        total_hours: overtimeRequest?.total_hours || 0,
    });

    useEffect(() => {
        if (data.start_time && data.end_time) {
            const start = new Date(`2000-01-01 ${data.start_time}`);
            const end = new Date(`2000-01-01 ${data.end_time}`);
            const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            setData('total_hours', Math.max(0, diffHours));
        }
    }, [data.start_time, data.end_time]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post(route('overtime-requests.store'));
        } else {
            put(route('overtime-requests.update', overtimeRequest?.id));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{mode === 'create' ? 'Create Overtime Request' : 'Edit Overtime Request'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            className={errors.date ? 'border-red-500' : ''}
                        />
                        {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                                className={errors.start_time ? 'border-red-500' : ''}
                            />
                            {errors.start_time && <p className="mt-1 text-sm text-red-500">{errors.start_time}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_time">End Time</Label>
                            <Input
                                id="end_time"
                                type="time"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                                className={errors.end_time ? 'border-red-500' : ''}
                            />
                            {errors.end_time && <p className="mt-1 text-sm text-red-500">{errors.end_time}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="total_hours">Total Hours</Label>
                        <Input
                            id="total_hours"
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="24"
                            value={data.total_hours}
                            onChange={(e) => setData('total_hours', parseFloat(e.target.value))}
                            className={errors.total_hours ? 'border-red-500' : ''}
                        />
                        {errors.total_hours && <p className="mt-1 text-sm text-red-500">{errors.total_hours}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            rows={4}
                            className={errors.reason ? 'border-red-500' : ''}
                        />
                        {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={processing}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {mode === 'create' ? 'Create' : 'Update'} Request
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

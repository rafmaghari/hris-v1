import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';
import { getStatusColor, getStatusLabel, OvertimeRequest } from './Index';

interface Props {
    overtimeRequest: OvertimeRequest;
    canApprove: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Overtime Requests',
        href: route('overtime-requests.index'),
    },
    {
        title: 'View',
        href: '#',
    },
];

export default function Show({ overtimeRequest, canApprove }: Props) {
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const { data, setData, post, processing } = useForm({
        approver_note: '',
    });

    const handleApprove = () => {
        post(route('overtime-requests.approve', overtimeRequest.id), {
            onSuccess: () => setIsApproveDialogOpen(false),
        });
    };

    const handleReject = () => {
        post(route('overtime-requests.reject', overtimeRequest.id), {
            onSuccess: () => setIsRejectDialogOpen(false),
        });
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this overtime request?')) {
            post(route('overtime-requests.cancel', overtimeRequest.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Overtime Request" />

            <div className="my-4 flex items-center justify-between px-6">
                <h1 className="text-2xl font-semibold">View Overtime Request</h1>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Back
                </Button>
            </div>

            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Overtime Request Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Employee</Label>
                                <p className="text-gray-700">
                                    {overtimeRequest.user.first_name} {overtimeRequest.user.last_name}
                                </p>
                            </div>
                            <div>
                                <Label>Status </Label>
                                <Badge variant={getStatusColor(overtimeRequest.status)}>{getStatusLabel(overtimeRequest.status)}</Badge>
                            </div>
                            <div>
                                <Label>Date</Label>
                                <p className="text-gray-700">{format(new Date(overtimeRequest.date), 'MMMM d, yyyy')}</p>
                            </div>
                            <div>
                                <Label>Time</Label>
                                <p className="text-gray-700">
                                    {overtimeRequest.start_time} - {overtimeRequest.end_time}
                                </p>
                            </div>
                            <div>
                                <Label>Total Hours</Label>
                                <p className="text-gray-700">{overtimeRequest.total_hours}</p>
                            </div>
                            <div>
                                <Label>Reason</Label>
                                <p className="text-gray-700">{overtimeRequest.reason}</p>
                            </div>
                        </div>

                        {overtimeRequest.approver && (
                            <div className="mt-6 border-t pt-6">
                                <h3 className="mb-4 font-semibold">Approval Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Approver</Label>
                                        <p className="text-gray-700">
                                            {overtimeRequest.approver.first_name} {overtimeRequest.approver.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <Label>Approved At</Label>
                                        <p className="text-gray-700">
                                            {overtimeRequest.approved_at && format(new Date(overtimeRequest.approved_at), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                    {overtimeRequest.approver_note && (
                                        <div className="col-span-2">
                                            <Label>Note</Label>
                                            <p className="text-gray-700">{overtimeRequest.approver_note}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        {overtimeRequest.status === 1 && (
                            <>
                                {canApprove && (
                                    <>
                                        <Button onClick={() => setIsApproveDialogOpen(true)}>Approve</Button>
                                        <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)}>
                                            Reject
                                        </Button>
                                    </>
                                )}
                                {overtimeRequest.user.id === (window as any).auth.user.id && (
                                    <Button variant="outline" onClick={handleCancel}>
                                        Cancel Request
                                    </Button>
                                )}
                            </>
                        )}
                    </CardFooter>
                </Card>

                <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Overtime Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="approver_note">Note (Optional)</Label>
                                <Textarea
                                    id="approver_note"
                                    value={data.approver_note}
                                    onChange={(e) => setData('approver_note', e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button onClick={handleApprove} disabled={processing}>
                                Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Overtime Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="approver_note">Reason for Rejection</Label>
                                <Textarea
                                    id="approver_note"
                                    value={data.approver_note}
                                    onChange={(e) => setData('approver_note', e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleReject} disabled={processing}>
                                Reject
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

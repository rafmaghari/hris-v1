import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getStatusColor, getStatusLabel, LeaveRequest } from './Index';

interface Props {
    leaveRequest: LeaveRequest;
    canApprove?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Leave Requests',
        href: route('leave-requests.index'),
    },
    {
        title: 'View',
        href: '#',
    },
];

export default function Show({ leaveRequest, canApprove = false }: Props) {
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const auth = usePage().props.auth as { user: { id: number } };

    const { data, setData, post, processing } = useForm({
        remarks: '',
    });

    const handleApprove = () => {
        post(route('leave-requests.approve', leaveRequest.id), {
            onSuccess: () => {
                setIsApproveDialogOpen(false);
                toast.success('Leave request approved successfully');
            },
        });
    };

    const handleReject = () => {
        post(route('leave-requests.reject', leaveRequest.id), {
            onSuccess: () => {
                setIsRejectDialogOpen(false);
                toast.success('Leave request rejected successfully');
            },
        });
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this leave request?')) {
            post(route('leave-requests.cancel', leaveRequest.id), {
                onSuccess: () => {
                    toast.success('Leave request cancelled successfully');
                },
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this leave request?')) {
            post(route('leave-requests.destroy', leaveRequest.id), {
                method: 'delete',
                onSuccess: () => {
                    toast.success('Leave request deleted successfully');
                },
            });
        }
    };

    const canEdit = leaveRequest.status === 1 && leaveRequest.user.id === auth.user.id; // Pending and own request
    const canDelete = leaveRequest.status === 1 && leaveRequest.user.id === auth.user.id; // Pending and own request
    const canCancel = leaveRequest.status === 1 && leaveRequest.user.id === auth.user.id; // Pending and own request

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Leave Request" />

            <div className="my-4 flex items-center justify-between px-6">
                <h1 className="text-2xl font-semibold">View Leave Request</h1>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Back
                </Button>
            </div>

            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Request Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Employee</Label>
                                <p className="text-gray-700">
                                    {leaveRequest.user.first_name} {leaveRequest.user.last_name}
                                </p>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Badge variant={getStatusColor(leaveRequest.status)}>{getStatusLabel(leaveRequest.status)}</Badge>
                            </div>
                            <div>
                                <Label>Leave Type</Label>
                                <p className="text-gray-700">{leaveRequest.user_leave_setting.leave_settings_template.leave_type.name}</p>
                            </div>
                            <div>
                                <Label>Days Requested</Label>
                                <p className="font-medium text-gray-700">{leaveRequest.days_requested} days</p>
                            </div>
                            <div>
                                <Label>Start Date</Label>
                                <p className="text-gray-700">{format(new Date(leaveRequest.start_date), 'MMMM d, yyyy')}</p>
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <p className="text-gray-700">{format(new Date(leaveRequest.end_date), 'MMMM d, yyyy')}</p>
                            </div>
                            <div className="col-span-2">
                                <Label>Reason</Label>
                                <p className="text-gray-700">{leaveRequest.reason}</p>
                            </div>
                            {leaveRequest.approver && (
                                <>
                                    <div>
                                        <Label>Approved/Rejected By</Label>
                                        <p className="text-gray-700">
                                            {leaveRequest.approver.first_name} {leaveRequest.approver.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <Label>Date Processed</Label>
                                        <p className="text-gray-700">
                                            {leaveRequest.approved_at ? format(new Date(leaveRequest.approved_at), 'MMMM d, yyyy') : '-'}
                                        </p>
                                    </div>
                                </>
                            )}
                            {leaveRequest.remarks && (
                                <div className="col-span-2">
                                    <Label>Remarks</Label>
                                    <p className="text-gray-700">{leaveRequest.remarks}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <div className="flex space-x-2">
                            {canEdit && (
                                <Button variant="outline" asChild>
                                    <Link href={route('leave-requests.edit', leaveRequest.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                            {canDelete && (
                                <Button variant="outline" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            )}
                            {canCancel && (
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel Request
                                </Button>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            {canApprove && leaveRequest.status === 1 && (
                                <>
                                    <Button variant="outline" onClick={() => setIsRejectDialogOpen(true)}>
                                        Reject
                                    </Button>
                                    <Button onClick={() => setIsApproveDialogOpen(true)}>Approve</Button>
                                </>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Approve Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Leave Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Are you sure you want to approve this leave request?</p>
                        <div>
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Textarea
                                id="remarks"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                placeholder="Add any remarks..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={processing}>
                            {processing ? 'Approving...' : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Leave Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Are you sure you want to reject this leave request?</p>
                        <div>
                            <Label htmlFor="remarks">Reason for Rejection *</Label>
                            <Textarea
                                id="remarks"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processing || !data.remarks.trim()}>
                            {processing ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

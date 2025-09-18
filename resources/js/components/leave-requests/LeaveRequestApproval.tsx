import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface LeaveRequest {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    user_leave_setting: {
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
    };
    start_date: string;
    end_date: string;
    days_requested: number;
    reason: string;
    status: number;
    created_at: string;
}

interface LeaveRequestApprovalProps {
    leaveRequest: LeaveRequest;
    onApprove?: () => void;
    onReject?: () => void;
    compact?: boolean;
}

export function LeaveRequestApproval({ leaveRequest, onApprove, onReject, compact = false }: LeaveRequestApprovalProps) {
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        remarks: '',
    });

    const handleApprove = () => {
        post(route('leave-requests.approve', leaveRequest.id), {
            onSuccess: () => {
                setIsApproveDialogOpen(false);
                reset();
                toast.success('Leave request approved successfully');
                onApprove?.();
            },
            onError: () => {
                toast.error('Failed to approve leave request');
            },
        });
    };

    const handleReject = () => {
        post(route('leave-requests.reject', leaveRequest.id), {
            onSuccess: () => {
                setIsRejectDialogOpen(false);
                reset();
                toast.success('Leave request rejected successfully');
                onReject?.();
            },
            onError: () => {
                toast.error('Failed to reject leave request');
            },
        });
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1:
                return 'secondary'; // Pending
            case 2:
                return 'default'; // Approved
            case 3:
                return 'destructive'; // Rejected
            case 4:
                return 'outline'; // Cancelled
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 1:
                return 'Pending';
            case 2:
                return 'Approved';
            case 3:
                return 'Rejected';
            case 4:
                return 'Cancelled';
            default:
                return 'Pending';
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsApproveDialogOpen(true)}
                    className="text-green-600 hover:text-green-700"
                    disabled={leaveRequest.status !== 1}
                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsRejectDialogOpen(true)}
                    className="text-red-600 hover:text-red-700"
                    disabled={leaveRequest.status !== 1}
                >
                    <X className="h-4 w-4" />
                </Button>
                {renderDialogs()}
            </div>
        );
    }

    function renderDialogs() {
        return (
            <>
                {/* Approve Dialog */}
                <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Approve Leave Request</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="rounded-md bg-blue-50 p-4">
                                <h4 className="mb-2 font-medium text-blue-900">Request Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium text-blue-700">Employee:</span>
                                        <p className="text-blue-600">
                                            {leaveRequest.user.first_name} {leaveRequest.user.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-blue-700">Leave Type:</span>
                                        <p className="text-blue-600">{leaveRequest.user_leave_setting.leave_settings_template.leave_type.name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-blue-700">Period:</span>
                                        <p className="text-blue-600">
                                            {format(new Date(leaveRequest.start_date), 'MMM dd')} -{' '}
                                            {format(new Date(leaveRequest.end_date), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-blue-700">Days:</span>
                                        <p className="text-blue-600">{leaveRequest.days_requested} days</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium text-blue-700">Current Balance:</span>
                                        <p className="text-blue-600">{leaveRequest.user_leave_setting.current_balance} days</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium text-blue-700">Reason:</span>
                                        <p className="text-blue-600">{leaveRequest.reason}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="remarks">Approval Remarks (Optional)</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="Add any remarks for approval..."
                                    rows={3}
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
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Reject Leave Request</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="rounded-md bg-red-50 p-4">
                                <h4 className="mb-2 font-medium text-red-900">Request Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium text-red-700">Employee:</span>
                                        <p className="text-red-600">
                                            {leaveRequest.user.first_name} {leaveRequest.user.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-red-700">Leave Type:</span>
                                        <p className="text-red-600">{leaveRequest.user_leave_setting.leave_settings_template.leave_type.name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-red-700">Period:</span>
                                        <p className="text-red-600">
                                            {format(new Date(leaveRequest.start_date), 'MMM dd')} -{' '}
                                            {format(new Date(leaveRequest.end_date), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-red-700">Days:</span>
                                        <p className="text-red-600">{leaveRequest.days_requested} days</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium text-red-700">Reason:</span>
                                        <p className="text-red-600">{leaveRequest.reason}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="remarks">Rejection Reason *</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="Please provide a reason for rejection..."
                                    rows={3}
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
            </>
        );
    }

    // Full card view
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Leave Request Review</span>
                    <Badge variant={getStatusColor(leaveRequest.status)}>{getStatusLabel(leaveRequest.status)}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Employee</Label>
                        <p className="text-gray-700">
                            {leaveRequest.user.first_name} {leaveRequest.user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{leaveRequest.user.email}</p>
                    </div>
                    <div>
                        <Label>Leave Type</Label>
                        <p className="text-gray-700">{leaveRequest.user_leave_setting.leave_settings_template.leave_type.name}</p>
                    </div>
                    <div>
                        <Label>Period</Label>
                        <p className="text-gray-700">
                            {format(new Date(leaveRequest.start_date), 'MMM dd')} - {format(new Date(leaveRequest.end_date), 'MMM dd, yyyy')}
                        </p>
                    </div>
                    <div>
                        <Label>Days Requested</Label>
                        <p className="font-medium text-gray-700">{leaveRequest.days_requested} days</p>
                    </div>
                    <div>
                        <Label>Current Balance</Label>
                        <p className="text-gray-700">{leaveRequest.user_leave_setting.current_balance} days</p>
                    </div>
                    <div>
                        <Label>Requested On</Label>
                        <p className="text-gray-700">{format(new Date(leaveRequest.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="col-span-2">
                        <Label>Reason</Label>
                        <p className="text-gray-700">{leaveRequest.reason}</p>
                    </div>
                </div>

                {leaveRequest.status === 1 && (
                    <div className="flex space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(true)} className="flex-1">
                            <X className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                        <Button onClick={() => setIsApproveDialogOpen(true)} className="flex-1">
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                        </Button>
                    </div>
                )}
            </CardContent>
            {renderDialogs()}
        </Card>
    );
}

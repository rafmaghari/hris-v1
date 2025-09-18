import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useState } from 'react';

interface LeaveRequest {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
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
    status: {
        value: number;
        label: string;
    };
}

interface Props {
    leaveRequests: {
        data: LeaveRequest[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Pending Leave Approvals',
        href: route('leave-requests.pending-approvals'),
    },
];

export default function PendingApprovals({ leaveRequests }: Props) {
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        remarks: '',
    });

    const handleApprove = () => {
        if (!selectedRequest) return;

        post(route('leave-requests.approve', selectedRequest.id), {
            onSuccess: () => {
                setIsApproveDialogOpen(false);
                setSelectedRequest(null);
                reset();
            },
        });
    };

    const handleReject = () => {
        if (!selectedRequest) return;

        post(route('leave-requests.reject', selectedRequest.id), {
            onSuccess: () => {
                setIsRejectDialogOpen(false);
                setSelectedRequest(null);
                reset();
            },
        });
    };

    const columns: ColumnDef<LeaveRequest>[] = [
        {
            accessorKey: 'user',
            header: 'Employee',
            cell: ({ row }) => (
                <span>
                    {row.original.user.first_name} {row.original.user.last_name}
                </span>
            ),
        },
        {
            accessorKey: 'leave_type',
            header: 'Leave Type',
            cell: ({ row }) => row.original.user_leave_setting.leave_settings_template.leave_type.name,
        },
        {
            accessorKey: 'period',
            header: 'Period',
            cell: ({ row }) => (
                <span>
                    {format(new Date(row.original.start_date), 'MMM d')} - {format(new Date(row.original.end_date), 'MMM d, yyyy')}
                </span>
            ),
        },
        {
            accessorKey: 'days_requested',
            header: 'Days',
            cell: ({ row }) => `${row.original.days_requested} days`,
        },
        {
            accessorKey: 'current_balance',
            header: 'Balance',
            cell: ({ row }) => `${row.original.user_leave_setting.current_balance} days`,
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
            cell: ({ row }) => (
                <span className="block max-w-xs truncate" title={row.original.reason}>
                    {row.original.reason}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedRequest(row.original);
                            setIsApproveDialogOpen(true);
                        }}
                    >
                        Review
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Request Approvals" />

            <div className="my-4 flex items-center justify-between px-5">
                <h1 className="text-2xl font-semibold">Pending Leave Request Approvals</h1>
            </div>

            <div className="p-6">
                <DataTable columns={columns} data={leaveRequests.data} links={leaveRequests.links} />
            </div>

            {/* Review Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Review Leave Request</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Employee</Label>
                                    <p className="text-sm">
                                        {selectedRequest.user.first_name} {selectedRequest.user.last_name}
                                    </p>
                                </div>
                                <div>
                                    <Label>Leave Type</Label>
                                    <p className="text-sm">{selectedRequest.user_leave_setting.leave_settings_template.leave_type.name}</p>
                                </div>
                                <div>
                                    <Label>Period</Label>
                                    <p className="text-sm">
                                        {format(new Date(selectedRequest.start_date), 'MMM d')} -{' '}
                                        {format(new Date(selectedRequest.end_date), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <div>
                                    <Label>Days Requested</Label>
                                    <p className="text-sm">{selectedRequest.days_requested} days</p>
                                </div>
                                <div>
                                    <Label>Current Balance</Label>
                                    <p className="text-sm">{selectedRequest.user_leave_setting.current_balance} days</p>
                                </div>
                            </div>
                            <div>
                                <Label>Reason</Label>
                                <p className="text-sm">{selectedRequest.reason}</p>
                            </div>
                            <div>
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="Add your remarks here..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsRejectDialogOpen(true);
                                setIsApproveDialogOpen(false);
                            }}
                            disabled={processing}
                        >
                            Reject
                        </Button>
                        <Button onClick={handleApprove} disabled={processing}>
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Confirmation Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Leave Request</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="rejection_remarks">Reason for Rejection (Required)</Label>
                        <Textarea
                            id="rejection_remarks"
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsRejectDialogOpen(false);
                                setIsApproveDialogOpen(true);
                            }}
                            disabled={processing}
                        >
                            Back
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processing || !data.remarks}>
                            Reject Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

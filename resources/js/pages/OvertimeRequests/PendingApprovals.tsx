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

interface OvertimeRequest {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
    };
    date: string;
    start_time: string;
    end_time: string;
    reason: string;
    total_hours: number;
    status: {
        value: number;
        label: string;
    };
}

interface Props {
    overtimeRequests: {
        data: OvertimeRequest[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Pending Approvals',
        href: route('overtime-requests.pending-approvals'),
    },
];

export default function PendingApprovals({ overtimeRequests }: Props) {
    const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        approver_note: '',
    });

    const handleApprove = () => {
        if (!selectedRequest) return;

        post(route('overtime-requests.approve', selectedRequest.id), {
            onSuccess: () => {
                setIsApproveDialogOpen(false);
                setSelectedRequest(null);
                reset();
            },
        });
    };

    const handleReject = () => {
        if (!selectedRequest) return;

        post(route('overtime-requests.reject', selectedRequest.id), {
            onSuccess: () => {
                setIsRejectDialogOpen(false);
                setSelectedRequest(null);
                reset();
            },
        });
    };

    const columns: ColumnDef<OvertimeRequest>[] = [
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
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }) => format(new Date(row.original.date), 'MMM d, yyyy'),
        },
        {
            accessorKey: 'time',
            header: 'Time',
            cell: ({ row }) => (
                <span>
                    {row.original.start_time} - {row.original.end_time}
                </span>
            ),
        },
        {
            accessorKey: 'total_hours',
            header: 'Hours',
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
            <Head title="Overtime Approvals" />

            <div className="my-4 flex items-center justify-between px-5">
                <h1 className="text-2xl font-semibold">Pending Overtime Approvals</h1>
            </div>

            <div className="p-6">
                <DataTable columns={columns} data={overtimeRequests.data} links={overtimeRequests.links} />
            </div>

            {/* Review Dialog */}
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Review Overtime Request</DialogTitle>
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
                                    <Label>Date</Label>
                                    <p className="text-sm">{format(new Date(selectedRequest.date), 'MMMM d, yyyy')}</p>
                                </div>
                                <div>
                                    <Label>Time</Label>
                                    <p className="text-sm">
                                        {selectedRequest.start_time} - {selectedRequest.end_time}
                                    </p>
                                </div>
                                <div>
                                    <Label>Total Hours</Label>
                                    <p className="text-sm">{selectedRequest.total_hours}</p>
                                </div>
                            </div>
                            <div>
                                <Label>Reason</Label>
                                <p className="text-sm">{selectedRequest.reason}</p>
                            </div>
                            <div>
                                <Label htmlFor="approver_note">Note</Label>
                                <Textarea
                                    id="approver_note"
                                    value={data.approver_note}
                                    onChange={(e) => setData('approver_note', e.target.value)}
                                    placeholder="Add your note here..."
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
                        <DialogTitle>Reject Overtime Request</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="rejection_note">Reason for Rejection (Required)</Label>
                        <Textarea
                            id="rejection_note"
                            value={data.approver_note}
                            onChange={(e) => setData('approver_note', e.target.value)}
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
                        <Button variant="destructive" onClick={handleReject} disabled={processing || !data.approver_note}>
                            Reject Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

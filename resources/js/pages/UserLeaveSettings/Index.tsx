import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface LeaveType {
    id: number;
    name: string;
}

interface LeaveSettingsTemplate {
    id: number;
    name: string;
    leave_type: LeaveType;
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
    created_at: string;
    updated_at: string;
    user: User;
    leave_settings_template: LeaveSettingsTemplate;
}

interface PaginatedUserLeaveSettings {
    data: UserLeaveSetting[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    userLeaveSettings: PaginatedUserLeaveSettings;
    filters: {
        filter?: {
            search?: string;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'User Leave Settings',
        href: route('user-leave-settings.index'),
    },
];

function getAccrualTypeLabel(type: number): string {
    switch (type) {
        case 1:
            return 'Fixed';
        case 2:
            return 'Accrual';
        default:
            return 'Unknown';
    }
}

function getAccrualFrequencyLabel(frequency: number | null): string {
    if (!frequency) return 'N/A';
    switch (frequency) {
        case 1:
            return 'Monthly';
        case 2:
            return 'Quarterly';
        case 3:
            return 'Yearly';
        case 4:
            return 'Bimonthly';
        case 5:
            return 'Per Minute (Testing)';
        default:
            return 'Unknown';
    }
}

export default function Index({ userLeaveSettings, filters }: Props) {
    const [search, setSearch] = useState('');
    const { url } = usePage();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [settingToDelete, setSettingToDelete] = useState<UserLeaveSetting | null>(null);

    useEffect(() => {
        // Update search state when URL parameters change
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('filter[search]');
        if (searchParam) {
            setSearch(searchParam);
        }
    }, [url]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const params = search.trim() ? { 'filter[search]': search } : {};
        router.get(route('user-leave-settings.index'), params, { preserveState: true, preserveScroll: true });
    }

    function confirmDelete(setting: UserLeaveSetting) {
        setSettingToDelete(setting);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (settingToDelete) {
            router.delete(route('user-leave-settings.destroy', settingToDelete.id), {
                onSuccess: () => {
                    toast.success('User leave setting deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete user leave setting');
                },
            });
            setDialogOpen(false);
        }
    }

    const columns: ColumnDef<UserLeaveSetting>[] = [
        {
            accessorKey: 'user',
            header: 'User',
            cell: ({ row }) => {
                const user = row.original.user;
                return (
                    <div>
                        <div className="font-medium">
                            {user.first_name} {user.last_name}
                        </div>
                        <div className="text-muted-foreground text-sm">{user.email}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'leave_settings_template.leave_type.name',
            header: 'Leave Type',
            cell: ({ row }) => {
                return <Badge variant="secondary">{row.original.leave_settings_template.leave_type.name}</Badge>;
            },
        },
        {
            accessorKey: 'leave_settings_template.name',
            header: 'Template',
        },
        {
            accessorKey: 'start_date',
            header: 'Start Date',
            cell: ({ row }) => {
                return new Date(row.original.start_date).toLocaleDateString();
            },
        },
        {
            accessorKey: 'end_date',
            header: 'End Date',
            cell: ({ row }) => {
                return row.original.end_date ? new Date(row.original.end_date).toLocaleDateString() : 'Ongoing';
            },
        },
        {
            accessorKey: 'accrual_type',
            header: 'Accrual Type',
            cell: ({ row }) => {
                return <Badge variant="outline">{getAccrualTypeLabel(row.original.accrual_type)}</Badge>;
            },
        },
        {
            accessorKey: 'accrual_frequency',
            header: 'Frequency',
            cell: ({ row }) => {
                return <Badge variant="outline">{getAccrualFrequencyLabel(row.original.accrual_frequency)}</Badge>;
            },
        },
        {
            accessorKey: 'current_balance',
            header: 'Current Balance',
            cell: ({ row }) => {
                return <span className="font-medium">{row.original.current_balance} days</span>;
            },
        },
        {
            accessorKey: 'max_cap',
            header: 'Max Cap',
            cell: ({ row }) => {
                return `${row.original.max_cap} days`;
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('user-leave-settings.show', row.original.id)}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('user-leave-settings.edit', row.original.id)}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmDelete(row.original)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Leave Settings" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="User Leave Settings" description="Manage user-specific leave settings and assignments" className="mb-0" />
                <Link href={route('user-leave-settings.create')}>
                    <Button>Add User Leave Setting</Button>
                </Link>
            </div>

            <div className="p-6">
                <div className="mb-6 flex w-full items-center justify-end">
                    <form onSubmit={handleSearch}>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="Search users, templates, or leave types..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={userLeaveSettings.data} links={userLeaveSettings.links} />

                <ConfirmationDialog
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete the leave setting for ${settingToDelete?.user.first_name} ${settingToDelete?.user.last_name}?`}
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onConfirm={handleDelete}
                    confirmButtonText="Delete"
                    confirmButtonVariant="destructive"
                />
            </div>
        </AppLayout>
    );
}

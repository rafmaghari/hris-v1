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
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type LeaveType = {
    id: number;
    name: string;
    description: string;
    status: string;
};

type LeaveSettingsTemplate = {
    id: number;
    name: string;
    leave_type_id: number;
    accrual_type: number;
    fixed_days: number;
    accrual_frequency: number;
    accrual_amount: number;
    max_cap: number;
    allow_carry_over: boolean;
    max_carry_over: number;
    status: number;
    leave_type: LeaveType;
};

type Props = {
    templates: {
        data: LeaveSettingsTemplate[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        filter?: {
            search?: string;
        };
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Leave Settings Templates',
        href: route('leave-settings-templates.index'),
    },
];

export default function Index({ templates, filters }: Props) {
    const [search, setSearch] = useState('');
    const { url } = usePage();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<LeaveSettingsTemplate | null>(null);

    useEffect(() => {
        // Update search state when URL parameters change
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam) {
            setSearch(searchParam);
        }
    }, [url]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const params = search.trim() ? { search: search } : {};
        router.get(route('leave-settings-templates.index'), params, { preserveState: true, preserveScroll: true });
    }

    function confirmDelete(template: LeaveSettingsTemplate) {
        setTemplateToDelete(template);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (templateToDelete) {
            router.delete(route('leave-settings-templates.destroy', { leave_settings_template: templateToDelete.id }));
            setDialogOpen(false);
        }
    }

    function getAccrualType(accrualType: number) {
        return accrualType === 1 ? 'Fixed' : 'Accrual';
    }

    function getAccrualFrequency(accrualFrequency: number) {
        switch (accrualFrequency) {
            case 1:
                return 'Monthly';
            case 2:
                return 'Quarterly';
            case 3:
                return 'Yearly';
            case 4:
                return 'Bimonthly';
            default:
                return 'N/A';
        }
    }

    const columns: ColumnDef<LeaveSettingsTemplate>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'leave_type',
            header: 'Leave Type',
            cell: ({ row }) => {
                const template = row.original;
                return template.leave_type?.name || 'N/A';
            },
        },
        {
            accessorKey: 'accrual_type',
            header: 'Accrual Type',
            cell: ({ row }) => {
                const template = row.original;
                return <Badge variant={template.accrual_type === 1 ? 'secondary' : 'default'}>{getAccrualType(template.accrual_type)}</Badge>;
            },
        },
        {
            accessorKey: 'fixed_days',
            header: 'Fixed Days',
            cell: ({ row }) => {
                const template = row.original;
                return template.fixed_days || 'N/A';
            },
        },
        {
            accessorKey: 'accrual_frequency',
            header: 'Accrual Frequency',
            cell: ({ row }) => {
                const template = row.original;
                return getAccrualFrequency(template.accrual_frequency);
            },
        },
        {
            accessorKey: 'accrual_amount',
            header: 'Accrual Amount',
            cell: ({ row }) => {
                const template = row.original;
                return template.accrual_amount || 'N/A';
            },
        },
        {
            accessorKey: 'max_cap',
            header: 'Max Cap',
            cell: ({ row }) => {
                const template = row.original;
                return template.max_cap || 'N/A';
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const template = row.original;
                return <Badge variant={template.status === 2 ? 'secondary' : 'default'}>{template.status === 2 ? 'Inactive' : 'Active'}</Badge>;
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const template = row.original;

                return (
                    <div className="flex justify-end gap-2">
                        <Link href={route('leave-settings-templates.edit', { leave_settings_template: template.id })}>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(template)} title="Delete template">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Settings Templates" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Leave Settings Templates" className="mb-0" />
                <Link href={route('leave-settings-templates.create')}>
                    <Button>Add Leave Settings Template</Button>
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
                                placeholder="Search templates..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={templates.data} links={templates.links} />

                <ConfirmationDialog
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete ${templateToDelete?.name}?`}
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

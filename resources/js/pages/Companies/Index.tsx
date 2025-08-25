import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Company } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    companies: {
        data: Company[];
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
        title: 'Companies',
        href: route('companies.index'),
    },
];

export default function Index({ companies, filters }: Props) {
    const [search, setSearch] = useState('');
    const { url } = usePage();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

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
        router.get(route('companies.index'), params, { preserveState: true, preserveScroll: true });
    }

    function confirmDelete(company: Company) {
        setCompanyToDelete(company);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (companyToDelete) {
            router.delete(route('companies.destroy', { company: companyToDelete.id }));
            setDialogOpen(false);
        }
    }

    const columns: ColumnDef<Company>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'domain',
            header: 'Domain',
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                const description = row.getValue('description') as string | null;
                return description ? <span className="line-clamp-2">{description}</span> : null;
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const company = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Link href={route('companies.edit', { company: company.id })}>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(company)}>
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
            <Head title="Companies" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Companies" className="mb-0" />
                <Link href={route('companies.create')}>
                    <Button>Create Company</Button>
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
                                placeholder="Search companies..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={companies.data} links={companies.links} />

                <ConfirmationDialog
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete ${companyToDelete?.name}?`}
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

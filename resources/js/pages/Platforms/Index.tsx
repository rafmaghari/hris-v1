import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Platform } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    platforms: {
        data: Platform[];
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
        title: 'Platforms',
        href: route('platforms.index'),
    },
];

export default function Index({ platforms, filters }: Props) {
    const [search, setSearch] = useState('');
    const { url } = usePage();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [platformToDelete, setPlatformToDelete] = useState<Platform | null>(null);

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
        router.get(route('platforms.index'), params, { preserveState: true, preserveScroll: true });
    }

    function confirmDelete(platform: Platform) {
        setPlatformToDelete(platform);
        setDialogOpen(true);
    }

    function handleDelete() {
        if (platformToDelete) {
            router.delete(route('platforms.destroy', { platform: platformToDelete.id }));
            setDialogOpen(false);
        }
    }

    const columns: ColumnDef<Platform>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
        },
        {
            accessorKey: 'url',
            header: 'URL',
            cell: ({ row }) => {
                const url = row.getValue('url') as string | null;
                return url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {url}
                    </a>
                ) : null;
            },
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('is_active') as boolean;
                return (
                    <span className={`rounded px-2 py-1 text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const platform = row.original;
                return (
                    <div className="flex justify-end gap-2">
                        <Link href={route('platforms.edit', { platform: platform.id })}>
                            <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(platform)}>
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
            <Head title="Platforms" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Platforms" className="mb-0" />
                <Link href={route('platforms.create')}>
                    <Button>Create Platform</Button>
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
                                placeholder="Search platforms..."
                            />
                            <Button type="submit">Search</Button>
                        </div>
                    </form>
                </div>

                <DataTable columns={columns} data={platforms.data} links={platforms.links} />

                <ConfirmationDialog
                    title="Confirm Deletion"
                    description={`Are you sure you want to delete ${platformToDelete?.name}?`}
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

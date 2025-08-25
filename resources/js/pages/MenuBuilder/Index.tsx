import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Platform } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Menu, PanelRight } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    platforms: Platform[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Menu Builder',
        href: route('menu-builder.index'),
    },
];

export default function Index({ platforms }: Props) {
    const [search, setSearch] = useState('');
    const [filteredPlatforms, setFilteredPlatforms] = useState(platforms);

    useEffect(() => {
        if (search) {
            const filtered = platforms.filter(
                (platform) =>
                    platform.name.toLowerCase().includes(search.toLowerCase()) || platform.slug.toLowerCase().includes(search.toLowerCase()),
            );
            setFilteredPlatforms(filtered);
        } else {
            setFilteredPlatforms(platforms);
        }
    }, [search, platforms]);

    const columns: ColumnDef<Platform>[] = [
        {
            accessorKey: 'name',
            header: 'Platform Name',
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
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
                        <Link href={route('menu-builder.edit', { platform: platform.id })}>
                            <Button variant="outline" className="flex items-center gap-1">
                                <Menu className="h-4 w-4" />
                                <span>Manage Menus</span>
                            </Button>
                        </Link>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Builder" />
            <div className="my-4 flex items-center justify-between px-5">
                <Heading title="Menu Builder" className="mb-0" />
            </div>

            <div className="p-6">
                <div className="mb-6 flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                        <PanelRight className="h-5 w-5 text-gray-500" />
                        <h2 className="text-lg font-medium">Select a Platform to Manage its Menus</h2>
                    </div>
                    <div>
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="Search platforms..."
                        />
                    </div>
                </div>

                <DataTable columns={columns} data={filteredPlatforms} />
            </div>
        </AppLayout>
    );
}

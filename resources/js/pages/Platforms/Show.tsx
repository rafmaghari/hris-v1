import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Platform } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Platforms',
        href: '/platforms',
    },
    {
        title: 'Details',
        href: '#',
    },
];

type Props = {
    platform: Platform;
};

export default function Show({ platform }: Props) {
    function confirmDelete() {
        if (confirm(`Are you sure you want to delete ${platform.name}?`)) {
            router.delete(`/platforms/${platform.id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={platform.name} />
            <div className="mb-6 flex items-center justify-between">
                <Heading title={platform.name} />
                <div className="flex gap-2">
                    <Link href="/platforms">
                        <Button variant="outline">Back</Button>
                    </Link>
                    <Link href={`/platforms/${platform.id}/edit`}>
                        <Button>Edit</Button>
                    </Link>
                    <Button variant="destructive" onClick={confirmDelete}>
                        Delete
                    </Button>
                </div>
            </div>

            <Card className="p-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">Name</h3>
                        <p className="text-lg">{platform.name}</p>
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">Slug</h3>
                        <p className="text-lg">{platform.slug}</p>
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">Description</h3>
                        {platform.description ? (
                            <p className="text-lg whitespace-pre-wrap">{platform.description}</p>
                        ) : (
                            <p className="text-lg text-gray-400">No description provided</p>
                        )}
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">URL</h3>
                        {platform.url ? (
                            <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 hover:underline">
                                {platform.url}
                            </a>
                        ) : (
                            <p className="text-lg text-gray-400">No URL provided</p>
                        )}
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">Status</h3>
                        <span
                            className={`rounded-full px-3 py-1 text-sm ${
                                platform.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {platform.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">Created</h3>
                        <p className="text-lg">{new Date(platform.created_at).toLocaleString()}</p>
                    </div>

                    <div>
                        <h3 className="mb-1 text-sm font-medium text-gray-500">Last Updated</h3>
                        <p className="text-lg">{new Date(platform.updated_at).toLocaleString()}</p>
                    </div>
                </div>
            </Card>
        </AppLayout>
    );
}

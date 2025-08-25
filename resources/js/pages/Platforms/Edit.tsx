import Heading from '@/components/heading';
import PlatformForm from '@/components/platforms/PlatformForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Platform } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';

type Company = {
    id: number;
    name: string;
};

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
        title: 'Edit',
        href: '#',
    },
];

type Props = {
    platform: Platform & { companies: Company[] };
    companies: Company[];
    selectedCompanyIds: number[];
};

export default function Edit({ platform, companies, selectedCompanyIds }: Props) {
    const platformUrl = platform.url || '';

    const { data, setData, put, processing, errors } = useForm({
        id: platform.id || undefined,
        name: platform.name,
        slug: platform.slug,
        description: platform.description || '',
        url: platformUrl,
        secret_key: platform.secret_key,
        is_active: platform.is_active,
        company_ids: selectedCompanyIds,
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('platforms.update', { platform: platform.id }), {
            onSuccess: () => {
                toast.itemUpdated(data.name, 'Platform');
            },
            onError: () => {
                toast.error('Failed to update platform. Please try again.');
            },
        });
    }

    function refreshData() {
        router.reload();
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${platform.name}`} />
            <div className="my-4 flex items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                    <Heading title={`Edit ${platform.name}`} className="mb-0" />
                    <Button variant="outline" size="sm" onClick={refreshData}>
                        Refresh Data
                    </Button>
                </div>
                <Link href={route('platforms.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <PlatformForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Update Platform"
                    onSubmit={handleSubmit}
                    companies={companies}
                    selectedCompanyIds={selectedCompanyIds}
                />
            </div>
        </AppLayout>
    );
}

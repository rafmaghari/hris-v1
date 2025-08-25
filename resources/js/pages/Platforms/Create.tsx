import Heading from '@/components/heading';
import PlatformForm from '@/components/platforms/PlatformForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

type Company = {
    id: number;
    name: string;
};

interface CreateProps {
    companies: Company[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Platforms',
        href: route('platforms.index'),
    },
    {
        title: 'Create',
        href: route('platforms.create'),
    },
];

type PlatformForm = {
    name: string;
    slug: string;
    description: string;
    url: string;
    is_active: boolean;
    company_ids: number[];
};

export default function Create({ companies }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm<PlatformForm>({
        name: '',
        slug: '',
        description: '',
        url: '',
        is_active: true,
        company_ids: [],
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('platforms.store'), {
            onSuccess: () => {
                toast.itemCreated(data.name, 'Platform');
            },
            onError: () => {
                toast.error('Failed to create platform. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Platform" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Create Platform" className="mb-0" />
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
                    submitButtonText="Create Platform"
                    onSubmit={handleSubmit}
                    companies={companies}
                />
            </div>
        </AppLayout>
    );
}

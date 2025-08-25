import CompanyForm from '@/components/companies/CompanyForm';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Companies',
        href: route('companies.index'),
    },
    {
        title: 'Create',
        href: route('companies.create'),
    },
];

type CompanyForm = {
    name: string;
    domain: string;
    description: string;
};

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<CompanyForm>({
        name: '',
        domain: '',
        description: '',
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('companies.store'), {
            onSuccess: () => {
                toast.itemCreated(data.name, 'Company');
            },
            onError: () => {
                toast.error('Failed to create company. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Company" />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title="Create Company" className="mb-0" />
                <Link href={route('companies.index')}>
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <div className="p-6">
                <CompanyForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    submitButtonText="Create Company"
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}

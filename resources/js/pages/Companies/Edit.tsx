import CompanyForm from '@/components/companies/CompanyForm';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Company } from '@/types';
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
        title: 'Edit',
        href: '#',
    },
];

type Props = {
    company: Company;
};

export default function Edit({ company }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: company.name || '',
        domain: company.domain || '',
        description: company.description || '',
    });

    const toast = useToast();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('companies.update', { company: company.id }), {
            onSuccess: () => {
                toast.itemUpdated(data.name, 'Company');
            },
            onError: () => {
                toast.error('Failed to update company. Please try again.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${company.name}`} />
            <div className="my-4 flex items-center justify-between px-6">
                <Heading title={`Edit ${company.name}`} className="mb-0" />
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
                    submitButtonText="Update Company"
                    onSubmit={handleSubmit}
                />
            </div>
        </AppLayout>
    );
}

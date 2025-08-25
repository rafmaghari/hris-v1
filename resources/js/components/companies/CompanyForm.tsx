import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Input } from '../ui/input';

type CompanyFormData = {
    name: string;
    domain: string;
    description: string;
};

type CompanyFormProps = {
    data: CompanyFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    submitButtonText: string;
    onSubmit: (e: React.FormEvent) => void;
};

export default function CompanyForm({ data, setData, errors, processing, submitButtonText, onSubmit }: CompanyFormProps) {
    return (
        <form onSubmit={onSubmit}>
            <div className="mb-4">
                <label htmlFor="name" className="mb-1 block text-sm">
                    Name
                </label>
                <Input
                    id="name"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
            </div>

            <div className="mb-4">
                <label htmlFor="domain" className="mb-1 block text-sm">
                    Domain
                </label>
                <Input
                    id="domain"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={data.domain}
                    onChange={(e) => setData('domain', e.target.value)}
                />
                {errors.domain && <div className="mt-1 text-sm text-red-600">{errors.domain}</div>}
            </div>

            <div className="mb-4">
                <label htmlFor="description" className="mb-1 block text-sm">
                    Description
                </label>
                <textarea
                    id="description"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={4}
                />
                {errors.description && <div className="mt-1 text-sm text-red-600">{errors.description}</div>}
            </div>

            <div className="flex justify-end gap-2">
                <Link href={route('companies.index')}>
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                    {submitButtonText}
                </Button>
            </div>
        </form>
    );
}

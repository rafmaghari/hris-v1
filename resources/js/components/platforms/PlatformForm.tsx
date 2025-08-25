import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { debounce, generateSlug } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

type Company = {
    id: number;
    name: string;
};

type PlatformFormData = {
    id?: number;
    name: string;
    slug: string;
    description: string;
    url: string;
    secret_key?: string;
    is_active: boolean;
    company_ids: number[];
};

type PlatformFormProps = {
    data: PlatformFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    submitButtonText: string;
    onSubmit: (e: React.FormEvent) => void;
    companies?: Company[];
    selectedCompanyIds?: number[];
};

export default function PlatformForm({
    data,
    setData,
    errors,
    processing,
    submitButtonText,
    onSubmit,
    companies = [],
    selectedCompanyIds = [],
}: PlatformFormProps) {
    console.log(data);
    const slugManuallyEditedRef = useRef(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [regeneratingKey, setRegeneratingKey] = useState(false);

    const updateSlug = useCallback(
        debounce((name: string) => {
            if (!slugManuallyEditedRef.current) {
                setData('slug', generateSlug(name));
            }
        }, 300),
        [],
    );

    // Handle name changes
    useEffect(() => {
        // Skip slug generation on initial load to respect DB values in edit mode
        if (isInitialLoad) {
            setIsInitialLoad(false);
            return;
        }

        // Generate slug when name changes (but not if user has manually edited the slug)
        updateSlug(data.name);
    }, [data.name, updateSlug]);

    // Initialize company_ids with selectedCompanyIds on component mount
    useEffect(() => {
        if (selectedCompanyIds.length > 0) {
            setData('company_ids', selectedCompanyIds);
        }
    }, [selectedCompanyIds, setData]);

    // Toggle company selection
    const toggleCompany = (companyId: number) => {
        const currentIds = data.company_ids || [];
        if (currentIds.includes(companyId)) {
            setData(
                'company_ids',
                currentIds.filter((id) => id !== companyId),
            );
        } else {
            setData('company_ids', [...currentIds, companyId]);
        }
    };

    const handleRegenerateSecretKey = () => {
        if (!data.id) return; // Only allow regenerating for existing platforms

        setRegeneratingKey(true);
        router.post(
            route('platforms.regenerate-key', data.id),
            {},
            {
                onSuccess: (page: any) => {
                    // Update the secret key from the response data
                    const responseData = page.props?.platform;
                    if (responseData && typeof responseData.secret_key === 'string') {
                        setData('secret_key', responseData.secret_key);
                    }
                    setRegeneratingKey(false);
                },
                onError: (errors) => {
                    console.error('Failed to regenerate secret key:', errors);
                    setRegeneratingKey(false);
                },
            },
        );
    };

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
                <label htmlFor="slug" className="mb-1 block text-sm">
                    Slug
                </label>
                <Input
                    id="slug"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={data.slug}
                    onChange={(e) => {
                        slugManuallyEditedRef.current = true;
                        setData('slug', e.target.value);
                    }}
                />
                {errors.slug && <div className="mt-1 text-sm text-red-600">{errors.slug}</div>}
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

            <div className="mb-4">
                <label htmlFor="url" className="mb-1 block text-sm">
                    URL
                </label>

                {/* Replace Input component with a standard HTML input for testing */}
                <input
                    id="url"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={data.url || ''}
                    onChange={(e) => {
                        setData('url', e.target.value);
                    }}
                    placeholder="Enter URL"
                />

                {errors.url && <div className="mt-1 text-sm text-red-600">{errors.url}</div>}
            </div>

            <div className="mb-4">
                <label htmlFor="secret_key" className="mb-1 block text-sm">
                    Secret Key
                </label>
                <div className="flex gap-2">
                    <input
                        id="secret_key"
                        type="text"
                        className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 font-mono text-sm"
                        value={data.secret_key || ''}
                        readOnly
                    />
                    <Button type="button" variant="outline" onClick={handleRegenerateSecretKey} disabled={regeneratingKey || !data.id}>
                        {regeneratingKey ? 'Regenerating...' : 'Regenerate'}
                    </Button>
                </div>
                {!data.id && (
                    <div className="mt-1 text-xs text-gray-500">
                        A secure secret key will be automatically generated when the platform is created.
                    </div>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="companies" className="mb-1 block text-sm">
                    Companies
                </label>
                <div className="rounded-md border p-2">
                    <ScrollArea className="h-60 w-full">
                        <div className="space-y-2 p-2">
                            {companies.map((company) => (
                                <div key={company.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`company-${company.id}`}
                                        checked={(data.company_ids || []).includes(company.id)}
                                        onCheckedChange={() => toggleCompany(company.id)}
                                    />
                                    <label htmlFor={`company-${company.id}`} className="cursor-pointer text-sm">
                                        {company.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                {errors.company_ids && <div className="mt-1 text-sm text-red-600">{errors.company_ids}</div>}
            </div>

            <div className="mb-6">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />
                    <span className="font-medium">Active</span>
                </label>
                {errors.is_active && <div className="mt-1 text-sm text-red-600">{errors.is_active}</div>}
            </div>

            <div className="flex justify-end gap-2">
                <Link href={route('platforms.index')}>
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

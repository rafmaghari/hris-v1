import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

type PermissionFormData = {
    name: string;
};

type PermissionFormProps = {
    data: PermissionFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    submitButtonText: string;
    onSubmit: (e: React.FormEvent) => void;
};

export default function PermissionForm({ data, setData, errors, processing, submitButtonText, onSubmit }: PermissionFormProps) {
    return (
        <form onSubmit={onSubmit}>
            <div className="mb-6">
                <label htmlFor="name" className="mb-1 block text-sm">
                    Permission Name
                </label>
                <Input
                    id="name"
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                />
                <p className="mt-1 text-sm text-gray-500">Use a descriptive name like 'create users' or 'delete posts'</p>
                {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
            </div>

            <div className="flex justify-end gap-2">
                <Link href={route('permissions.index')}>
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

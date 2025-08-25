import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

type GroupFormData = {
    name: string;
    description: string;
    status: number;
};

type GroupFormProps = {
    data: GroupFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    submitButtonText: string;
    onSubmit: (e: React.FormEvent) => void;
    isEditMode?: boolean;
};

type StatusOption = {
    value: number;
    label: string;
};

const statusOptions: StatusOption[] = [
    { value: 1, label: 'Active' },
    { value: 2, label: 'Inactive' },
];

export default function GroupForm({ data, setData, errors, processing, submitButtonText, onSubmit, isEditMode = false }: GroupFormProps) {
    return (
        <form onSubmit={onSubmit}>
            <div className="mb-4">
                <label htmlFor="name" className="mb-1 block text-sm">
                    Group Name
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
                <label htmlFor="description" className="mb-1 block text-sm">
                    Description
                </label>
                <Textarea
                    id="description"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && <div className="mt-1 text-sm text-red-600">{errors.description}</div>}
            </div>

            <div className="mb-4">
                <label htmlFor="status" className="mb-1 block text-sm">
                    Status
                </label>
                <Select value={String(data.status)} onValueChange={(value) => setData('status', Number(value))}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.status && <div className="mt-1 text-sm text-red-600">{errors.status}</div>}
            </div>

            <div className="flex justify-end gap-2">
                <Link href={route('groups.index')}>
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

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Permission } from '@/types';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

type RoleFormData = {
    name: string;
    permissions: number[];
};

type RoleFormProps = {
    data: RoleFormData;
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    submitButtonText: string;
    onSubmit: (e: React.FormEvent) => void;
    permissions: Permission[];
};

export default function RoleForm({ data, setData, errors, processing, submitButtonText, onSubmit, permissions }: RoleFormProps) {
    const togglePermission = (permissionId: number) => {
        const permissionIndex = data.permissions.indexOf(permissionId);

        if (permissionIndex === -1) {
            // Permission is not selected, add it
            setData('permissions', [...data.permissions, permissionId]);
        } else {
            // Permission is already selected, remove it
            setData(
                'permissions',
                data.permissions.filter((id) => id !== permissionId),
            );
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="mb-4">
                <label htmlFor="name" className="mb-1 block text-sm">
                    Role Name
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

            <div className="mb-6">
                <label className="mb-1 block text-sm">Permissions</label>
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-2">
                            <Checkbox
                                id={`permission-${permission.id}`}
                                checked={data.permissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <label
                                htmlFor={`permission-${permission.id}`}
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {permission.name}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.permissions && <div className="mt-1 text-sm text-red-600">{errors.permissions}</div>}
            </div>

            <div className="flex justify-end gap-2">
                <Link href={route('roles.index')}>
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

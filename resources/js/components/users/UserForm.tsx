import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { ChangeEvent } from 'react';

interface Props {
    user?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        position_id: number | null;
        department_id: number | null;
        manager_id: number | null;
        date_hired: string | null;
        employment_type: string | null;
        status: number;
        end_at: string | null;
        roles: number[];
    };
    positions: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    managers: Array<{ id: number; name: string }>;
    employmentTypes: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
    roles: Array<{ id: number; name: string }>;
}

export default function UserForm({ user, positions, departments, managers, employmentTypes, statuses, roles }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        first_name: user?.first_name ?? '',
        last_name: user?.last_name ?? '',
        email: user?.email ?? '',
        position_id: user?.position_id?.toString() ?? '',
        department_id: user?.department_id?.toString() ?? '',
        manager_id: user?.manager_id?.toString() ?? '',
        date_hired: user?.date_hired ?? '',
        employment_type: user?.employment_type ?? '',
        status: user?.status?.toString() ?? '',
        end_at: user?.end_at ?? '',
        roles: user?.roles ?? [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            put(route('users.update', user.id));
        } else {
            post(route('users.store'));
        }
    };

    const handleRoleChange = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData(
                'roles',
                data.roles.filter((id) => id !== roleId),
            );
        }
    };

    const handleInputChange = (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
        setData(field as any, e.target.value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className="max-w-6xl">
                <CardHeader>
                    <CardTitle>{user ? 'Edit User' : 'Create User'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input id="first_name" value={data.first_name} onChange={handleInputChange('first_name')} required />
                            {errors.first_name && <p className="text-destructive text-sm">{errors.first_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input id="last_name" value={data.last_name} onChange={handleInputChange('last_name')} required />
                            {errors.last_name && <p className="text-destructive text-sm">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" value={data.email} onChange={handleInputChange('email')} required />
                        {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                    </div>

                    {/* Employment Information */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="position_id">Position</Label>
                            <Select value={data.position_id} onValueChange={(value) => setData('position_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((position) => (
                                        <SelectItem key={position.id} value={position.id.toString()}>
                                            {position.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.position_id && <p className="text-destructive text-sm">{errors.position_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department_id">Department</Label>
                            <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((department) => (
                                        <SelectItem key={department.id} value={department.id.toString()}>
                                            {department.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.department_id && <p className="text-destructive text-sm">{errors.department_id}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="manager_id">Manager</Label>
                            <Select value={data.manager_id} onValueChange={(value) => setData('manager_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    {managers.map((manager) => (
                                        <SelectItem key={manager.id} value={manager.id.toString()}>
                                            {manager.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.manager_id && <p className="text-destructive text-sm">{errors.manager_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_hired">Date Hired</Label>
                            <Input id="date_hired" type="date" value={data.date_hired} onChange={handleInputChange('date_hired')} />
                            {errors.date_hired && <p className="text-destructive text-sm">{errors.date_hired}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="employment_type">Employment Type</Label>
                            <Select value={data.employment_type} onValueChange={(value) => setData('employment_type', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employment type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employmentTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employment_type && <p className="text-destructive text-sm">{errors.employment_type}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-destructive text-sm">{errors.status}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="end_at">End Date</Label>
                        <Input id="end_at" type="date" value={data.end_at} onChange={handleInputChange('end_at')} />
                        {errors.end_at && <p className="text-destructive text-sm">{errors.end_at}</p>}
                    </div>

                    {/* Roles */}
                    <div className="space-y-3">
                        <Label>Roles</Label>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={data.roles.includes(role.id)}
                                        onCheckedChange={(checked) => handleRoleChange(role.id, !!checked)}
                                    />
                                    <Label htmlFor={`role-${role.id}`} className="text-sm">
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {errors.roles && <p className="text-destructive text-sm">{errors.roles}</p>}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div></div>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Saving...' : user ? 'Update User' : 'Create User'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

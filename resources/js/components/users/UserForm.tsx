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
        password: '',
        position_id: user?.position_id?.toString() ?? '',
        department_id: user?.department_id?.toString() ?? '',
        manager_id: user?.manager_id?.toString() ?? '',
        date_hired: user?.date_hired ? new Date(user.date_hired).toISOString().split('T')[0] : '',
        employment_type: user?.employment_type ?? '',
        status: user?.status ?? 1,
        end_at: user?.end_at ? new Date(user.end_at).toISOString().split('T')[0] : '',
        roles: user?.roles ?? [],
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (user) {
            put(route('users.update', user.id));
        } else {
            post(route('users.store'));
        }
    }

    const handleRoleChange = (roleId: number) => {
        const currentRoles = Array.isArray(data.roles) ? [...data.roles] : [];
        const index = currentRoles.indexOf(roleId);

        if (index > -1) {
            currentRoles.splice(index, 1);
        } else {
            currentRoles.push(roleId);
        }

        setData('roles', currentRoles);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{user ? 'Edit User' : 'Create User'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                value={data.first_name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('first_name', e.target.value)}
                                className={errors.first_name ? 'border-red-500' : ''}
                            />
                            {errors.first_name && <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={data.last_name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('last_name', e.target.value)}
                                className={errors.last_name ? 'border-red-500' : ''}
                            />
                            {errors.last_name && <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
                            className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>

                    {!user && (
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="position_id">Position</Label>
                            <Select value={data.position_id} onValueChange={(value) => setData('position_id', value)}>
                                <SelectTrigger className={errors.position_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select Position" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((position) => (
                                        <SelectItem key={position.id} value={position.id.toString()}>
                                            {position.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.position_id && <p className="mt-1 text-sm text-red-500">{errors.position_id}</p>}
                        </div>
                        <div>
                            <Label htmlFor="department_id">Department</Label>
                            <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                                <SelectTrigger className={errors.department_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((department) => (
                                        <SelectItem key={department.id} value={department.id.toString()}>
                                            {department.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.department_id && <p className="mt-1 text-sm text-red-500">{errors.department_id}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="manager_id">Manager</Label>
                            <Select value={data.manager_id} onValueChange={(value) => setData('manager_id', value)}>
                                <SelectTrigger className={errors.manager_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select Manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    {managers.map((manager) => (
                                        <SelectItem key={manager.id} value={manager.id.toString()}>
                                            {manager.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.manager_id && <p className="mt-1 text-sm text-red-500">{errors.manager_id}</p>}
                        </div>
                        <div>
                            <Label htmlFor="date_hired">Date Hired</Label>
                            <Input
                                id="date_hired"
                                type="date"
                                value={data.date_hired}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('date_hired', e.target.value)}
                                className={errors.date_hired ? 'border-red-500' : ''}
                            />
                            {errors.date_hired && <p className="mt-1 text-sm text-red-500">{errors.date_hired}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="employment_type">Employment Type</Label>
                            <Select value={data.employment_type} onValueChange={(value) => setData('employment_type', value)}>
                                <SelectTrigger className={errors.employment_type ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select Employment Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employmentTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employment_type && <p className="mt-1 text-sm text-red-500">{errors.employment_type}</p>}
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={String(data.status)} onValueChange={(value) => setData('status', Number(value))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        { value: 1, label: 'Active' },
                                        { value: 2, label: 'Inactive' },
                                    ].map((option) => (
                                        <SelectItem key={option.value} value={String(option.value)}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="end_at">End Date</Label>
                        <Input
                            id="end_at"
                            type="date"
                            value={data.end_at}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('end_at', e.target.value)}
                            className={errors.end_at ? 'border-red-500' : ''}
                        />
                        {errors.end_at && <p className="mt-1 text-sm text-red-500">{errors.end_at}</p>}
                    </div>

                    <div>
                        <Label>Roles</Label>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={data.roles?.includes(role.id)}
                                        onCheckedChange={() => handleRoleChange(role.id)}
                                    />
                                    <Label htmlFor={`role-${role.id}`} className="cursor-pointer text-sm font-normal">
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {errors.roles && <p className="mt-1 text-sm text-red-500">{errors.roles}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={processing}>
                        {user ? 'Update' : 'Create'} User
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}

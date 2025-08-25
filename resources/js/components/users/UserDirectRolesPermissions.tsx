import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { Edit } from 'lucide-react';
import { useEffect, useState } from 'react';

type Role = {
    id: number;
    name: string;
};

type Permission = {
    id: number;
    name: string;
};

type Props = {
    userId: number;
    roles: Role[];
    permissions: Permission[];
    userRoles: number[];
    userPermissions: number[];
};

export default function UserDirectRolesPermissions({ userId, roles, permissions, userRoles = [], userPermissions = [] }: Props) {
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // Initialize state with user's current roles and permissions
    useEffect(() => {
        setSelectedRoles(userRoles.map(Number));
        setSelectedPermissions(userPermissions.map(Number));
    }, [userRoles, userPermissions]);

    const toggleRole = (roleId: number, checked: boolean | string) => {
        setSelectedRoles((current) => (checked ? [...current, roleId] : current.filter((id) => id !== roleId)));
    };

    const togglePermission = (permissionId: number, checked: boolean | string) => {
        setSelectedPermissions((current) => (checked ? [...current, permissionId] : current.filter((id) => id !== permissionId)));
    };

    const updateUserRolesPermissions = () => {
        setIsLoading(true);

        router.post(
            route('users.direct-access', { user: userId }),
            {
                role_ids: selectedRoles,
                permission_ids: selectedPermissions,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    toast.success('User roles and permissions updated successfully');
                    setIsLoading(false);

                    // Refresh the page to get updated data
                    router.visit(route('users.edit', { user: userId }), {
                        preserveScroll: true,
                    });
                },
                onError: (errors) => {
                    toast.error('Failed to update user roles and permissions');
                    setIsLoading(false);
                },
            },
        );
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Direct User Roles &amp; Permissions</CardTitle>
                    <Button size="sm" onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Access
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-md border p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium">Assigned Roles</h3>
                            <Badge className="bg-blue-100 text-blue-800">{userRoles.length}</Badge>
                        </div>
                        {userRoles.length === 0 ? (
                            <p className="text-sm text-gray-500">No roles assigned</p>
                        ) : (
                            <div className="space-y-1">
                                {userRoles.map((roleId) => {
                                    const role = roles.find((r) => r.id === roleId);
                                    return (
                                        <div key={roleId} className="text-sm">
                                            {role?.name || `Role ${roleId}`}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="rounded-md border p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium">Assigned Permissions</h3>
                            <Badge className="bg-purple-100 text-purple-800">{userPermissions.length}</Badge>
                        </div>
                        {userPermissions.length === 0 ? (
                            <p className="text-sm text-gray-500">No permissions assigned</p>
                        ) : (
                            <div className="space-y-1">
                                {userPermissions.map((permissionId) => {
                                    const permission = permissions.find((p) => p.id === permissionId);
                                    return (
                                        <div key={permissionId} className="text-sm">
                                            {permission?.name || `Permission ${permissionId}`}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>Edit User Roles &amp; Permissions</DialogTitle>
                            <DialogDescription>Assign direct roles and permissions to this user.</DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-sm font-medium">Roles</h3>
                                <div className="rounded-md border">
                                    <ScrollArea className="h-60">
                                        <div className="space-y-2 p-2">
                                            {roles.map((role) => {
                                                const roleId = Number(role.id);
                                                return (
                                                    <div key={roleId} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`role-${roleId}`}
                                                            checked={selectedRoles.includes(roleId)}
                                                            onCheckedChange={(checked) => toggleRole(roleId, checked)}
                                                        />
                                                        <label htmlFor={`role-${roleId}`} className="cursor-pointer text-sm">
                                                            {role.name}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-sm font-medium">Permissions</h3>
                                <div className="rounded-md border">
                                    <ScrollArea className="h-60">
                                        <div className="space-y-2 p-2">
                                            {permissions.map((permission) => {
                                                const permissionId = Number(permission.id);
                                                return (
                                                    <div key={permissionId} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`permission-${permissionId}`}
                                                            checked={selectedPermissions.includes(permissionId)}
                                                            onCheckedChange={(checked) => togglePermission(permissionId, checked)}
                                                        />
                                                        <label htmlFor={`permission-${permissionId}`} className="cursor-pointer text-sm">
                                                            {permission.name}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button onClick={updateUserRolesPermissions} disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Access'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

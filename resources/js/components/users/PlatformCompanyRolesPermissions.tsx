import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';
import { Edit, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

type Platform = {
    id: number;
    name: string;
};

type Company = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
};

type Permission = {
    id: number;
    name: string;
};

type PlatformCompanyAccess = {
    platformId: string;
    companyId: string;
    roles: number[];
    permissions: number[];
    key: string;
};

type Props = {
    userId: number;
    platforms: Platform[];
    companies: Company[];
    roles: Role[];
    permissions: Permission[];
    userRolesByPlatformCompany: Record<string, number[]>;
    userPermissionsByPlatformCompany: Record<string, number[]>;
};

const refreshUserData = (userId: number) => {
    // Use Inertia visit to reload the edit page with fresh data
    router.visit(route('users.edit', { user: userId }), {
        preserveScroll: true,
        onSuccess: () => {
            // Success callback without console.log
        },
    });
};

export default function PlatformCompanyRolesPermissions({
    userId,
    platforms,
    companies,
    roles,
    permissions,
    userRolesByPlatformCompany = {},
    userPermissionsByPlatformCompany = {},
}: Props) {
    const [accessList, setAccessList] = useState<PlatformCompanyAccess[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingAccessIndex, setEditingAccessIndex] = useState<number | null>(null);

    // For new access
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const toast = useToast();

    // Generate a key for platform-company combination
    const getPlatformCompanyKey = (platformId: string, companyId: string) => `${platformId}-${companyId}`;

    // Load existing access on component mount
    useEffect(() => {
        const access: PlatformCompanyAccess[] = [];
        Object.keys(userRolesByPlatformCompany).forEach((key) => {
            const [platformId, companyId] = key.split('-');
            access.push({
                platformId,
                companyId,
                roles: (userRolesByPlatformCompany[key] || []).map(Number),
                permissions: (userPermissionsByPlatformCompany[key] || []).map(Number),
                key,
            });
        });
        setAccessList(access);
    }, [userRolesByPlatformCompany, userPermissionsByPlatformCompany]);

    // Reset form fields when add dialog opens
    useEffect(() => {
        if (isAddDialogOpen) {
            setSelectedPlatform('');
            setSelectedCompany('');
            setSelectedRoles([]);
            setSelectedPermissions([]);
        }
    }, [isAddDialogOpen]);

    // Load data for editing when edit dialog opens
    useEffect(() => {
        if (isEditDialogOpen && editingAccessIndex !== null) {
            const access = accessList[editingAccessIndex];
            setSelectedPlatform(access.platformId);
            setSelectedCompany(access.companyId);
            setSelectedRoles([...access.roles]);
            setSelectedPermissions([...access.permissions]);
        }
    }, [isEditDialogOpen, editingAccessIndex, accessList]);

    const addNewAccess = async () => {
        if (!selectedPlatform || !selectedCompany) {
            toast.error('Please select both a platform and a company');
            return;
        }

        // Check if this combination already exists
        const key = getPlatformCompanyKey(selectedPlatform, selectedCompany);
        if (accessList.some((a) => a.key === key)) {
            toast.error('This platform-company combination already exists');
            return;
        }

        const newAccess = {
            platformId: selectedPlatform,
            companyId: selectedCompany,
            roles: selectedRoles,
            permissions: selectedPermissions,
            key,
        };

        // Now save to server
        setAddLoading(true);

        // Save roles and permissions for this platform-company-user using Inertia
        router.post(
            route('users.platform-company.access', {
                user: userId,
                platform: selectedPlatform,
                company: selectedCompany,
            }),
            {
                role_ids: selectedRoles,
                permission_ids: selectedPermissions,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // First close the dialog
                    setIsAddDialogOpen(false);

                    // Then add to local state for immediate feedback
                    setAccessList((prev) => [...prev, newAccess]);

                    // Show success message
                    toast.success('Access added successfully');

                    // Reset loading state
                    setAddLoading(false);

                    // Fetch fresh data from server
                    refreshUserData(userId);
                },
                onError: (errors) => {
                    toast.error('Failed to save access');
                    setAddLoading(false);
                },
                onFinish: () => {
                    if (document.visibilityState === 'hidden') {
                        setAddLoading(false);
                    }
                },
            },
        );
    };

    const updateAccess = () => {
        if (editingAccessIndex === null) return;

        const access = accessList[editingAccessIndex];
        setIsLoading(true);

        // Update both roles and permissions in a single request
        router.post(
            route('users.platform-company.access', {
                user: userId,
                platform: access.platformId,
                company: access.companyId,
            }),
            {
                role_ids: selectedRoles,
                permission_ids: selectedPermissions,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Close the dialog before refreshing data
                    setIsEditDialogOpen(false);
                    setEditingAccessIndex(null);

                    // First update local state for immediate feedback
                    const updatedAccessList = [...accessList];
                    updatedAccessList[editingAccessIndex] = {
                        ...updatedAccessList[editingAccessIndex],
                        roles: selectedRoles,
                        permissions: selectedPermissions,
                    };
                    setAccessList(updatedAccessList);

                    // Show success message
                    toast.success('Access updated successfully');

                    // Then fetch fresh data from server
                    refreshUserData(userId);

                    setIsLoading(false);
                },
                onError: (errors) => {
                    toast.error('Failed to update access');
                    setIsLoading(false);
                },
            },
        );
    };

    const openEditDialog = (index: number) => {
        setEditingAccessIndex(index);
        setIsEditDialogOpen(true);
    };

    const removeAccess = (index: number) => {
        const access = accessList[index];

        // Clear both roles and permissions with a single call
        router.post(
            route('users.platform-company.access', {
                user: userId,
                platform: access.platformId,
                company: access.companyId,
            }),
            {
                role_ids: [],
                permission_ids: [],
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    const newList = [...accessList];
                    newList.splice(index, 1);
                    setAccessList(newList);
                    toast.success('Access removed successfully');
                    refreshUserData(userId);
                },
                onError: (errors) => {
                    toast.error('Failed to remove access');
                },
            },
        );
    };

    const toggleRole = (roleId: number, checked: boolean | string) => {
        setSelectedRoles((current) => (checked ? [...current, roleId] : current.filter((id) => id !== roleId)));
    };

    const togglePermission = (permissionId: number, checked: boolean | string) => {
        setSelectedPermissions((current) => (checked ? [...current, permissionId] : current.filter((id) => id !== permissionId)));
    };

    const getPlatformName = (platformId: string) => {
        const platform = platforms.find((p) => p.id.toString() === platformId);
        return platform ? platform.name : 'Unknown Platform';
    };

    const getCompanyName = (companyId: string) => {
        const company = companies.find((c) => c.id.toString() === companyId);
        return company ? company.name : 'Unknown Company';
    };

    const renderAccessForm = (isEdit: boolean) => (
        <>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium">Platform</label>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform} disabled={isEdit}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Platforms</SelectLabel>
                                {platforms.map((platform) => (
                                    <SelectItem key={platform.id} value={platform.id.toString()}>
                                        {platform.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Company</label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany} disabled={!selectedPlatform || isEdit}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Companies</SelectLabel>
                                {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id.toString()}>
                                        {company.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedPlatform && selectedCompany && (
                <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <h3 className="mb-2 text-sm font-medium">Roles</h3>
                            <div className="rounded-md border">
                                <ScrollArea className="h-36">
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
                                <ScrollArea className="h-36">
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
                </>
            )}
        </>
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Platform &amp; Company Access</CardTitle>
                    <div className="flex space-x-2">
                        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Access
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {accessList.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">No platform-company access found. Click "Add Access" to assign access.</div>
                ) : (
                    <>
                        <div className="mb-6 rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accessList.map((access, index) => {
                                        return (
                                            <TableRow key={access.key}>
                                                <TableCell className="font-medium">{getPlatformName(access.platformId)}</TableCell>
                                                <TableCell>{getCompanyName(access.companyId)}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{access.roles.length}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                                                        {access.permissions.length}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(index)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => removeAccess(index)}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}

                {/* Add Access Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>Add Platform-Company Access</DialogTitle>
                            <DialogDescription>Assign roles and permissions for a platform-company combination.</DialogDescription>
                        </DialogHeader>

                        {renderAccessForm(false)}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={addLoading}>
                                Cancel
                            </Button>
                            <Button onClick={addNewAccess} disabled={!selectedPlatform || !selectedCompany || addLoading}>
                                {addLoading ? 'Saving...' : 'Add Access'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Access Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>Edit Access</DialogTitle>
                            <DialogDescription>Modify roles and permissions for this platform-company combination.</DialogDescription>
                        </DialogHeader>

                        {renderAccessForm(true)}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingAccessIndex(null);
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button onClick={updateAccess} disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Access'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

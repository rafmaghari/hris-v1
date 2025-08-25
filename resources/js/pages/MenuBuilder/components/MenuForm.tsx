import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Permission } from '@/types';
import { Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Menu } from './MenuTree';

interface MenuFormProps {
    isEdit: boolean;
    initialData: {
        name: string;
        slug: string;
        url: string;
        parent_id: number | null;
        is_active: boolean;
        permissions: number[];
    };
    permissions: Permission[];
    allMenus: Menu[];
    selectedMenu?: Menu | null;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (formData: any, isEdit: boolean) => void;
}

export default function MenuForm({ isEdit, initialData, permissions, allMenus, selectedMenu, isSubmitting, onCancel, onSubmit }: MenuFormProps) {
    const [formData, setFormData] = useState(initialData);
    const [selectedParent, setSelectedParent] = useState<string>(initialData.parent_id ? initialData.parent_id.toString() : 'null');

    // Update form data when initialData changes
    useEffect(() => {
        setFormData(initialData);
        // Update the selected parent value when initialData changes
        setSelectedParent(initialData.parent_id ? initialData.parent_id.toString() : 'null');
    }, [initialData]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData, isEdit);
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`${isEdit ? 'edit-' : ''}name`} className="text-right">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`${isEdit ? 'edit-' : ''}name`}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-3"
                        required
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`${isEdit ? 'edit-' : ''}slug`} className="text-right">
                        Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`${isEdit ? 'edit-' : ''}slug`}
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., dashboard-settings"
                        required
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`${isEdit ? 'edit-' : ''}url`} className="text-right">
                        URL
                    </Label>
                    <Input
                        id={`${isEdit ? 'edit-' : ''}url`}
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., /dashboard/users"
                    />
                </div>

                {(!isEdit || (isEdit && selectedMenu)) && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={`${isEdit ? 'edit-' : ''}parent`} className="text-right">
                            Parent Menu
                        </Label>
                        <Select
                            onValueChange={(value) => {
                                setSelectedParent(value);
                                setFormData({
                                    ...formData,
                                    parent_id: value === 'null' ? null : parseInt(value),
                                });
                            }}
                            value={selectedParent}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a parent menu (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">None (Top Level)</SelectItem>
                                {allMenus
                                    .filter((menu) => (isEdit ? menu.id !== selectedMenu?.id : true))
                                    .map((menu) => (
                                        <SelectItem key={menu.id} value={menu.id.toString()}>
                                            {menu.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`${isEdit ? 'edit-' : ''}is_active`} className="text-right">
                        Active
                    </Label>
                    <div className="col-span-3 flex items-center">
                        <Switch
                            id={`${isEdit ? 'edit-' : ''}is_active`}
                            checked={formData.is_active}
                            onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_active: checked })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor={`${isEdit ? 'edit-' : ''}permissions`} className="text-right">
                        Permissions
                    </Label>
                    <div className="col-span-3 space-y-2">
                        <div className="max-h-[200px] overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-2">
                                {permissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${isEdit ? 'edit-' : ''}permission-${permission.id}`}
                                            checked={formData.permissions.includes(permission.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setFormData({
                                                        ...formData,
                                                        permissions: [...formData.permissions, permission.id],
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        permissions: formData.permissions.filter((id) => id !== permission.id),
                                                    });
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`${isEdit ? 'edit-' : ''}permission-${permission.id}`}
                                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {permission.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <span className="flex items-center gap-1">
                            <svg
                                className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            {isEdit ? 'Updating...' : 'Saving...'}
                        </span>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {isEdit ? 'Update Menu' : 'Save Menu'}
                        </>
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}

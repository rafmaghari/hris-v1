import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Check if the user has a specific permission
 *
 * @param permission The permission to check for
 * @returns True if the user has the permission, false otherwise
 */
export function hasPermission(permission: string): boolean {
    const { auth } = usePage<SharedData>().props;
    if (!auth.user?.access?.permissions) {
        return false;
    }

    return auth.user.access.permissions.includes(permission);
}

/**
 * Check if the user has any of the specified permissions
 *
 * @param permissions Array of permissions to check for
 * @returns True if the user has any of the permissions, false otherwise
 */
export function hasAnyPermission(permissions: string[]): boolean {
    const { auth } = usePage<SharedData>().props;
    if (!auth.user?.access?.permissions) {
        return false;
    }

    return permissions.some((permission) => auth.user.access!.permissions.includes(permission));
}

/**
 * Check if the user has all of the specified permissions
 *
 * @param permissions Array of permissions to check for
 * @returns True if the user has all of the permissions, false otherwise
 */
export function hasAllPermissions(permissions: string[]): boolean {
    const { auth } = usePage<SharedData>().props;
    if (!auth.user?.access?.permissions) {
        return false;
    }

    return permissions.every((permission) => auth.user.access!.permissions.includes(permission));
}

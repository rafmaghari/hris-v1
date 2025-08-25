import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Check if the user has a specific role
 *
 * @param role The role to check for
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(role: string): boolean {
    const { auth } = usePage<SharedData>().props;
    if (!auth.user?.roles) {
        return false;
    }

    // In HandleInertiaRequests.php, the roles are passed as strings in an array
    return auth.user.roles.includes(role as any);
}

import { hasAllPermissions, hasAnyPermission, hasPermission } from '@/lib/permissions';
import { hasRole } from '@/lib/roles';
import { ReactNode } from 'react';

type PermissionGuardProps = {
    /**
     * The permission required to render the children
     */
    permission?: string;

    /**
     * Array of permissions - any one of which is required to render the children
     */
    anyPermissions?: string[];

    /**
     * Array of permissions - all of which are required to render the children
     */
    allPermissions?: string[];

    /**
     * The role required to render the children
     */
    role?: string;

    /**
     * Content to render if the user has the required permission(s)
     */
    children: ReactNode;

    /**
     * Content to render if the user doesn't have the required permission(s)
     */
    fallback?: ReactNode;
};

/**
 * Guard component that conditionally renders content based on user permissions
 */
export function PermissionGuard({ permission, anyPermissions, allPermissions, role, children, fallback = null }: PermissionGuardProps) {
    // Check if user has the specific role
    if (role && hasRole(role)) {
        return <>{children}</>;
    }

    // Check if user has the specific permission
    if (permission && hasPermission(permission)) {
        return <>{children}</>;
    }

    // Check if user has any of the permissions
    if (anyPermissions && hasAnyPermission(anyPermissions)) {
        return <>{children}</>;
    }

    // Check if user has all of the permissions
    if (allPermissions && hasAllPermissions(allPermissions)) {
        return <>{children}</>;
    }

    // If no permission checks passed and a permission check was requested, return fallback
    if (permission || anyPermissions || allPermissions || role) {
        return <>{fallback}</>;
    }

    // If no permission checks were requested, render children
    return <>{children}</>;
}

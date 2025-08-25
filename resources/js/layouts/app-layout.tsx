import AdminLayout from '@/layouts/admin/admin-layout';
import UserLayout from '@/layouts/user/user-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { auth } = usePage().props as any;
    const isAdmin = auth.user?.roles?.includes('super_admin');

    return isAdmin ? (
        <AdminLayout breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AdminLayout>
    ) : (
        <UserLayout breadcrumbs={breadcrumbs} {...props}>
            {children}
        </UserLayout>
    );
};

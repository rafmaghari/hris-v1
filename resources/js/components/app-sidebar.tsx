import { AdminSidebar } from '@/components/admin-sidebar';
import { UserSidebar } from '@/components/user-sidebar';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.roles?.some((role) => role.name === 'admin');

    return isAdmin ? <AdminSidebar /> : <UserSidebar />;
}

import ApplicationLogo from '@/components/applicationLogo';
import { NavFooter } from '@/components/nav-footer';
import { NavGroup } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building, LayoutGrid, Shield, Users } from 'lucide-react';
import { route } from 'ziggy-js';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: route('users.index'),
        icon: Users,
    },
    {
        title: 'Roles',
        href: route('roles.index'),
        icon: Shield,
    },
    {
        title: 'Permissions',
        href: route('permissions.index'),
        icon: Shield,
    },
    {
        title: 'Departments',
        href: route('departments.index'),
        icon: Building,
    },
];

const footerNavItems: NavItem[] = [];

export function AdminSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isMobile = useIsMobile();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <ApplicationLogo className="h-10 w-auto" variant="light" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavGroup items={adminNavItems} title="Admin" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

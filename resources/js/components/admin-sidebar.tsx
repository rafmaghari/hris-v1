import ApplicationLogo from '@/components/applicationLogo';
import { NavFooter } from '@/components/nav-footer';
import { NavGroup } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Briefcase, Building, Calendar, LayoutGrid, Shield, UserCog, Users } from 'lucide-react';
import { route } from 'ziggy-js';

// Dashboard navigation
const dashboardNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
    },
];

// User management navigation
const userManagementNavItems: NavItem[] = [
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
];

// Organization management navigation
const organizationNavItems: NavItem[] = [
    {
        title: 'Positions',
        href: route('positions.index'),
        icon: Briefcase,
    },
    {
        title: 'Departments',
        href: route('departments.index'),
        icon: Building,
    },
];

// Leave management navigation
const leaveManagementNavItems: NavItem[] = [
    {
        title: 'Leave Types',
        href: route('leave-types.index'),
        icon: Calendar,
    },
    {
        title: 'Leave Settings Templates',
        href: route('leave-settings-templates.index'),
        icon: Calendar,
    },
    {
        title: 'User Leave Settings',
        href: route('user-leave-settings.index'),
        icon: UserCog,
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
                <NavGroup items={dashboardNavItems} title="Overview" />
                <NavGroup items={userManagementNavItems} title="User Management" />
                <NavGroup items={organizationNavItems} title="Organization" />
                <NavGroup items={leaveManagementNavItems} title="Leave Management" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

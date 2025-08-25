import ApplicationLogo from '@/components/applicationLogo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Briefcase, Building, Clock, LayoutGrid, Users } from 'lucide-react';
import { route } from 'ziggy-js';
import { NavGroup } from './nav-main';

const footerNavItems: NavItem[] = [];

// Define the menu structure interface
interface MenuStructure {
    [platformKey: string]: {
        platform_name: string;
        menu: {
            [menuKey: string]: {
                id: number;
                name: string;
                slug: string;
                permission: string[];
            };
        };
    };
}

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
    },
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
    {
        title: 'Overtime Requests',
        href: route('overtime-requests.index'),
        icon: Clock,
    },
    {
        title: 'Overtime Pending for Approval',
        href: route('overtime-requests.pending-approvals'),
        icon: Clock,
    },
    {
        title: 'Users',
        href: route('users.index'),
        icon: Users,
    },
];

export function UserSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <ApplicationLogo variant="light" className="h-10 w-auto" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavGroup items={adminNavItems} title="App" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

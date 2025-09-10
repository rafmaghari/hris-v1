import ApplicationLogo from '@/components/applicationLogo';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { hasRole } from '@/lib/roles';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarClock, Clock, LayoutGrid } from 'lucide-react';
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

export function UserSidebar() {
    const { overtimeCounts } = usePage<SharedData>().props;

    const adminNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutGrid,
        },
        {
            title: 'My Overtime Requests',
            href: route('overtime-requests.index'),
            icon: Clock,
            badge: overtimeCounts?.myPendingRequests && overtimeCounts.myPendingRequests > 0 ? overtimeCounts.myPendingRequests : undefined,
        },
        // Only show "Overtime for Approval" if user is a manager or has pending approvals
        ...(hasRole('manager') || (overtimeCounts?.pendingApprovals && overtimeCounts.pendingApprovals > 0)
            ? [
                  {
                      title: 'Overtime for Approval',
                      href: route('overtime-requests.pending-approvals'),
                      icon: CalendarClock,
                      badge: overtimeCounts?.pendingApprovals && overtimeCounts.pendingApprovals > 0 ? overtimeCounts.pendingApprovals : undefined,
                  },
              ]
            : []),
    ];

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

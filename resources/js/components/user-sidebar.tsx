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
    const { overtimeCounts, leaveRequestCounts } = usePage<SharedData>().props;

    // Dashboard navigation
    const dashboardNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutGrid,
        },
    ];

    // My requests navigation
    const myRequestsNavItems: NavItem[] = [
        {
            title: 'My Overtime Requests',
            href: route('overtime-requests.index'),
            icon: Clock,
            badge: overtimeCounts?.myPendingRequests && overtimeCounts.myPendingRequests > 0 ? overtimeCounts.myPendingRequests : undefined,
        },
        {
            title: 'My Leave Requests',
            href: route('leave-requests.my-requests'),
            icon: CalendarClock,
            badge:
                leaveRequestCounts?.myPendingRequests && leaveRequestCounts.myPendingRequests > 0 ? leaveRequestCounts.myPendingRequests : undefined,
        },
    ];

    // Approval requests navigation (only for managers or users with pending approvals)
    const approvalNavItems: NavItem[] =
        hasRole('manager') ||
        (overtimeCounts?.pendingApprovals && overtimeCounts.pendingApprovals > 0) ||
        (leaveRequestCounts?.pendingApprovals && leaveRequestCounts.pendingApprovals > 0)
            ? [
                  {
                      title: 'Overtime for Approval',
                      href: route('overtime-requests.pending-approvals'),
                      icon: Clock,
                      badge: overtimeCounts?.pendingApprovals && overtimeCounts.pendingApprovals > 0 ? overtimeCounts.pendingApprovals : undefined,
                  },
                  {
                      title: 'Leave Requests for Approval',
                      href: route('leave-requests.pending-approvals'),
                      icon: CalendarClock,
                      badge:
                          leaveRequestCounts?.pendingApprovals && leaveRequestCounts.pendingApprovals > 0
                              ? leaveRequestCounts.pendingApprovals
                              : undefined,
                  },
              ]
            : [];

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
                <NavGroup items={dashboardNavItems} title="Overview" />
                <NavGroup items={myRequestsNavItems} title="My Requests" />
                {approvalNavItems.length > 0 && <NavGroup items={approvalNavItems} title="Approvals" />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

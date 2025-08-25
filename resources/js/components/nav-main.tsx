import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

// Helper function to normalize URLs for comparison
function normalizeUrl(url: string): string {
    // Remove protocol and domain if present
    const path = url.replace(/^(https?:\/\/[^/]+)?/, '');
    // Remove trailing slashes and convert to lowercase
    return path.replace(/\/+$/, '').toLowerCase();
}

export function NavGroup({ items = [], title = '' }: { items: NavItem[]; title: string }) {
    const page = usePage();
    const currentUrl = normalizeUrl(page.url);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const itemUrl = normalizeUrl(item.href);
                    const isActive = currentUrl === itemUrl;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
